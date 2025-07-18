<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white p-8">
    <!-- Spotify Login Check -->
 
    <!-- Header -->
    <header class="p-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <h1 class="text-3xl font-bold text-white">{{ $t('game.title') }}</h1>
        <span class="text-white/80 text-sm">{{ $t('game.subtitle') }}</span>
      </div>
      
      <button
        @click="$router.push('/settings')"
        class="btn btn-secondary"
      >
        ⚙️ {{ $t('settings.language') }}
      </button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        
        <!-- Game Introduction -->
        <div class="card mb-8">
          <!-- Hipster Logo/Image -->
          <div class="text-center mb-6">
            <img 
                src="/hipster.png" 
              alt="Hipster Music Game" 
              class="w-48 h-48 mx-auto rounded-2xl shadow-xl object-cover border border-purple-500/20"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
            />
            <!-- Fallback if image doesn't exist -->
            <div class="w-48 h-48 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl border border-purple-500/20" style="display: none;">
              <span class="text-6xl">🎵</span>
            </div>
          </div>
          
          <!-- Game Introduction Text -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {{ $t('game.introduction') }}
            </h2>
            
            <!-- How to Play -->
            <div class="bg-gradient-to-r from-slate-800/50 to-purple-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center justify-center">
                <span class="mr-2">🎯</span>
                {{ $t('game.howToPlay') }}
              </h3>
              <div class="space-y-3 text-left">
                <div class="flex items-start space-x-3">
                  <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                  <p class="text-white font-medium">{{ $t('game.rules.step1') }}</p>
                </div>
                <div class="flex items-start space-x-3">
                  <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                  <p class="text-white font-medium">{{ $t('game.rules.step2') }}</p>
                </div>
                <div class="flex items-start space-x-3">
                  <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                  <p class="text-white font-medium">{{ $t('game.rules.step3') }}</p>
                </div>
                <div class="flex items-start space-x-3">
                  <span class="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">🏆</span>
                  <p class="text-white font-medium">{{ $t('game.rules.step4', { target: targetSongs }) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- New Game Setup -->
        <div class="card">
          <h2 class="text-3xl font-bold mb-8 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{{ $t('game.newGame') }}</h2>
          
          <!-- Spotify Login Check -->
          <div v-if="!isSpotifyAuthenticated" class="mb-8 p-6 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-2xl backdrop-blur-sm">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span class="text-2xl">🎵</span>
              </div>
              <div>
                <h3 class="font-bold text-xl text-white">{{ $t('game.spotify.required') }}</h3>
                <p class="text-white font-medium">{{ $t('game.spotify.loginRequired') }}</p>
              </div>
            </div>
            <button
              @click="loginToSpotify"
              :disabled="isLoggingIn"
              class="btn bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white w-full font-bold text-lg py-4 shadow-lg hover:shadow-green-500/25"
            >
              <span v-if="isLoggingIn" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                {{ $t('common.loading') }}
              </span>
              <span v-else class="flex items-center justify-center">
                🎵 {{ $t('game.spotify.login') }}
              </span>
            </button>
            
            <!-- Debug info -->
            <div v-if="debugMessage" class="mt-4 p-3 bg-gray-800 rounded-lg text-sm" style="display: none;">
              <p class="text-gray-300">Debug: {{ debugMessage }}</p>
              <button @click="refreshAuthState" class="mt-2 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">
                Refresh Auth State
              </button>
            </div>
          </div>

          <!-- Game Setup Form -->
          <form v-if="isSpotifyAuthenticated" @submit.prevent="startGame" class="space-y-6">
            
            <!-- Player Count -->
            <div>
              <label class="block text-sm font-bold text-slate-200 mb-3">
                {{ $t('game.playerCount') }}
              </label>
              <select v-model.number="playerCount" class="select">
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
              </select>
            </div>

            <!-- Player Names -->
            <div>
              <label class="block text-sm font-bold text-slate-200 mb-3">
                {{ $t('game.playerNames') }}
              </label>
              <div class="space-y-3">
                <input
                  v-for="i in playerCount"
                  :key="`player-${i}`"
                  v-model="playerNames[i - 1]"
                  :placeholder="$t('game.playerName', { number: i })"
                  class="input"
                  required
                  maxlength="20"
                />
              </div>
            </div>

            <!-- Target Songs -->
            <div>
              <label class="block text-sm font-bold text-slate-200 mb-3">
                {{ $t('game.targetSongs') }}
              </label>
              <select v-model="targetSongs" class="select">
                <option value="5">5 {{ $t('game.songs') }}</option>
                <option value="6">6 {{ $t('game.songs') }}</option>
                <option value="7">7 {{ $t('game.songs') }}</option>
                <option value="8">8 {{ $t('game.songs') }}</option>
                <option value="9">9 {{ $t('game.songs') }}</option>
                <option value="10">10 {{ $t('game.songs') }} ({{ $t('game.default') }})</option>
              </select>
            </div>

            <!-- Theme -->
            <div>
              <label class="block text-sm font-bold text-slate-200 mb-3">
                {{ $t('game.theme') }}
              </label>
              <select v-model="selectedTheme" class="select">
                <option value="">{{ $t('game.allMusic') }}</option>
                <option value="guilty-pleasures">{{ $t('game.themes.guilty-pleasures') }}</option>
                <option value="belgian">{{ $t('game.themes.belgian') }}</option>
                <option value="classics">{{ $t('game.themes.classics') }}</option>
                <option value="popular">{{ $t('game.themes.popular') }}</option>
                <option value="vlaams">{{ $t('game.themes.vlaams') }}</option>
                <option value="pop-rock">{{ $t('game.themes.pop-rock') }}</option>
              </select>
            </div>

            <!-- Start Button -->
            <button
              type="submit"
              :disabled="!canStartGame"
              class="btn btn-primary btn-lg w-full"
            >
              🎮 {{ $t('common.start') }}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { spotifyService } from '@/services/spotify'
import type { Theme } from '@/types'

const router = useRouter()
const gameStore = useGameStore()

// Reactive state
const playerCount = ref(2)
const playerNames = ref<string[]>(['', '', '', ''])
const targetSongs = ref(10)
const selectedTheme = ref<Theme | ''>('')
const isLoggingIn = ref(false)
const isSpotifyAuthenticated = ref(false)
const debugMessage = ref('Auth state will be checked...')

// Computed
const canStartGame = computed(() => {
  if (!isSpotifyAuthenticated.value) return false
  for (let i = 0; i < playerCount.value; i++) {
    if (!playerNames.value[i]?.trim()) return false
  }
  return true
})

// Methods
function refreshAuthState() {
  isSpotifyAuthenticated.value = spotifyService.isAuthenticated()
}

async function loginToSpotify() {
  isLoggingIn.value = true
  try {
    await spotifyService.initiateLogin()
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    isLoggingIn.value = false
  }
}

function startGame() {
  if (!canStartGame.value) return

  const names = playerNames.value.slice(0, playerCount.value).map(name => name.trim())
  
  gameStore.updateSettings({
    targetSongs: targetSongs.value,
    theme: selectedTheme.value || undefined,
    maxRounds: 20,
    targetScore: 10 // Keep for backwards compatibility, but use targetSongs for winning
  })
  
  gameStore.initializePlayers(names)
  router.push('/game')
}

async function testSpotifyPlayback() {
  debugMessage.value = 'Testing...'
  try {
    console.log('Testing Spotify playback on mobile...')
    
    const isReady = spotifyService.isPlayerReady()
    debugMessage.value = `Player ready: ${isReady}`
    
    if (isReady) {
      await spotifyService.startPlayback('spotify:track:4iV5W9uYEdYUVa79Axb7Rh')
      debugMessage.value = 'Playback started successfully!'
      
      // Check devices
      const devices = await spotifyService.getAvailableDevices()
      console.log('Available devices after playback:', devices)
    } else {
      debugMessage.value = 'Player not ready'
    }
  } catch (error) {
    console.error('Test failed:', error)
    debugMessage.value = `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// Lifecycle
onMounted(() => {
  // Check authentication state
  isSpotifyAuthenticated.value = spotifyService.isAuthenticated()
  
  // Initialize player if already authenticated
  if (isSpotifyAuthenticated.value) {
    spotifyService.initializePlayerIfReady()
  }
  
  // Load saved player names if available
  const savedNames = localStorage.getItem('hitster-player-names')
  if (savedNames) {
    try {
      const names = JSON.parse(savedNames)
      if (Array.isArray(names)) {
        playerNames.value = [...names, '', '', '', ''].slice(0, 4)
        playerCount.value = Math.max(2, Math.min(4, names.length))
      }
    } catch (error) {
      console.error('Error loading saved player names:', error)
    }
  }
  
  // Poll for authentication state changes (in case OAuth callback is processing)
  const checkAuthInterval = setInterval(() => {
    const currentAuthState = spotifyService.isAuthenticated()
    if (currentAuthState !== isSpotifyAuthenticated.value) {
      isSpotifyAuthenticated.value = currentAuthState
      if (currentAuthState) {
        spotifyService.initializePlayerIfReady()
        clearInterval(checkAuthInterval)
      }
    }
  }, 500)
  
  // Clear interval after 10 seconds to avoid infinite polling
  setTimeout(() => {
    clearInterval(checkAuthInterval)
  }, 10000)
  
  // Add focus event listener to check auth when user returns to page
  const handleFocus = () => {
    const currentAuthState = spotifyService.isAuthenticated()
    if (currentAuthState !== isSpotifyAuthenticated.value) {
      isSpotifyAuthenticated.value = currentAuthState
      if (currentAuthState) {
        spotifyService.initializePlayerIfReady()
      }
    }
  }
  
  window.addEventListener('focus', handleFocus)
  
  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('focus', handleFocus)
    clearInterval(checkAuthInterval)
  })
})

// Watch for player name changes to save them
import { watch } from 'vue'

// Watch for authentication state changes and update the page
watch(isSpotifyAuthenticated, (newAuth) => {
  if (newAuth) {
    spotifyService.initializePlayerIfReady()
  }
}, { immediate: true })

// Watch player count changes to ensure proper reactivity
watch(playerCount, (newCount) => {
  // Ensure playerNames array is properly sized
  const currentNames = [...playerNames.value]
  // Fill with empty strings if needed
  while (currentNames.length < 4) {
    currentNames.push('')
  }
  playerNames.value = currentNames
}, { immediate: true })

watch(
  [playerNames, playerCount],
  () => {
    const names = playerNames.value.slice(0, playerCount.value).filter(name => name.trim())
    if (names.length > 0) {
      localStorage.setItem('hitster-player-names', JSON.stringify(names))
    }
  },
  { deep: true }
)
</script>
