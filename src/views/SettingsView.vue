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
          <h2 class="text-xl font-semibold mb-6 text-gray-800">{{ $t('settings.language') }}</h2>
          
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
          </div>

          <!-- App Info -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">{{ $t('settings.about') }}</h3>
            <div class="text-sm text-gray-600 space-y-2">
              <p><strong>{{ $t('game.title') }}</strong> v1.0.0</p>
              <p>{{ $t('settings.aboutText') }}</p>
              <p>{{ $t('settings.madeWith') }} ❤️</p>
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
import { spotifyService } from '@/services/spotify'

const { locale } = useI18n()

// Reactive state
const isSpotifyAuthenticated = ref(false)
const userProfile = ref<any>(null)

// Computed
const currentLanguage = computed(() => locale.value)

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
  await loadUserProfile()
})
</script>
