import CryptoJS from 'crypto-js'
import type { Track, SpotifyAuthState, SpotifyRecommendationsResponse, SpotifySearchResponse, Theme } from '@/types'
import songsData from '@/data/songs_by_category.json'

// Spotify API configuration
const SPOTIFY_CLIENT_ID = '67125c0389b247c1b3b221ff4a5fb2ef' // Replace with your Spotify Client ID
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/Hipster/`
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-top-read user-library-read streaming user-read-playback-state user-modify-playback-state user-read-currently-playing'

// Storage keys. The refresh token is stored separately from the rest of the auth
// state so it survives even if the access token part is cleared or corrupted.
const AUTH_STORAGE_KEY = 'spotify_auth'
const REFRESH_TOKEN_STORAGE_KEY = 'spotify_refresh_token'

// Refresh the access token this long before it actually expires
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000

// Session diagnostics. Records *why* a session ended plus a short trail of the
// auth events leading up to it, so a re-login report from a phone or tablet can
// be diagnosed from the Settings screen instead of guessed at. Never contains
// tokens - only event names, HTTP statuses and Spotify's own error codes.
const DIAGNOSTICS_STORAGE_KEY = 'spotify_diagnostics'
const MAX_DIAGNOSTIC_EVENTS = 25

export interface SpotifyDiagnosticEvent {
  at: string
  event: string
  detail?: string
}

export interface SpotifyDiagnostics {
  lastSessionEnd: SpotifyDiagnosticEvent | null
  events: SpotifyDiagnosticEvent[]
}

interface SongData {
  jaar: number
  uitvoerder: string
  titel: string
  uri?: string
}

interface SpotifyPlayer {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(event: string, callback: (...args: any[]) => void): void
  removeListener(event: string, callback?: (...args: any[]) => void): void
  getCurrentState(): Promise<any>
  setName(name: string): Promise<void>
  getVolume(): Promise<number>
  setVolume(volume: number): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  togglePlay(): Promise<void>
  seek(position: number): Promise<void>
  previousTrack(): Promise<void>
  nextTrack(): Promise<void>
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (callback: (token: string) => void) => void
        volume?: number
      }) => SpotifyPlayer
    }
  }
}

class SpotifyService {
  private authState: SpotifyAuthState = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false
  }
  
  private player: SpotifyPlayer | null = null
  private deviceId: string | null = null
  private playerReady = false // Add this property
  private currentTrackUri: string | null = null
  private isAuthenticating = false
  private playerInitializationAttempted = false
  private lastTokenRefresh = 0 // Timestamp of the last refresh attempt
  private refreshPromise: Promise<boolean> | null = null // Single-flight guard for token refresh
  private refreshFailureCount = 0 // Backoff counter for transient refresh failures
  private lastResumeHandled = 0 // Debounce for visibilitychange/focus firing together
  private permissionErrorDetected = false // Set when Spotify reports a missing scope
  private sessionMaintenanceInterval: number | null = null // For mobile session maintenance
  private tokenRefreshTimeout: number | null = null // For automatic token refresh

  constructor() {
    this.loadAuthState()

    // Set up SDK ready callback
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('✅ Spotify Web Playback SDK loaded and ready')
      this.initializeWebPlaybackSDK()
    }
    
    // If SDK is already loaded, initialize immediately
    if (window.Spotify) {
      console.log('✅ Spotify Web Playback SDK already loaded')
      this.initializeWebPlaybackSDK()
    }

    // Restore the session (refresh the access token if needed) and keep it fresh
    if (this.isAuthenticated()) {
      void this.ensureValidToken()
      this.startTokenRefreshTimer()
    }

    // Set up visibility change handler for session management
    this.setupVisibilityChangeHandler()
  }

  // Set up visibility/focus handlers.
  //
  // This matters most on mobile: as soon as the browser tab is backgrounded
  // (e.g. the user switches to the Spotify app), timers are throttled or frozen
  // entirely, so the scheduled token refresh never fires. When the user comes
  // back we therefore refresh the token immediately instead of relying on the
  // timer, and we reschedule it.
  private setupVisibilityChangeHandler(): void {
    const isMobile = this.isMobileDevice()

    const handleResume = async () => {
      // visibilitychange and focus both fire when returning to the tab; make
      // sure we only run one recovery pass (concurrent refreshes would race).
      const now = Date.now()
      if (now - this.lastResumeHandled < 3000) {
        return
      }
      this.lastResumeHandled = now

      if (!this.isAuthenticated()) {
        return
      }

      console.log('🔄 App resumed - restoring Spotify session...')

      // Only worth recording when the resume actually had work to do - a
      // resume with a healthy token would just crowd out the useful entries.
      const tokenNeedsWork = !this.authState.accessToken ||
        !this.authState.expiresAt ||
        Date.now() >= this.authState.expiresAt - TOKEN_REFRESH_MARGIN_MS
      if (tokenNeedsWork) {
        this.record('app_resume_needed_refresh')
      }

      // Timers were frozen while hidden: refresh now and reschedule.
      await this.ensureValidToken()
      this.startTokenRefreshTimer()

      if (isMobile) {
        await this.maintainActiveSession()
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        void handleResume()
      }
    })

    window.addEventListener('focus', () => {
      void handleResume()
    })

    // Persist state before the page is frozen/unloaded so a mobile tab eviction
    // never loses the refresh token.
    window.addEventListener('pagehide', () => {
      if (this.authState.refreshToken || this.authState.accessToken) {
        this.saveAuthState()
      }
    })
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|CriOS/i.test(navigator.userAgent)
  }

  // --- Session diagnostics -------------------------------------------------

  private readDiagnostics(): SpotifyDiagnostics {
    const empty: SpotifyDiagnostics = { lastSessionEnd: null, events: [] }
    const stored = localStorage.getItem(DIAGNOSTICS_STORAGE_KEY)
    if (!stored) {
      return empty
    }

    try {
      const parsed = JSON.parse(stored)
      return {
        lastSessionEnd: parsed?.lastSessionEnd ?? null,
        events: Array.isArray(parsed?.events) ? parsed.events : []
      }
    } catch {
      return empty
    }
  }

  private record(event: string, detail?: string): void {
    try {
      const diagnostics = this.readDiagnostics()
      const entry: SpotifyDiagnosticEvent = {
        at: new Date().toISOString(),
        event,
        ...(detail ? { detail: detail.slice(0, 200) } : {})
      }

      diagnostics.events = [...diagnostics.events, entry].slice(-MAX_DIAGNOSTIC_EVENTS)
      if (event === 'session_end') {
        diagnostics.lastSessionEnd = entry
      }

      localStorage.setItem(DIAGNOSTICS_STORAGE_KEY, JSON.stringify(diagnostics))
    } catch (error) {
      // Diagnostics must never break playback (e.g. storage full or disabled)
      console.warn('Could not record Spotify diagnostic:', error)
    }
  }

  // Everything the app knows about why the Spotify session ended, for support.
  getDiagnostics(): SpotifyDiagnostics {
    return this.readDiagnostics()
  }

  clearDiagnostics(): void {
    localStorage.removeItem(DIAGNOSTICS_STORAGE_KEY)
  }

  // Generate PKCE code verifier and challenge
  private generateCodeVerifier(): string {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64url)
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  // Start Spotify OAuth flow with PKCE
  async initiateLogin(): Promise<void> {
    // Prevent duplicate login attempts
    if (this.isAuthenticating) {
      console.log('Authentication already in progress, skipping...')
      return
    }
    
    // Check if already authenticated with sufficient token time remaining
    if (this.authState.accessToken && this.authState.expiresAt && Date.now() < this.authState.expiresAt - 600000) {
      console.log('Already authenticated with valid token, skipping login...')
      return
    }

    // We may still hold a refresh token (e.g. the access token simply expired
    // while the app was in the background). Recover silently instead of sending
    // the user through the whole OAuth redirect again.
    if (this.authState.refreshToken) {
      console.log('🔄 Refresh token available - attempting silent re-authentication...')
      if (await this.refreshAccessToken()) {
        console.log('✅ Silent re-authentication successful, no login needed')
        this.startTokenRefreshTimer()
        await this.initializePlayerAfterAuth()
        return
      }
      console.log('⚠️ Silent re-authentication failed, falling back to full login')
    }

    this.isAuthenticating = true
    
    try {
      const codeVerifier = this.generateCodeVerifier()
      const codeChallenge = await this.generateCodeChallenge(codeVerifier)
      
      localStorage.setItem('spotify_code_verifier', codeVerifier)
      console.log('Initiating Spotify OAuth with scopes:', SPOTIFY_SCOPES)
      console.log('Spotify redirect URI:', SPOTIFY_REDIRECT_URI)

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: SPOTIFY_SCOPES,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        state: Math.random().toString(36).substring(7),
        show_dialog: 'false' // Don't always show the dialog, allow auto-approval
      })

      window.location.href = `https://accounts.spotify.com/authorize?${params}`
    } finally {
      this.isAuthenticating = false
    }
  }

  // Handle OAuth callback
  async handleCallback(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')

    if (error) {
      console.error('Spotify auth error:', error, errorDescription)
      
      // Show user-friendly error message
      if (error === 'invalid_client') {
        alert(`Spotify configuration error: Invalid redirect URI. 
Please make sure ${SPOTIFY_REDIRECT_URI} is added to your Spotify app settings.`)
      } else {
        alert(`Spotify login failed: ${errorDescription || error}`)
      }
      
      return false
    }

    if (!code) {
      return false
    }

    const codeVerifier = localStorage.getItem('spotify_code_verifier')
    if (!codeVerifier) {
      console.error('No code verifier found')
      return false
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          code_verifier: codeVerifier,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const data = await response.json()
      
      this.authState = {
        accessToken: data.access_token,
        // Keep the previous refresh token if Spotify does not return a new one
        refreshToken: data.refresh_token ?? this.authState.refreshToken,
        expiresAt: Date.now() + (data.expires_in * 1000),
        isAuthenticated: true
      }

      this.saveAuthState()
      localStorage.removeItem('spotify_code_verifier')
      this.refreshFailureCount = 0
      this.record('login_complete')
      this.startTokenRefreshTimer()

      // Initialize player now that we're authenticated
      await this.initializePlayerAfterAuth()

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      
      return true
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return false
    }
  }

  // Refresh access token.
  //
  // Spotify rotates refresh tokens on every PKCE refresh: the old token is
  // invalidated as soon as a new one is issued. Two concurrent refreshes would
  // therefore make the loser fail with invalid_grant and kill the session, so
  // all callers share a single in-flight request.
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      return false
    }

    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Back off after transient failures (offline, flaky mobile network) instead
    // of hammering the token endpoint on every API call.
    if (this.refreshFailureCount > 0) {
      const backoff = Math.min(30000, 2000 * Math.pow(2, this.refreshFailureCount - 1))
      if (Date.now() - this.lastTokenRefresh < backoff) {
        return false
      }
    }

    this.refreshPromise = this.performTokenRefresh()
    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    const refreshToken = this.authState.refreshToken
    if (!refreshToken) {
      return false
    }

    this.lastTokenRefresh = Date.now()

    let response: Response
    try {
      response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: SPOTIFY_CLIENT_ID,
        }),
      })
    } catch (error) {
      // Network error: the refresh token is still perfectly valid, so keep it
      // and try again later. Never log the user out over a dropped connection.
      this.refreshFailureCount++
      this.record('refresh_failed_network', `attempt ${this.refreshFailureCount}`)
      console.warn('⚠️ Token refresh failed (network) - keeping session, will retry:', error)
      return false
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')

      if (this.isPermanentRefreshFailure(response.status, errorText)) {
        console.error('❌ Refresh token was rejected by Spotify, re-authentication required:', errorText)
        this.clearSession('refresh_token_rejected', `${response.status} ${errorText}`)
        return false
      }

      // 429 / 5xx / anything else transient: keep the refresh token.
      this.refreshFailureCount++
      this.record('refresh_failed_http', `${response.status}, attempt ${this.refreshFailureCount}`)
      console.warn(`⚠️ Token refresh failed (${response.status}) - keeping session, will retry`)
      return false
    }

    try {
      const data = await response.json()

      this.authState.accessToken = data.access_token
      this.authState.expiresAt = Date.now() + (data.expires_in * 1000)
      this.authState.isAuthenticated = true

      // Spotify usually returns a rotated refresh token - persist it right away.
      if (data.refresh_token) {
        this.authState.refreshToken = data.refresh_token
      }

      this.saveAuthState()
      const hadFailures = this.refreshFailureCount
      this.refreshFailureCount = 0
      this.record('refresh_ok', hadFailures ? `after ${hadFailures} failed attempt(s)` : undefined)
      console.log('✅ Token refreshed successfully')
      this.startTokenRefreshTimer()
      return true
    } catch (error) {
      this.refreshFailureCount++
      this.record('refresh_response_unreadable')
      console.warn('⚠️ Could not parse token refresh response - keeping session:', error)
      return false
    }
  }

  // Only a definitive rejection of the refresh token itself should end the
  // session. Everything else is retryable.
  private isPermanentRefreshFailure(status: number, body: string): boolean {
    if (status !== 400 && status !== 401) {
      return false
    }

    try {
      const parsed = JSON.parse(body)
      const error = parsed?.error
      return error === 'invalid_grant' || error === 'invalid_client' || error === 'unauthorized_client'
    } catch {
      return /invalid_grant|invalid_client|unauthorized_client/.test(body)
    }
  }

  // Check if token is valid and refresh if needed
  private async ensureValidToken(): Promise<boolean> {
    const hasUsableToken = !!this.authState.accessToken &&
      !!this.authState.expiresAt &&
      Date.now() < this.authState.expiresAt - TOKEN_REFRESH_MARGIN_MS

    if (hasUsableToken) {
      return true
    }

    if (this.authState.refreshToken) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        return true
      }
      // Refresh did not go through (transient failure or backoff): the current
      // access token may still work for a while, so let the caller try it.
      return !!this.authState.accessToken &&
        (!this.authState.expiresAt || Date.now() < this.authState.expiresAt)
    }

    return !!this.authState.accessToken
  }

  // Authenticated fetch against the Spotify Web API.
  //
  // Every authenticated request goes through here so the token is always
  // guaranteed fresh and a 401 transparently triggers one refresh + retry
  // instead of bubbling up as "please log in again".
  private async authFetch(url: string, init: RequestInit = {}, allowRetry = true): Promise<Response> {
    await this.ensureValidToken()

    const headers = new Headers(init.headers || {})
    headers.set('Authorization', `Bearer ${this.authState.accessToken ?? ''}`)

    const response = await fetch(url, { ...init, headers })

    if (response.status === 401 && allowRetry && this.authState.refreshToken) {
      console.log('🔄 Got 401 from Spotify - refreshing token and retrying once')
      if (await this.refreshAccessToken()) {
        this.record('api_401_recovered', this.endpointLabel(url))
        return this.authFetch(url, init, false)
      }
      this.record('api_401_not_recovered', this.endpointLabel(url))
    }

    // A missing scope is the only case where re-running the OAuth flow actually
    // helps; remember it so the UI can ask instead of guessing.
    if (response.status === 403) {
      const body = await response.clone().text().catch(() => '')
      if (/insufficient client scope/i.test(body)) {
        console.warn('⚠️ Spotify reported insufficient scope - re-authorization required')
        if (!this.permissionErrorDetected) {
          this.record('scope_error', this.endpointLabel(url))
        }
        this.permissionErrorDetected = true
      }
    }

    return response
  }

  // Endpoint path only - never the query string, which can carry identifiers.
  private endpointLabel(url: string): string {
    const path = url.split('?')[0]
    return path.replace('https://api.spotify.com/v1', '')
  }

  // True only when Spotify explicitly rejected a request for missing scopes.
  needsPermissionUpgrade(): boolean {
    return this.permissionErrorDetected
  }

  // Make authenticated API request
  private async apiRequest(endpoint: string): Promise<any> {
    console.log('Making Spotify API request to:', endpoint)

    const response = await this.authFetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify API error:', response.status, errorText)

      if (response.status === 401) {
        // authFetch already refreshed and retried once.
        throw new Error('Authentication required')
      }
      throw new Error(`Spotify API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Spotify API response successful, data keys:', Object.keys(data))
    return data
  }

  private async searchSpotifyForTrack(song: SongData): Promise<any> {
    if (!this.isAuthenticated()) return null
    
    try {
      const query = `track:"${song.titel}" artist:"${song.uitvoerder}"`
      const response = await this.authFetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`)
      
      if (response.ok) {
        const data = await response.json()
        return data.tracks.items[0] || null
      }
    } catch (error) {
      console.warn('Failed to search Spotify for track:', error)
    }
    
    return null
  }

  private async convertSongToTrack(song: SongData): Promise<Track> {
    // Try to get real Spotify data first
    const spotifyTrack = await this.searchSpotifyForTrack(song)
    
    if (spotifyTrack?.album?.images?.length > 0) {
      // Use real Spotify album images
      return {
        id: `demo-${song.titel}-${song.uitvoerder}`,
        name: song.titel,
        artists: [{ name: song.uitvoerder, id: 'demo-artist', external_urls: { spotify: '' } }],
        album: {
          id: spotifyTrack.album.id,
          name: spotifyTrack.album.name,
          images: spotifyTrack.album.images, // Real Spotify images!
          release_date: song.jaar.toString(),
          release_date_precision: 'year'
        },
        release_date: `${song.jaar}-01-01`,
        year: song.jaar,
        external_urls: spotifyTrack.external_urls || { spotify: '' },
        images: spotifyTrack.album.images || [], // Use album images for track images
        revealed: false,
        uri: song.uri
      }
    }
    
    // Fallback to generated SVG if Spotify search fails
    const artistColors = [
      '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#F97316', '#EC4899', '#6366F1', '#84CC16', '#06B6D4'
    ]
    const colorIndex = song.uitvoerder.length % artistColors.length
    const color = artistColors[colorIndex]

    return {
      id: `song-${song.jaar}-${song.uitvoerder.replace(/\s+/g, '-')}-${song.titel.replace(/\s+/g, '-')}`,
      name: song.titel,
      artists: [{
        id: `artist-${song.uitvoerder.replace(/\s+/g, '-')}`,
        name: song.uitvoerder,
        external_urls: { spotify: '' }
      }],
      album: {
        id: `album-${song.jaar}-${song.titel.replace(/\s+/g, '-')}`,
        name: song.titel,
        release_date: `${song.jaar}-01-01`,
        release_date_precision: 'year',
        images: [
          { url: `data:image/svg+xml;base64,${btoa(`<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="${color}"/><text x="150" y="150" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${song.uitvoerder}</text></svg>`)}`, height: 300, width: 300 },
          { url: `data:image/svg+xml;base64,${btoa(`<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${color}"/><text x="32" y="32" font-family="Arial" font-size="8" fill="white" text-anchor="middle" dominant-baseline="middle">${song.uitvoerder.substring(0, 8)}</text></svg>`)}`, height: 64, width: 64 }
        ]
      },
      external_urls: { spotify: '' },
      release_date: `${song.jaar}-01-01`,
      year: song.jaar,
      revealed: false, // Album cover hidden until final placement
      images: [
        { url: `data:image/svg+xml;base64,${btoa(`<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="${color}"/><text x="150" y="150" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${song.uitvoerder}</text></svg>`)}`, height: 300, width: 300 },
        { url: `data:image/svg+xml;base64,${btoa(`<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${color}"/><text x="32" y="32" font-family="Arial" font-size="8" fill="white" text-anchor="middle" dominant-baseline="middle">${song.uitvoerder.substring(0, 8)}</text></svg>`)}`, height: 64, width: 64 }
      ],
      uri: song.uri // Include Spotify URI from JSON data
    }
  }

  // Get tracks from JSON data based on theme
  private async getTracksFromJson(theme?: Theme, limit: number = 50): Promise<Track[]> {
    console.log('Getting tracks from JSON for theme:', theme)
    
    let categoryData: SongData[] = []
    
    // Direct 1:1 mapping to JSON categories
    const themeMapping: Record<Theme, keyof typeof songsData> = {
      'guilty-pleasures': 'guilty-pleasures',
      'belgian': 'belgian',
      'classics': 'classics',
      'popular': 'popular',
      'vlaams': 'vlaams',
      'pop-rock': 'pop-rock'
    }
    
    if (theme && themeMapping[theme]) {
      const category = themeMapping[theme]
      console.log('Mapped theme to category:', theme, '->', category)
      categoryData = songsData[category] || []
      console.log(`Found ${categoryData.length} songs in category: ${category}`)
    } else {
      console.log('No theme provided or theme not found, using all categories')
      // Mix from all categories
      const allCategories = Object.values(songsData).flat()
      categoryData = allCategories
      console.log(`Using all categories, found ${categoryData.length} total songs`)
    }
    
    if (categoryData.length === 0) {
      console.warn('No songs found for theme, falling back to popular')
      categoryData = songsData.popular || []
    }
    
    // Shuffle and limit
    const shuffled = [...categoryData].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, limit)
    
    console.log(`Selected ${selected.length} songs for theme: ${theme}`)
    
    return Promise.all(selected.map(song => this.convertSongToTrack(song)))
  }

  // Get recommendations based on theme
  async getRecommendations(theme?: Theme, limit: number = 50): Promise<Track[]> {
    let jsonResults: Track[] = []
    
    try {
      // Get tracks from JSON data first
      jsonResults = await this.getTracksFromJson(theme, Math.floor(limit * 0.7))
      console.log(`Found ${jsonResults.length} tracks from JSON data`)

      // If we need more tracks and user is authenticated, supplement with Spotify API
      if (jsonResults.length < limit && this.isAuthenticated() && theme && theme.trim()) {
        try {
          const remainingLimit = limit - jsonResults.length
          const encodedQuery = encodeURIComponent(theme.trim())
          const searchResponse = await this.apiRequest(`/search?q=${encodedQuery}&type=track&limit=${remainingLimit}`)
          
          if (searchResponse.tracks?.items) {
            const spotifyTracks = searchResponse.tracks.items
              .filter((track: any) => track && track.name && track.artists)
              .map((track: any) => ({
                ...track,
                year: track.album?.release_date ? new Date(track.album.release_date).getFullYear() : new Date().getFullYear(),
                revealed: false,
                images: track.album?.images || []
              }))
            
            console.log(`Found ${spotifyTracks.length} additional tracks from Spotify API`)
            return [...jsonResults, ...spotifyTracks]
          }
        } catch (error) {
          console.warn('Spotify search failed, using only JSON results:', error)
        }
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
    }
    
    // Always return an array, even if empty
    return jsonResults
  }

  // Get available genres from Spotify
  private async getAvailableGenres(): Promise<string[]> {
    try {
      const data = await this.apiRequest('/recommendations/available-genre-seeds')
      return data.genres || []
    } catch (error) {
      console.error('Error getting available genres:', error)
      // Return common genres as fallback
      return ['pop', 'rock', 'hip-hop', 'electronic', 'country', 'jazz', 'classical', 'alternative', 'indie', 'dance']
    }
  }

  // Fallback method using simple search queries
  private async getFallbackTracks(limit: number = 20): Promise<Track[]> {
    try {
      console.log('Trying fallback: simple search queries')
      
      // Use simple, popular search terms that should always return results
      const searchQueries = [
        'the',
        'love',
        'time',
        'song',
        'night',
        'day',
        'you',
        'me',
        'one',
        'way'
      ]
      
      const allTracks: Track[] = []
      
      for (const query of searchQueries) {
        if (allTracks.length >= limit) break
        
        try {
          const tracks = await this.searchTracks(query, Math.min(5, limit - allTracks.length))
          if (tracks.length > 0) {
            allTracks.push(...tracks)
            console.log(`Found ${tracks.length} tracks for query: ${query}`)
          }
        } catch (error) {
          console.warn('Search query failed:', query, error)
        }
      }
      
      // If still no tracks, try very basic queries
      if (allTracks.length === 0) {
        console.log('Trying even simpler queries')
        const basicQueries = ['a', 'e', 'i', 'o', 'u']
        
        for (const query of basicQueries) {
          if (allTracks.length >= limit) break
          
          try {
            const tracks = await this.searchTracks(query, 5)
            if (tracks.length > 0) {
              allTracks.push(...tracks)
              console.log(`Found ${tracks.length} tracks for basic query: ${query}`)
              break // Stop after first successful query
            }
          } catch (error) {
            console.warn('Basic search query failed:', query, error)
          }
        }
      }
      
      // If still no tracks, return empty array
      if (allTracks.length === 0) {
        console.warn('All Spotify API calls failed, no tracks available')
        return []
      }
      
      console.log(`Total tracks found in fallback: ${allTracks.length}`)
      
      // Shuffle and return requested amount
      const shuffled = allTracks.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, limit)
    } catch (error) {
      console.error('All fallback methods failed:', error)
      return []
    }
  }

  // Get tracks from featured playlists as another fallback
  private async getTracksFromFeaturedPlaylists(limit: number = 20): Promise<Track[]> {
    try {
      // Get featured playlists
      const playlistsData = await this.apiRequest('/browse/featured-playlists?limit=10')
      
      if (!playlistsData.playlists || !playlistsData.playlists.items) {
        return []
      }
      
      const allTracks: Track[] = []
      
      // Get tracks from first few playlists
      for (const playlist of playlistsData.playlists.items.slice(0, 3)) {
        if (allTracks.length >= limit) break
        
        try {
          const tracksData = await this.apiRequest(`/playlists/${playlist.id}/tracks?limit=20&market=US`)
          
          if (tracksData.items) {
            const playlistTracks = tracksData.items
              .filter((item: any) => item.track && item.track.album)
              .map((item: any) => ({
                ...item.track,
                year: new Date(item.track.album.release_date).getFullYear(),
                revealed: false, // Album cover hidden until final placement
                images: item.track.album.images || []
              }))
            
            allTracks.push(...playlistTracks)
          }
        } catch (error) {
          console.warn('Error getting playlist tracks:', error)
        }
      }
      
      // Shuffle and return requested amount
      const shuffled = allTracks.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, limit)
    } catch (error) {
      console.error('Error getting featured playlist tracks:', error)
      return []
    }
  }

  // Search for tracks
  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    console.log('Searching tracks with query:', query)
    
    // Search in JSON data first
    const allSongs = Object.values(songsData).flat()
    const matchingSongs = allSongs.filter(song => 
      song.titel.toLowerCase().includes(query.toLowerCase()) ||
      song.uitvoerder.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit)
    
    const jsonResults = await Promise.all(matchingSongs.map(song => this.convertSongToTrack(song)))
    
    console.log(`Found ${jsonResults.length} matching tracks in JSON data`)
    
    // If authenticated and want more results, try Spotify API
    if (this.isAuthenticated() && jsonResults.length < limit) {
      try {
        const remainingLimit = limit - jsonResults.length
        const encodedQuery = encodeURIComponent(query)
        const searchResponse = await this.apiRequest(`/search?q=${encodedQuery}&type=track&limit=${remainingLimit}`)
        
        if (searchResponse.tracks?.items) {
          const spotifyTracks = searchResponse.tracks.items
            .filter((track: any) => track && track.name && track.artists)
            .map((track: any) => ({
              ...track,
              year: track.album?.release_date ? new Date(track.album.release_date).getFullYear() : new Date().getFullYear(),
              revealed: false,
              images: track.album?.images || []
            }))
          
          console.log(`Found ${spotifyTracks.length} additional tracks from Spotify API`)
          return [...jsonResults, ...spotifyTracks]
        }
      } catch (error) {
        console.warn('Spotify search failed, using only JSON results:', error)
      }
    }
    
    return jsonResults
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    try {
      return await this.apiRequest('/me')
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Auth state management.
  //
  // This is a pure check with no side effects: it is called from render paths
  // and polling loops. A session counts as authenticated as long as we hold a
  // refresh token, even when the access token has already expired - the token
  // is transparently refreshed by ensureValidToken()/authFetch() on first use.
  isAuthenticated(): boolean {
    if (this.authState.refreshToken) {
      return true
    }

    return !!this.authState.accessToken &&
      (!this.authState.expiresAt || Date.now() < this.authState.expiresAt)
  }

  // Start automatic token refresh timer.
  //
  // Note: on mobile this timer is throttled or frozen entirely while the tab is
  // in the background, so it is only a best-effort mechanism - the resume
  // handler is what actually keeps the session alive there.
  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer()

    if (!this.authState.expiresAt) {
      // No known expiry: refresh right away if we can, which also schedules the
      // next refresh once the new expiry is known.
      if (this.authState.refreshToken) {
        void this.refreshAccessToken()
      }
      return
    }

    const expiresIn = this.authState.expiresAt - Date.now() - TOKEN_REFRESH_MARGIN_MS

    if (expiresIn <= 0) {
      // Token is already expired or about to expire, refresh immediately
      void this.refreshAccessToken()
      return
    }

    console.log(`⏰ Token refresh scheduled in ${Math.round(expiresIn / 1000 / 60)} minutes`)

    this.tokenRefreshTimeout = setTimeout(() => {
      console.log('⏰ Automatic token refresh triggered')
      void this.refreshAccessToken()
    }, expiresIn)
  }

  // Stop automatic token refresh timer
  private stopTokenRefreshTimer(): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout)
      this.tokenRefreshTimeout = null
    }
  }

  // Clear the session. Every call records why, so a forced re-login is always
  // traceable afterwards instead of having to be reproduced.
  private clearSession(reason: string, detail?: string): void {
    this.record('session_end', detail ? `${reason}: ${detail}` : reason)

    this.stopSessionMaintenance()
    this.stopTokenRefreshTimer()

    if (this.player) {
      this.player.disconnect()
      this.player = null
    }

    this.authState = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false
    }

    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)

    this.deviceId = null
    this.currentTrackUri = null
    this.playerReady = false
    this.playerInitializationAttempted = false
    this.isAuthenticating = false
    this.lastTokenRefresh = 0
    this.refreshFailureCount = 0
    this.refreshPromise = null
    this.permissionErrorDetected = false
  }

  // Force logout and clear authentication (user initiated)
  logout(): void {
    console.log('Logging out and clearing Spotify authentication')

    this.clearSession('user_logout')
    localStorage.removeItem('spotify_code_verifier')

    console.log('✅ Successfully logged out')
  }

  // Check if current token has required scopes for playback
  hasPlaybackPermissions(): boolean {
    // Since we can't directly check scopes from the token,
    // we'll try a simple API call to see if we have permissions
    return this.isAuthenticated()
  }

  // Check if we need to re-authenticate (more specific than hasPlaybackPermissions)
  async needsReauth(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return true
    }
    
    try {
      // Try a simple API call that requires the scopes we need
      await this.apiRequest('/me/player')
      return false
    } catch (error: any) {
      console.log('Checking if reauth needed due to API error:', error.message)
      // Only require reauth for specific permission errors, not network or other issues
      if (error.message.includes('403') || error.message.includes('Insufficient client scope')) {
        return true
      }
      return false
    }
  }

  // Force re-authentication with updated scopes
  async forceReauth(): Promise<void> {
    console.log('🔄 Forcing re-authentication with updated scopes')
    // Set a flag to prevent automatic re-login during logout
    const wasAuthenticating = this.isAuthenticating
    this.clearSession('forced_reauth')
    localStorage.removeItem('spotify_code_verifier')
    this.isAuthenticating = wasAuthenticating
    await this.initiateLogin()
  }

  private saveAuthState(): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.authState))

    // Mirror the refresh token separately: it is the only credential that
    // really matters for staying logged in, and it must survive an unexpected
    // reload, a corrupted auth blob, or a cleared access token.
    if (this.authState.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, this.authState.refreshToken)
    }
  }

  private loadAuthState(): void {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        this.authState = {
          accessToken: parsed?.accessToken ?? null,
          refreshToken: parsed?.refreshToken ?? null,
          expiresAt: parsed?.expiresAt ?? null,
          isAuthenticated: !!parsed?.isAuthenticated
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
      }
    }

    // Fall back to the standalone copy of the refresh token
    if (!this.authState.refreshToken && storedRefreshToken) {
      this.authState.refreshToken = storedRefreshToken
    }

    if (!this.authState.refreshToken && !this.authState.accessToken) {
      return
    }

    // An expired access token is NOT a reason to log out: refresh tokens are
    // long lived, so we simply drop the stale access token and let the next
    // request (or the resume handler) refresh it. This is what used to force a
    // new Spotify login every time a mobile browser reloaded the page.
    if (this.authState.expiresAt && Date.now() >= this.authState.expiresAt) {
      if (this.authState.refreshToken) {
        console.log('🔄 Stored access token expired - will refresh with stored refresh token')
        this.authState.accessToken = null
        this.authState.expiresAt = null
        this.authState.isAuthenticated = true
      } else {
        console.log('Stored access token expired and no refresh token available')
        this.clearSession('expired_without_refresh_token')
        return
      }
    }

    this.authState.isAuthenticated = true
    this.saveAuthState()
  }

  initializePlayerIfReady(): void {
    if (!this.isAuthenticated()) {
      console.log('Not authenticated, cannot initialize player')
      return
    }
    
    if (!window.Spotify) {
      console.log('Spotify SDK not loaded yet')
      return
    }
    
    if (this.player) {
      console.log('Player already exists')
      return
    }
    
    if (this.playerInitializationAttempted) {
      console.log('Player initialization already attempted')
      return
    }
    
    console.log('🔄 Initializing player...')
    this.playerInitializationAttempted = true
    this.initializeWebPlaybackSDK()
  }

  // Get tracks directly from Spotify when authenticated (better for audio previews)
  private async getTracksFromSpotify(limit: number = 20): Promise<Track[]> {
    if (!this.isAuthenticated()) {
      return []
    }

    try {
      console.log('Getting tracks directly from Spotify search')
      
      // Use popular search terms to get tracks with preview URLs
      const searchTerms = [
        'year:2000-2020 genre:pop',
        'year:1990-2010 genre:rock', 
        'year:1980-2000 genre:dance',
        'year:2010-2024 genre:hip-hop',
        'year:1970-1990 genre:pop'
      ]
      
      const allTracks: Track[] = []
      
      for (const term of searchTerms) {
        try {
          const searchResponse = await this.apiRequest(`/search?q=${encodeURIComponent(term)}&type=track&limit=${Math.ceil(limit / searchTerms.length)}`)
          
          if (searchResponse.tracks?.items) {
            const tracks = searchResponse.tracks.items
              .filter((item: any) => item.uri && item.album) // Only tracks with URIs (for full playback)
              .map((item: any) => this.convertSpotifyTrackToTrack(item))
            
            allTracks.push(...tracks)
            console.log(`Got ${tracks.length} tracks from Spotify for term: ${term}`)
          }
        } catch (error) {
          console.warn(`Failed to search for term: ${term}`, error)
        }
      }
      
      // Shuffle and limit results
      const shuffled = allTracks.sort(() => Math.random() - 0.5)
      const limited = shuffled.slice(0, limit)
      
      console.log(`Returning ${limited.length} tracks from Spotify with preview URLs`)
      return limited
      
    } catch (error) {
      console.error('Error getting tracks from Spotify:', error)
      return []
    }
  }

  // Convert Spotify API track to our Track format
  private convertSpotifyTrackToTrack(spotifyTrack: any): Track {
    const releaseYear = spotifyTrack.album.release_date 
      ? parseInt(spotifyTrack.album.release_date.split('-')[0]) 
      : new Date().getFullYear()

    return {
      id: spotifyTrack.id,
      name: spotifyTrack.name,
      artists: spotifyTrack.artists.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        external_urls: artist.external_urls
      })),
      album: {
        id: spotifyTrack.album.id,
        name: spotifyTrack.album.name,
        release_date: spotifyTrack.album.release_date,
        release_date_precision: spotifyTrack.album.release_date_precision,
        images: spotifyTrack.album.images || []
      },
      external_urls: spotifyTrack.external_urls,
      release_date: spotifyTrack.album.release_date,
      year: releaseYear,
      revealed: false,
      images: spotifyTrack.album.images || [],
      uri: spotifyTrack.uri // Add Spotify URI for Web Playback
    }
  }

  // Initialize Spotify Web Playback SDK
  private async initializeWebPlaybackSDK() {
    console.log('Initializing Spotify Web Playback SDK...')
    console.log('User Agent:', navigator.userAgent)
    
    // Check if this is a mobile device and skip initialization
    const isMobile = this.isMobileDevice()
    if (isMobile) {
      console.log('📱 Mobile device detected - skipping Web Playback SDK, will use Spotify Connect API only')
      return
    }
    
    if (!window.Spotify) {
      console.error('Spotify Web Playback SDK still not loaded - waiting for SDK ready callback')
      return
    }

    // Only initialize if authenticated
    if (!this.isAuthenticated()) {
      console.log('Not authenticated yet, skipping player initialization')
      return
    }

    try {
      this.player = new window.Spotify.Player({
        name: 'Hipster Music Game',
        getOAuthToken: (cb: (token: string) => void) => {
          // The SDK asks for a token whenever it (re)connects - make sure we
          // hand it a fresh one instead of an expired token.
          void this.ensureValidToken().then(() => {
            const token = this.authState.accessToken
            if (token) {
              cb(token)
            } else {
              console.error('No valid access token available')
            }
          })
        },
        volume: 0.5
      })

      // Add error handlers
      this.player.addListener('initialization_error', ({ message }) => {
        console.error('Spotify initialization error:', message)
      })

      this.player.addListener('authentication_error', ({ message }) => {
        console.error('Spotify authentication error:', message)
      })

      this.player.addListener('account_error', ({ message }) => {
        console.error('Spotify account error:', message)
      })

      this.player.addListener('playback_error', ({ message }) => {
        console.error('Spotify playback error:', message)
      })

      // Ready handler
      this.player.addListener('ready', ({ device_id }) => {
        console.log('✅ Spotify Web Playback SDK ready! Device ID:', device_id)
        this.deviceId = device_id
        this.playerReady = true
      })

      // Not ready handler
      this.player.addListener('not_ready', ({ device_id }) => {
        console.log('❌ Spotify Web Playback SDK not ready. Device ID:', device_id)
        this.playerReady = false
      })

      // Connect the player
      const connected = await this.player.connect()
      console.log('Spotify player connection result:', connected)
      
    } catch (error) {
      console.error('Failed to initialize Spotify Web Playback SDK:', error)
    }
  }

  // Add method to manually initialize when user becomes authenticated
  async initializePlayerAfterAuth(): Promise<void> {
    if (this.isAuthenticated() && window.Spotify && !this.player) {
      console.log('🔄 Initializing player after authentication')
      await this.initializeWebPlaybackSDK()
    }
    
    // Start session maintenance for mobile devices
    this.startSessionMaintenance()
  }

  // Play a track using Spotify Web API (with fallback to Spotify Connect)
  async playTrack(trackUri: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      console.warn('Cannot play track: not authenticated')
      return false
    }

    // Check if we have a valid Web Playback SDK setup
    if (!this.deviceId || !this.isPlayerReady()) {
      console.warn('Web Playback SDK not ready, falling back to Spotify Connect')
      return this.playOnSpotifyConnect(trackUri)
    }

    try {
      console.log('Playing track:', trackUri, 'on device:', this.deviceId)
      
      // Ensure we have a valid token before making the request
      if (!await this.ensureValidToken()) {
        console.error('Failed to ensure valid token')
        return false
      }

      // First, check if our device is still alive by getting device list
      const devices = await this.getAvailableDevices()
      const ourDevice = devices.find(d => d.id === this.deviceId)
      
      if (!ourDevice) {
        console.warn('Web Playback SDK device no longer available, falling back to Spotify Connect')
        return this.playOnSpotifyConnect(trackUri)
      }

      // First, ensure this device is the active device
      console.log('Setting device as active...')
      const transferResponse = await this.authFetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [this.deviceId],
          play: false // Don't start playing yet
        })
      })

      if (!transferResponse.ok && transferResponse.status !== 204) {
        const transferError = await transferResponse.text()
        console.warn('Failed to set active device:', transferResponse.status, transferError)
        
        // If device activation failed, try Spotify Connect
        if (transferResponse.status === 404) {
          console.warn('Device not found, falling back to Spotify Connect')
          return this.playOnSpotifyConnect(trackUri)
        }
      } else {
        console.log('✅ Device set as active')
        // Wait a moment for the device transfer to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Now try to play the track
      console.log('Starting playback...')
      const response = await this.authFetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri]
          // Don't specify device_id here since we just set it as active
        })
      })

      console.log('Play request response status:', response.status)

      if (response.ok || response.status === 204) {
        this.currentTrackUri = trackUri
        console.log('✅ Successfully started playing track')
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to play track:', response.status, errorText)
        
        if (response.status === 401) {
          console.error('❌ Token appears to be invalid or missing permissions')
          console.error('❌ Current scopes may be insufficient - need to re-authenticate')
        }
        
        if (response.status === 403) {
          console.error('❌ Premium subscription required to play full tracks')
        }

        if (response.status === 404) {
          console.error('❌ No active device found - trying Spotify Connect fallback')
          return this.playOnSpotifyConnect(trackUri)
        }
        
        return false
      }
    } catch (error) {
      console.error('Error playing track:', error)
      // Try Spotify Connect as fallback
      console.log('Attempting Spotify Connect fallback...')
      return this.playOnSpotifyConnect(trackUri)
    }
  }

  // Alternative method to play track directly through the Web Playback SDK
  private async playTrackDirectly(trackUri: string): Promise<boolean> {
    if (!this.player) {
      console.error('No player available for direct playback')
      return this.playOnSpotifyConnect(trackUri)
    }

    try {
      console.log('Trying direct playback through Web Playback SDK...')
      
      // Use the Web API to start playback on our specific device
      const response = await this.authFetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: this.deviceId,
          uris: [trackUri]
        })
      })

      if (response.ok || response.status === 204) {
        this.currentTrackUri = trackUri
        console.log('✅ Direct playback successful')
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ Direct playback failed:', response.status, errorText)
        
        // If direct playback fails, try Spotify Connect
        if (response.status === 404) {
          console.log('Device not found, falling back to Spotify Connect')
          return this.playOnSpotifyConnect(trackUri)
        }
        
        return false
      }
    } catch (error) {
      console.error('Error in direct playback:', error)
      return this.playOnSpotifyConnect(trackUri)
    }
  }

  // Method to reactivate Web Playback SDK when it becomes inactive
  async reactivateWebPlaybackSDK(): Promise<boolean> {
    if (!this.player) {
      console.log('No player to reactivate')
      return false
    }

    try {
      console.log('🔄 Attempting to reactivate Web Playback SDK...')
      
      // Disconnect and reconnect the player
      await this.player.disconnect()
      
      // Wait a moment before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reconnect
      const connected = await this.player.connect()
      
      if (connected) {
        console.log('✅ Successfully reactivated Web Playback SDK')
        return true
      } else {
        console.error('❌ Failed to reactivate Web Playback SDK')
        return false
      }
    } catch (error) {
      console.error('Error reactivating Web Playback SDK:', error)
      return false
    }
  }

  // Pause playback (mobile-aware)
  async pausePlayback(): Promise<boolean> {
    const isMobile = this.isMobileDevice()
    
    if (isMobile) {
      console.log('� Mobile: Pausing via Spotify Connect...')
      return this.pauseSpotifyConnect()
    } else {
      console.log('�️ Desktop: Pausing via Web Playback SDK...')
      // Use Web Playback SDK for desktop
      if (!this.player) {
        console.log('🔄 No Web Playback SDK player, trying Spotify Connect...')
        return this.pauseSpotifyConnect()
      }

      try {
        await this.player.pause()
        console.log('✅ Desktop: Web Playback SDK pause successful')
        return true
      } catch (error) {
        console.error('❌ Desktop: Web Playback SDK pause failed:', error)
        // Fallback to Spotify Connect
        console.log('🔄 Desktop: Trying Spotify Connect pause as fallback...')
        return this.pauseSpotifyConnect()
      }
    }
  }

  // Resume playback
  async resumePlayback(): Promise<boolean> {
    if (!this.player) return false

    try {
      await this.player.resume()
      return true
    } catch (error) {
      console.error('Error resuming playback:', error)
      return false
    }
  }

  // Stop playback
  async stopPlayback(): Promise<boolean> {
    if (!this.isAuthenticated()) return false

    try {
      const response = await this.authFetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
      })

      this.currentTrackUri = null
      return response.ok || response.status === 204
    } catch (error) {
      console.error('Error stopping playback:', error)
      return false
    }
  }

  // Get current playback state
  async getPlaybackState(): Promise<any> {
    if (!this.player) return null

    try {
      return await this.player.getCurrentState()
    } catch (error) {
      console.error('Error getting playback state:', error)
      return null
    }
  }

  // Check if player is ready (with session validation)
  isPlayerReady(): boolean {
    const ready = !!(this.playerReady && this.player && this.deviceId)
    
    // Only log if there's a change in status or for debugging
    if (!ready && this.isAuthenticated()) {
      console.log('Player ready check:', {
        playerReady: this.playerReady,
        hasPlayer: !!this.player,
        hasDeviceId: !!this.deviceId,
        finalResult: ready,
        playerInitializationAttempted: this.playerInitializationAttempted
      })
    }
    
    return ready
  }

  // Check if current playback session is still active
  async isPlaybackSessionActive(): Promise<boolean> {
    try {
      const state = await this.getSpotifyConnectState()
      return state !== null && state.device !== null
    } catch (error) {
      console.error('Error checking playback session:', error)
      return false
    }
  }

  // Comprehensive method to ensure playback capability
  async ensurePlaybackReady(): Promise<boolean> {
    console.log('🔄 Ensuring playback readiness...')
    
    if (!this.isAuthenticated()) {
      console.error('❌ Not authenticated')
      return false
    }

    const isMobile = this.isMobileDevice()
    
    if (isMobile) {
      // For mobile, always use Spotify Connect - check if we have any available devices
      console.log('📱 Mobile device: Using Spotify Connect exclusively')
      const devices = await this.getAvailableDevices()
      const hasDevices = devices.length > 0
      
      if (!hasDevices) {
        console.error('❌ No Spotify devices available on mobile')
        console.error('💡 User needs to open Spotify app first')
        return false
      }
      
      console.log('✅ Mobile: Spotify devices available for Spotify Connect')
      return true
    } else {
      // For desktop, try Web Playback SDK first, then fallback to Spotify Connect
      console.log('🖥️ Desktop device: Trying Web Playback SDK first')
      
      if (!this.isPlayerReady()) {
        console.log('🔄 Desktop: Web Playback SDK not ready, attempting to initialize...')
        
        if (!this.playerInitializationAttempted) {
          this.initializePlayerIfReady()
          // Wait a moment for initialization
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
        
        if (!this.isPlayerReady()) {
          console.warn('⚠️ Desktop: Web Playback SDK still not ready, will use Spotify Connect fallback')
          // Check if we have Spotify Connect devices as fallback
          const devices = await this.getAvailableDevices()
          const hasDevices = devices.length > 0
          
          if (!hasDevices) {
            console.error('❌ No Spotify devices available for fallback')
            return false
          }
          
          console.log('✅ Desktop: Spotify Connect devices available as fallback')
          return true
        }
        
        console.log('✅ Desktop: Web Playback SDK ready')
        return true
      }
      
      // Check if our Web Playback SDK device is still valid
      const devices = await this.getAvailableDevices()
      const ourDevice = devices.find(d => d.id === this.deviceId)
      
      if (!ourDevice) {
        console.warn('⚠️ Desktop: Web Playback SDK device no longer available')
        
        // Try to reactivate
        const reactivated = await this.reactivateWebPlaybackSDK()
        if (reactivated) {
          console.log('✅ Desktop: Web Playback SDK reactivated')
          return true
        }
        
        // Check for Spotify Connect fallback
        const hasOtherDevices = devices.length > 0
        if (hasOtherDevices) {
          console.log('✅ Desktop: Spotify Connect devices available as fallback')
          return true
        }
        
        console.error('❌ Desktop: No devices available')
        return false
      }
      
      console.log('✅ Desktop: Web Playback SDK device still available')
      return true
    }
  }

  // Get the current playing track URI
  getCurrentTrackUri(): string | null {
    return this.currentTrackUri
  }

  // Set device as active
  private async setActiveDevice(deviceId: string): Promise<boolean> {
    if (!this.isAuthenticated()) return false

    try {
      console.log('Setting device as active:', deviceId)
      
      const response = await this.authFetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      })

      if (response.ok || response.status === 204) {
        console.log('✅ Device set as active successfully')
        return true
      } else {
        const errorText = await response.text()
        console.warn('Failed to set active device:', response.status, errorText)
        return false
      }
    } catch (error) {
      console.error('Error setting active device:', error)
      return false
    }
  }

  // Add method to get user's available devices
  async getAvailableDevices(): Promise<any[]> {
    try {
      const response = await this.authFetch('https://api.spotify.com/v1/me/player/devices')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Available Spotify devices:', data.devices)
        return data.devices || []
      }
      return []
    } catch (error) {
      console.error('Error getting devices:', error)
      return []
    }
  }

  // Check if any devices are available and active
  async hasActiveDevice(): Promise<boolean> {
    try {
      const devices = await this.getAvailableDevices()
      return devices.some(device => device.is_active)
    } catch (error) {
      console.error('Error checking for active devices:', error)
      return false
    }
  }

  // Check if any devices are available (active or inactive)
  async hasAvailableDevices(): Promise<boolean> {
    try {
      const devices = await this.getAvailableDevices()
      return devices.length > 0
    } catch (error) {
      console.error('Error checking for available devices:', error)
      return false
    }
  }

  // Add method to play on any active device (Spotify Connect)
  async playOnSpotifyConnect(trackUri: string): Promise<boolean> {
    try {
      console.log('🔄 Attempting Spotify Connect playback...')
      
      // Get available devices
      const devices = await this.getAvailableDevices()
      console.log('Found devices for Spotify Connect:', devices.map(d => ({ name: d.name, id: d.id, is_active: d.is_active, type: d.type })))
      
      // Find an active device first
      let activeDevice = devices.find(d => d.is_active)
      
      if (!activeDevice) {
        // No active device found - try to activate the most recent one
        // Prefer non-web devices (mobile/desktop apps) over web players
        const availableDevice = devices.find(d => !d.is_restricted && d.type !== 'Computer') || 
                               devices.find(d => !d.is_restricted) || 
                               devices[0]
        
        if (!availableDevice) {
          console.error('❌ No Spotify devices available.')
          console.error('💡 User needs to open Spotify app on their device first.')
          throw new Error('NO_DEVICES_AVAILABLE')
        }
        
        console.log('🔄 No active device found. Attempting to activate:', availableDevice.name, `(${availableDevice.type})`)
        
        // Try to transfer playback to activate the device
        const transferResponse = await this.authFetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [availableDevice.id],
            play: false
          })
        })

        if (transferResponse.ok || transferResponse.status === 204) {
          console.log('✅ Successfully activated device:', availableDevice.name)
          activeDevice = availableDevice
          // Wait a moment for the device to become active
          await new Promise(resolve => setTimeout(resolve, 1500))
        } else {
          const errorText = await transferResponse.text()
          console.error('❌ Failed to activate device:', transferResponse.status, errorText)
          
          if (transferResponse.status === 404) {
            console.error('💡 Device disappeared. User may need to reopen Spotify app.')
            throw new Error('DEVICE_NOT_FOUND')
          }
          
          console.error('💡 Device activation failed. Trying to play anyway...')
          activeDevice = availableDevice // Try anyway
        }
      }
      
      console.log('🎵 Using device for playback:', activeDevice.name, `(${activeDevice.type})`)
      
      // Now try to play the track
      const response = await this.authFetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDevice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      })

      if (response.ok || response.status === 204) {
        console.log('✅ Successfully started playback via Spotify Connect')
        this.currentTrackUri = trackUri
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to start playback:', response.status, errorText)
        
        if (response.status === 404) {
          console.error('💡 Device became inactive. User may need to tap play in Spotify app.')
          throw new Error('DEVICE_BECAME_INACTIVE')
        }
        
        if (response.status === 403) {
          console.error('💡 Premium subscription required for full track playback.')
          throw new Error('PREMIUM_REQUIRED')
        }
        
        if (response.status === 401) {
          console.error('💡 Authorization expired. Need to re-authenticate.')
          throw new Error('AUTH_EXPIRED')
        }
        
        throw new Error('PLAYBACK_FAILED')
      }
    } catch (error) {
      console.error('❌ Spotify Connect playback error:', error)
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        switch (error.message) {
          case 'NO_DEVICES_AVAILABLE':
            console.error('💡 Solution: Open Spotify app on your device first, then try again.')
            break
          case 'DEVICE_NOT_FOUND':
            console.error('💡 Solution: Make sure Spotify app is open and connected to internet.')
            break
          case 'DEVICE_BECAME_INACTIVE':
            console.error('💡 Solution: Tap play in your Spotify app, then return to the game.')
            break
          case 'PREMIUM_REQUIRED':
            console.error('💡 Solution: Spotify Premium subscription required for full track playback.')
            break
          case 'AUTH_EXPIRED':
            console.error('💡 Solution: Re-authenticate with Spotify.')
            break
        }
      }
      
      throw error
    }
  }

  // Add method to pause via Spotify Connect
  async pauseSpotifyConnect(): Promise<boolean> {
    try {
      const response = await this.authFetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
      })

      if (response.ok || response.status === 204) {
        console.log('✅ Successfully paused playback via Spotify Connect')
        return true
      } else {
        console.error('Failed to pause playback:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error pausing Spotify Connect:', error)
      return false
    }
  }

  // Add method to get current playback state via Web API
  async getSpotifyConnectState(): Promise<any> {
    try {
      const response = await this.authFetch('https://api.spotify.com/v1/me/player')

      if (response.ok) {
        return await response.json()
      } else if (response.status === 204) {
        // No content means no active playback
        return null
      }
      return null
    } catch (error) {
      console.error('Error getting Spotify Connect state:', error)
      return null
    }
  }

  // Method to maintain active Spotify Connect session (especially for mobile)
  async maintainActiveSession(): Promise<boolean> {
    try {
      // Make sure the access token is fresh (single-flight, so this is safe to
      // call from the maintenance loop and the resume handler at the same time)
      if (!await this.ensureValidToken()) {
        console.warn('📱 Mobile: No usable access token for session maintenance')
        return false
      }

      // Check current playback state
      const state = await this.getSpotifyConnectState()
      
      if (state && state.device) {
        console.log('📱 Mobile: Spotify Connect session is active on:', state.device.name)
        
        // Instead of just pinging, send a more meaningful request to keep session alive
        // Use the "currently playing" endpoint which is lighter but keeps the session active
        try {
          const response = await this.authFetch('https://api.spotify.com/v1/me/player/currently-playing')
          
          if (response.ok || response.status === 204) {
            console.log('📱 Mobile: Successfully maintained session via currently-playing check')
            
            // Additionally, send a volume check to the specific device to keep it warm
            try {
              await this.authFetch(`https://api.spotify.com/v1/me/player?device_id=${state.device.id}`)
              console.log('📱 Mobile: Device-specific ping successful')
            } catch (error) {
              console.warn('📱 Mobile: Device-specific ping failed (but session maintained):', error)
            }
          } else {
            console.warn('📱 Mobile: Currently-playing check failed:', response.status)
          }
        } catch (error) {
          console.warn('📱 Mobile: Failed to maintain session via currently-playing:', error)
        }
        return true
      } else {
        console.log('🔄 No active Spotify session detected, attempting to activate...')
        
        // Get available devices
        const devices = await this.getAvailableDevices()
        const availableDevice = devices.find(d => !d.is_restricted && d.type !== 'Computer') || 
                               devices.find(d => !d.is_restricted) || 
                               devices[0]
        
        if (!availableDevice) {
          console.error('❌ No Spotify devices available for session maintenance')
          return false
        }
        
        // Transfer playbook to activate the device (without starting playback)
        const transferResponse = await this.authFetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [availableDevice.id],
            play: false  // Don't start playing, just activate
          })
        })

        if (transferResponse.ok || transferResponse.status === 204) {
          console.log('✅ Successfully reactivated Spotify session on device:', availableDevice.name)
          
          // Wait a moment for activation to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Verify activation by checking devices again
          const updatedDevices = await this.getAvailableDevices()
          const activatedDevice = updatedDevices.find(d => d.id === availableDevice.id)
          
          if (activatedDevice && activatedDevice.is_active) {
            console.log('✅ Device activation confirmed:', activatedDevice.name)
          } else {
            console.warn('⚠️ Device activation unclear, but continuing...')
          }
          
          return true
        } else {
          console.error('❌ Failed to reactivate Spotify session:', transferResponse.status)
          return false
        }
      }
    } catch (error) {
      console.error('Error maintaining active session:', error)
      return false
    }
  }

  // Start periodic session maintenance (for mobile devices)
  startSessionMaintenance(): void {
    const isMobile = this.isMobileDevice()

    if (!isMobile || !this.isAuthenticated()) {
      console.log('Session maintenance not needed for desktop or unauthenticated users')
      return
    }

    // Clear any existing interval
    if (this.sessionMaintenanceInterval) {
      clearInterval(this.sessionMaintenanceInterval)
    }

    console.log('📱 Starting enhanced Spotify session maintenance for mobile device...')

    // More aggressive session maintenance every 15 seconds to prevent 30-second timeout
    // This is crucial for mobile devices where Spotify Connect sessions are more fragile
    this.sessionMaintenanceInterval = setInterval(async () => {
      // While the tab is hidden the browser throttles us anyway, and firing
      // requests there only risks racing with the resume handler.
      if (document.hidden) {
        return
      }

      if (this.isAuthenticated()) {
        console.log('🔄 Running session maintenance check...')
        const success = await this.maintainActiveSession()
        if (!success) {
          console.warn('⚠️ Session maintenance failed - connection may be unstable')
        }
      } else {
        console.log('📱 Not authenticated, stopping session maintenance')
        this.stopSessionMaintenance()
      }
    }, 15000) // Changed from 20000 to 15000 (15 seconds) for more aggressive maintenance
    
    // Also perform an immediate session check
    setTimeout(async () => {
      if (this.isAuthenticated()) {
        console.log('🔄 Initial session maintenance check...')
        await this.maintainActiveSession()
      }
    }, 2000) // Initial check after 2 seconds
  }

  // Stop session maintenance
  stopSessionMaintenance(): void {
    if (this.sessionMaintenanceInterval) {
      clearInterval(this.sessionMaintenanceInterval)
      this.sessionMaintenanceInterval = null
      console.log('🔄 Stopped Spotify session maintenance')
    }
  }

  // Keep Spotify Connect session active (for mobile devices)
  async keepSpotifyConnectActive(): Promise<void> {
    const isMobile = this.isMobileDevice()
    
    if (!isMobile || !this.isAuthenticated()) {
      return
    }

    try {
      // Check if we have active playback
      const state = await this.getSpotifyConnectState()
      
      if (state && state.is_playing) {
        console.log('📱 Mobile: Spotify Connect session is active with playback')
        
        // Send a light keepalive request to maintain connection
        try {
          await this.authFetch('https://api.spotify.com/v1/me/player/queue')
          console.log('📱 Mobile: Queue check successful - session maintained')
        } catch (error) {
          console.warn('📱 Mobile: Queue check failed:', error)
        }
      } else {
        console.log('📱 Mobile: No active Spotify Connect session or no playback')
        
        // Check if we have available devices
        const devices = await this.getAvailableDevices()
        if (devices.length > 0) {
          console.log('📱 Mobile: Spotify devices available but not active')
          
          // Try to activate a device without starting playback
          const preferredDevice = devices.find(d => !d.is_restricted && d.type !== 'Computer') || 
                                 devices.find(d => !d.is_restricted) || 
                                 devices[0]
          
          if (preferredDevice) {
            try {
              const response = await this.authFetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  device_ids: [preferredDevice.id],
                  play: false
                })
              })
              
              if (response.ok || response.status === 204) {
                console.log('📱 Mobile: Successfully activated device for session maintenance:', preferredDevice.name)
              }
            } catch (error) {
              console.warn('📱 Mobile: Failed to activate device for session maintenance:', error)
            }
          }
        } else {
          console.log('📱 Mobile: No Spotify devices available')
        }
      }
    } catch (error) {
      console.error('Error keeping Spotify Connect active:', error)
    }
  }

  // Update your existing methods to use Spotify Connect on mobile (with retry logic)
  async startPlayback(trackUri: string): Promise<boolean> {
    const isMobile = this.isMobileDevice()
    
    if (isMobile) {
      console.log('📱 Mobile: Using Spotify Connect exclusively for playback...')
      
      // For mobile, always use Spotify Connect with enhanced retry logic
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔄 Mobile Spotify Connect attempt ${attempt}/3...`)
          
          // Before attempting playback, ensure session is active
          await this.maintainActiveSession()
          
          // Wait a moment for session to stabilize
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const success = await this.playOnSpotifyConnect(trackUri)
          if (success) {
            console.log('✅ Mobile: Spotify Connect playback successful')
            return true
          }
        } catch (error: any) {
          console.error(`❌ Mobile Spotify Connect attempt ${attempt} failed:`, error.message)
          
          if (error.message === 'NO_DEVICES_AVAILABLE') {
            console.error('💡 No devices available - user needs to open Spotify app')
            break // Don't retry if no devices are available
          }
          
          if (error.message === 'DEVICE_BECAME_INACTIVE' && attempt < 3) {
            console.log('🔄 Device became inactive, trying to reactivate session...')
            // Try to reactivate session before retry
            await this.maintainActiveSession()
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue
          }
          
          if (error.message === 'AUTH_EXPIRED') {
            console.log('🔄 Auth expired, trying to refresh token...')
            const tokenRefreshed = await this.refreshAccessToken()
            if (tokenRefreshed && attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000))
              continue
            }
          }
          
          if (attempt === 3) {
            throw error
          }
          
          // Wait before retrying with progressive backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
      
      return false
    } else {
      console.log('�️ Desktop: Using Web Playback SDK for desktop...')
      
      // For desktop, try Web Playback SDK first, then fallback to Spotify Connect
      try {
        const success = await this.playTrack(trackUri)
        if (success) {
          return true
        }
      } catch (error) {
        console.error('Desktop playback failed:', error)
      }
      
      // If Web Playback SDK fails, try Spotify Connect as fallback
      console.log('🔄 Desktop Web Playback SDK failed, trying Spotify Connect...')
      return this.playOnSpotifyConnect(trackUri)
    }
  }

  async getRandomTrack(theme?: string): Promise<Track> {
    try {
      // Get tracks from JSON data
      const tracks = await this.getTracksFromJson(theme as Theme, 50)
      
      if (tracks.length === 0) {
        throw new Error('No tracks available')
      }
      
      // Return a random track
      const randomIndex = Math.floor(Math.random() * tracks.length)
      return tracks[randomIndex]
    } catch (error) {
      console.error('Error getting random track:', error)
      // Return a fallback track if needed
      throw error
    }
  }

}

export const spotifyService = new SpotifyService()
