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
        
        <!-- Continue Game Card (if saved game exists) -->
        <div v-if="hasSavedGame" class="card mb-6 bounce-in">
          <h2 class="text-2xl font-bold mb-4 text-white">{{ $t('game.continue') }}</h2>
          <div class="flex justify-between items-center">
            <div>
              <p class="text-slate-300 font-medium">{{ $t('game.players') }}: {{ savedGamePlayers.join(', ') }}</p>
              <p class="text-slate-300 font-medium">{{ $t('game.round') }}: {{ savedGameRound }}</p>
            </div>
            <button @click="continueGame" class="btn btn-primary">
              {{ $t('common.continue') }}
            </button>
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
import { ref, computed, onMounted } from 'vue'
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
const debugMessage = ref('')

// Computed
const hasSavedGame = computed(() => gameStore.players.length > 0 && gameStore.gamePhase !== 'setup')
const savedGamePlayers = computed(() => gameStore.players.map(p => p.name))
const savedGameRound = computed(() => gameStore.round)

const canStartGame = computed(() => {
  if (!isSpotifyAuthenticated.value) return false
  for (let i = 0; i < playerCount.value; i++) {
    if (!playerNames.value[i]?.trim()) return false
  }
  return true
})

// Methods
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

function continueGame() {
  router.push('/game')
}

async function testSpotifyPlayback() {
  debugMessage.value = 'Testing...'
  try {
    console.log('Testing Spotify playback on mobile...')
    
    // Check volume level
    if (spotifyService.player) {
      const volume = await spotifyService.player.getVolume()
      console.log('Current player volume:', volume)
      
      if (volume === 0) {
        console.log('Volume is 0, setting to 50%...')
        await spotifyService.player.setVolume(0.5)
      }
    }
    
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
    debugMessage.value = `Test failed: ${error.message}`
  }
}

// Lifecycle
onMounted(() => {
  isSpotifyAuthenticated.value = spotifyService.isAuthenticated()
  
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
})

// Watch for player name changes to save them
import { watch } from 'vue'

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
