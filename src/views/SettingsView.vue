<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="p-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <button @click="$router.push('/')" class="btn btn-secondary">
          ← {{ $t('common.back') }}
        </button>
        <h1 class="text-2xl font-bold text-white">{{ $t('settings.title') }}</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <div class="max-w-lg mx-auto">
        <div class="card">
          <h2 class="text-xl font-semibold mb-6 text-white">{{ $t('settings.language') }}</h2>
          
          <!-- Language Selection -->
          <div class="space-y-3">
            <button
              v-for="lang in availableLanguages"
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              class="w-full p-4 text-left rounded-lg border-2 transition-colors"
              :class="currentLanguage === lang.code 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <span class="text-2xl">{{ lang.flag }}</span>
                  <div>
                    <p class="font-medium">{{ lang.name }}</p>
                    <p class="text-sm text-gray-600">{{ lang.nativeName }}</p>
                  </div>
                </div>
                <div v-if="currentLanguage === lang.code" class="text-white">
                  ✓
                </div>
              </div>
            </button>
          </div>

          <!-- Spotify Status -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Spotify</h3>
            
            <div v-if="isSpotifyAuthenticated" class="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center space-x-3">
                <span class="text-white">✓</span>
                <div>
                  <p class="font-medium text-white">{{ $t('game.spotify.connected') }}</p>
                  <p class="text-sm text-white" v-if="userProfile">{{ userProfile.display_name }}</p>
                </div>
              </div>
              <button @click="logoutFromSpotify" class="btn btn-secondary text-sm">
                {{ $t('game.spotify.logout') }}
              </button>
            </div>
            
            <div v-else class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center space-x-3 mb-3">
                <span class="text-red-500">✗</span>
                <div>
                  <p class="font-medium text-red-800">{{ $t('game.spotify.notConnected') }}</p>
                  <p class="text-sm text-red-700">{{ $t('game.spotify.required') }}</p>
                </div>
              </div>
              <button @click="loginToSpotify" class="btn btn-primary bg-spotify hover:bg-spotify-dark">
                🎵 {{ $t('game.spotify.login') }}
              </button>
            </div>

            <!-- Session diagnostics: why a re-login was required, if it was -->
            <details class="mt-4 rounded-lg border border-white/20 bg-white/5">
              <summary class="cursor-pointer select-none p-3 text-sm font-medium text-white">
                🩺 {{ $t('settings.diagnostics.title') }}
                <span v-if="lastSessionEnd" class="ml-1 text-amber-300">•</span>
              </summary>

              <div class="px-3 pb-3 text-sm text-white/80">
                <p class="mb-3 text-xs text-white/60">{{ $t('settings.diagnostics.hint') }}</p>

                <p v-if="!lastSessionEnd && !diagnosticEvents.length" class="text-white/70">
                  {{ $t('settings.diagnostics.empty') }}
                </p>

                <template v-else>
                  <div v-if="lastSessionEnd" class="mb-3 rounded-md bg-amber-500/10 border border-amber-400/30 p-3">
                    <p class="text-xs uppercase tracking-wide text-amber-200/80">
                      {{ $t('settings.diagnostics.lastEnd') }}
                    </p>
                    <p class="font-mono text-white break-words">{{ lastSessionEnd.detail || lastSessionEnd.event }}</p>
                    <p class="text-xs text-white/60">{{ formatTime(lastSessionEnd.at) }}</p>
                  </div>

                  <div v-if="diagnosticEvents.length">
                    <p class="mb-1 text-xs uppercase tracking-wide text-white/60">
                      {{ $t('settings.diagnostics.recentEvents') }}
                    </p>
                    <ul class="max-h-48 overflow-y-auto space-y-1 font-mono text-xs">
                      <li v-for="(entry, index) in reversedEvents" :key="index" class="break-words">
                        <span class="text-white/50">{{ formatTime(entry.at) }}</span>
                        <span class="ml-2 text-white">{{ entry.event }}</span>
                        <span v-if="entry.detail" class="ml-1 text-white/60">({{ entry.detail }})</span>
                      </li>
                    </ul>
                  </div>
                </template>

                <div class="mt-3 flex space-x-2">
                  <button @click="copyDiagnostics" class="btn btn-secondary text-xs">
                    {{ justCopied ? $t('settings.diagnostics.copied') : $t('settings.diagnostics.copy') }}
                  </button>
                  <button @click="clearDiagnostics" class="btn btn-secondary text-xs">
                    {{ $t('settings.diagnostics.clear') }}
                  </button>
                </div>
              </div>
            </details>
          </div>

          <!-- App Info -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold mb-4 text-white">{{ $t('settings.about') }}</h3>
            <div class="text-sm text-white space-y-2">
              <p><strong>{{ $t('game.title') }}</strong> v1.0.0</p>
              <p>{{ $t('settings.aboutText') }}</p>
              <p>{{ $t('settings.madeWith') }} ❤️</p>
              <p>©2025 <a href="https://mityjohn.com/" class="text-blue-500 hover:underline">mityjohn.com/</a></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLanguage, type Language } from '@/locales'
