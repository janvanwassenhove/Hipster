<template>
  <div class="min-h-screen flex flex-col">
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
          <h2 class="text-xl font-semibold mb-4 text-gray-800">{{ $t('game.continue') }}</h2>
          <div class="flex justify-between items-center">
            <div>
              <p class="text-gray-600">{{ $t('game.players') }}: {{ savedGamePlayers.join(', ') }}</p>
              <p class="text-gray-600">{{ $t('game.round') }}: {{ savedGameRound }}</p>
            </div>
            <button @click="continueGame" class="btn btn-primary">
              {{ $t('common.continue') }}
            </button>
          </div>
        </div>

        <!-- New Game Setup -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('game.newGame') }}</h2>
          
          <!-- Spotify Login Check -->
          <div v-if="!isSpotifyAuthenticated" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center space-x-3 mb-3">
              <span class="text-2xl">🎵</span>
              <div>
                <h3 class="font-semibold text-green-800">{{ $t('game.spotify.required') }}</h3>
                <p class="text-green-700 text-sm">{{ $t('game.spotify.loginRequired') }}</p>
              </div>
            </div>
            <button
              @click="loginToSpotify"
              :disabled="isLoggingIn"
              class="btn btn-primary bg-spotify hover:bg-spotify-dark w-full"
            >
              <span v-if="isLoggingIn">{{ $t('common.loading') }}</span>
              <span v-else>🎵 {{ $t('game.spotify.login') }}</span>
            </button>
          </div>

          <!-- Game Setup Form -->
          <form v-if="isSpotifyAuthenticated" @submit.prevent="startGame" class="space-y-6">
            
            <!-- Player Count -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('game.playerCount') }}
              </label>
              <select v-model="playerCount" class="select">
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <!-- Player Names -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('game.playerNames') }}
              </label>
              <div class="space-y-3">
                <input
                  v-for="i in playerCount"
                  :key="i"
                  v-model="playerNames[i - 1]"
                  :placeholder="$t('game.playerName', { number: i })"
                  class="input"
                  required
                  maxlength="20"
                />
              </div>
            </div>

            <!-- Difficulty -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('game.difficulty') }}
              </label>
              <select v-model="difficulty" class="select">
                <option value="original">{{ $t('game.difficulties.original') }}</option>
                <option value="pro">{{ $t('game.difficulties.pro') }}</option>
                <option value="expert">{{ $t('game.difficulties.expert') }}</option>
              </select>
            </div>

            <!-- Theme -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('game.theme') }}
              </label>
              <select v-model="selectedTheme" class="select">
                <option value="">{{ $t('game.allMusic') }}</option>
                <option value="90s">{{ $t('game.themes.90s') }}</option>
                <option value="guilty-pleasures">{{ $t('game.themes.guilty-pleasures') }}</option>
                <option value="schlager">{{ $t('game.themes.schlager') }}</option>
                <option value="tiktok">{{ $t('game.themes.tiktok') }}</option>
                <option value="rock">{{ $t('game.themes.rock') }}</option>
                <option value="pop">{{ $t('game.themes.pop') }}</option>
                <option value="hip-hop">{{ $t('game.themes.hip-hop') }}</option>
                <option value="electronic">{{ $t('game.themes.electronic') }}</option>
                <option value="indie">{{ $t('game.themes.indie') }}</option>
                <option value="country">{{ $t('game.themes.country') }}</option>
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
const difficulty = ref<'original' | 'pro' | 'expert'>('original')
const selectedTheme = ref<Theme | ''>('')
const isLoggingIn = ref(false)
const isSpotifyAuthenticated = ref(false)

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
    difficulty: difficulty.value,
    theme: selectedTheme.value || undefined,
    maxRounds: 20,
    targetScore: 10
  })
  
  gameStore.initializePlayers(names)
  router.push('/game')
}

function continueGame() {
  router.push('/game')
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
