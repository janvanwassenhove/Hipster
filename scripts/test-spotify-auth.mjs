/**
 * Regression checks for the Spotify session handling in src/services/spotify.ts.
 *
 * These cover the scenarios that used to force players (especially on
 * iPad/iPhone/Android) to log in to Spotify again after one or two songs:
 * an expired access token, a refresh racing with itself, a flaky network,
 * returning to the tab from the Spotify app, and a 401 mid-game.
 *
 * Run with: npm run test:auth
 */
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = await mkdtemp(join(tmpdir(), 'hipster-auth-'))
const outfile = join(outDir, 'spotify.mjs')

await build({
  entryPoints: [join(projectRoot, 'src/services/spotify.ts')],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  alias: { '@': join(projectRoot, 'src') },
  absWorkingDir: projectRoot,
  outfile,
  logLevel: 'silent'
})

// --- Browser stubs -------------------------------------------------------
const store = new Map()
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
  clear: () => store.clear()
}
globalThis.sessionStorage = globalThis.localStorage

const listeners = {}
const addListener = (e, cb) => (listeners[e] = [...(listeners[e] || []), cb])
globalThis.document = { hidden: false, title: 'test', addEventListener: addListener }
globalThis.window = {
  location: { origin: 'https://example.github.io', search: '', pathname: '/Hipster/' },
  history: { replaceState() {} },
  addEventListener: addListener,
  crypto: { subtle: { digest: async () => new Uint8Array(32).buffer } }
}
Object.defineProperty(globalThis, 'navigator', {
  value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari' },
  configurable: true
})

const fire = async event => {
  for (const cb of listeners[event] || []) await cb()
}

const freshTokenResponse = () =>
  new Response(
    JSON.stringify({ access_token: 'fresh-token', expires_in: 3600, refresh_token: 'rotated-refresh' }),
    { status: 200 }
  )

let tokenCalls = 0
let apiCalls = []
let tokenResponder = freshTokenResponse

globalThis.fetch = async (url, init = {}) => {
  if (String(url).includes('accounts.spotify.com/api/token')) {
    tokenCalls++
    return tokenResponder()
  }
  apiCalls.push({ url: String(url), auth: new Headers(init.headers).get('Authorization') })
  return new Response(JSON.stringify({ devices: [] }), { status: 200 })
}

const results = []
const check = (name, condition, detail = '') => {
  results.push({ name, pass: !!condition })
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`)
}

// Each scenario gets a pristine service instance with its own stored state.
async function freshService(storedAuth) {
  store.clear()
  tokenCalls = 0
  apiCalls = []
  for (const key of Object.keys(listeners)) delete listeners[key]
  if (storedAuth) store.set('spotify_auth', JSON.stringify(storedAuth))
  const module = await import(`${outfile}?${results.length}-${Math.random()}`)
  return module.spotifyService
}

const settle = () => new Promise(r => setTimeout(r, 50))
const expiredSession = {
  accessToken: 'old-token',
  refreshToken: 'r1',
  expiresAt: Date.now() - 60_000,
  isAuthenticated: true
}

// 1. An expired access token must never end the session on its own.
{
  const spotify = await freshService(expiredSession)
  check('expired access token keeps the session', spotify.isAuthenticated())
  await settle()
  check('  refresh token is kept and rotated', store.get('spotify_refresh_token') === 'rotated-refresh')
  check('  refreshed exactly once', tokenCalls === 1, `calls=${tokenCalls}`)
}

// 2. Spotify invalidates the old refresh token on every PKCE refresh, so
//    parallel refreshes would kill the session. They must be coalesced.
{
  const spotify = await freshService(expiredSession)
  tokenCalls = 0
  await Promise.all([
    spotify.getAvailableDevices(),
    spotify.getAvailableDevices(),
    spotify.getSpotifyConnectState(),
    spotify.maintainActiveSession()
  ])
  check('concurrent calls share a single refresh', tokenCalls <= 1, `calls=${tokenCalls}`)
  check(
    '  every request carries the fresh token',
    apiCalls.length > 0 && apiCalls.every(c => c.auth === 'Bearer fresh-token')
  )
}

// 3. A dropped mobile connection must not log the player out.
{
  const spotify = await freshService(expiredSession)
  await settle()
  tokenResponder = () => {
    throw new TypeError('Failed to fetch')
  }
  store.set('spotify_auth', JSON.stringify({ ...expiredSession, refreshToken: 'rotated-refresh' }))
  await spotify.getAvailableDevices()
  check('network failure during refresh keeps the session', spotify.isAuthenticated())
  check('  refresh token survives the failure', !!store.get('spotify_refresh_token'))
  tokenResponder = freshTokenResponse
}

// 4. A refresh token Spotify actually rejected does end the session.
{
  tokenResponder = () => new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 })
  const spotify = await freshService(expiredSession)
  await settle()
  check('invalid_grant clears the session', !spotify.isAuthenticated())
  check('  stored credentials removed', !store.get('spotify_refresh_token') && !store.get('spotify_auth'))
  tokenResponder = freshTokenResponse
}

// 5. Returning from the Spotify app fires visibilitychange *and* focus.
{
  const spotify = await freshService({ ...expiredSession, expiresAt: Date.now() + 60_000 })
  await settle()
  tokenCalls = 0
  await fire('visibilitychange')
  await fire('focus')
  await settle()
  check('resume refreshes at most once', tokenCalls <= 1, `calls=${tokenCalls}`)
  check('  still authenticated after resume', spotify.isAuthenticated())
}

// 6. A 401 mid-game is recovered transparently instead of asking for a login.
{
  const spotify = await freshService({
    accessToken: 'valid',
    refreshToken: 'r1',
    expiresAt: Date.now() + 3_600_000,
    isAuthenticated: true
  })
  let served401 = false
  globalThis.fetch = async (url, init = {}) => {
    if (String(url).includes('accounts.spotify.com/api/token')) {
      tokenCalls++
      return tokenResponder()
    }
    apiCalls.push({ url: String(url), auth: new Headers(init.headers).get('Authorization') })
    if (!served401) {
      served401 = true
      return new Response('{"error":{"status":401}}', { status: 401 })
    }
    return new Response(JSON.stringify({ devices: [{ id: 'd1', name: 'Phone', is_active: true }] }), { status: 200 })
  }
  const devices = await spotify.getAvailableDevices()
  check('401 is recovered by refresh + retry', devices.length === 1, `devices=${devices.length}`)
  check('  retry used the new token', apiCalls.at(-1).auth === 'Bearer fresh-token')
  check('  session intact', spotify.isAuthenticated())
}

await rm(outDir, { recursive: true, force: true })

const failed = results.filter(r => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