import { spotifyService, type SpotifyDiagnostics } from '@/services/spotify'

const { locale } = useI18n()

// Reactive state
const isSpotifyAuthenticated = ref(false)
const userProfile = ref<any>(null)
const diagnostics = ref<SpotifyDiagnostics>({ lastSessionEnd: null, events: [] })
const justCopied = ref(false)

// Computed
const currentLanguage = computed(() => locale.value)
const lastSessionEnd = computed(() => diagnostics.value.lastSessionEnd)
const diagnosticEvents = computed(() => diagnostics.value.events)
const reversedEvents = computed(() => [...diagnostics.value.events].reverse())

const availableLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'nl' as Language, name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr' as Language, name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
]

// Methods
function changeLanguage(lang: Language) {
  setLanguage(lang)
}

async function loginToSpotify() {
  try {
    await spotifyService.initiateLogin()
  } catch (error) {
    console.error('Login failed:', error)
  }
}

function logoutFromSpotify() {
  spotifyService.logout()
  isSpotifyAuthenticated.value = false
  userProfile.value = null
  refreshDiagnostics()
}

function refreshDiagnostics() {
  diagnostics.value = spotifyService.getDiagnostics()
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString(locale.value)
}

async function copyDiagnostics() {
  const report = [
    `Spotify diagnostics (${new Date().toISOString()})`,
    `userAgent: ${navigator.userAgent}`,
    `authenticated: ${spotifyService.isAuthenticated()}`,
    `lastSessionEnd: ${diagnostics.value.lastSessionEnd
      ? `${diagnostics.value.lastSessionEnd.at} ${diagnostics.value.lastSessionEnd.detail || diagnostics.value.lastSessionEnd.event}`
      : 'none'}`,
    '',
    ...diagnostics.value.events.map(e => `${e.at}  ${e.event}${e.detail ? `  (${e.detail})` : ''}`)
  ].join('\n')

  try {
    await navigator.clipboard.writeText(report)
    justCopied.value = true
    setTimeout(() => (justCopied.value = false), 2000)
  } catch (error) {
    // Clipboard is unavailable on some mobile browsers without a secure
    // context - fall back to something the user can select manually.
    console.warn('Clipboard unavailable, logging diagnostics instead:', error)
    console.log(report)
    window.prompt('Spotify diagnostics', report)
  }
}

function clearDiagnostics() {
  spotifyService.clearDiagnostics()
  refreshDiagnostics()
}

async function loadUserProfile() {
  if (isSpotifyAuthenticated.value) {
    try {
      userProfile.value = await spotifyService.getUserProfile()
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }
}

// Lifecycle
onMounted(async () => {
  isSpotifyAuthenticated.value = spotifyService.isAuthenticated()
  refreshDiagnostics()
  await loadUserProfile()
})
</script>
