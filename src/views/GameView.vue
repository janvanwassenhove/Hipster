<template>
  <div class="min-h-screen flex flex-col">
    <!-- Game Header -->
    <header class="bg-white/10 backdrop-blur-sm p-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="$router.push('/')" class="btn btn-secondary">
            ← {{ $t('common.back') }}
          </button>
          <div class="text-white">
            <h1 class="text-xl font-bold">{{ $t('game.title') }}</h1>
            <p class="text-sm opacity-80">{{ $t('game.round') }} {{ round }}</p>
          </div>
        </div>
        
        <div class="text-white text-right">
          <p class="text-sm opacity-80">{{ $t('game.turn.currentPlayer', { player: currentPlayer?.name }) }}</p>
        </div>
      </div>
    </header>

    <!-- Main Game Area -->
    <main class="flex-1 container mx-auto px-4 py-6">
      
      <!-- Game Setup Phase -->
      <div v-if="gamePhase === 'setup'" class="max-w-2xl mx-auto">
        <div class="card text-center">
          <h2 class="text-2xl font-semibold mb-4">{{ $t('game.setupRequired') }}</h2>
          <p class="text-gray-600 mb-6">{{ $t('game.setupMessage') }}</p>
          <button @click="$router.push('/')" class="btn btn-primary">
            {{ $t('game.backToSetup') }}
          </button>
        </div>
      </div>

      <!-- Playing Phase -->
      <div v-else-if="gamePhase === 'playing'" class="space-y-6">
        
        <!-- Current Player Turn -->
        <div class="card text-center bg-green-50 border-green-200">
          <h2 class="text-2xl font-bold text-green-800 mb-2">
            {{ $t('game.turn.currentPlayer', { player: currentPlayer?.name }) }}
          </h2>
          <p class="text-green-700">{{ $t('game.turn.ready') }}</p>
          
          <div v-if="!currentTrack && !isLoadingTrack" class="mt-4">
            <button @click="loadNextTrack" class="btn btn-primary btn-lg">
              🎵 {{ $t('game.getTrack') }}
            </button>
          </div>
          
          <div v-if="isLoadingTrack" class="mt-4">
            <div class="flex items-center justify-center space-x-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
              <span>{{ $t('common.loading') }}</span>
            </div>
          </div>
        </div>

        <!-- Track Player -->
        <TrackPlayer
          v-if="currentTrack"
          :track="currentTrack"
          :difficulty="settings.difficulty"
          @place-track="handlePlaceTrack"
        />

        <!-- Player Timelines -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PlayerTimeline
            v-for="player in players"
            :key="player.id"
            :player="player"
            :is-current="player.id === currentPlayer?.id"
            :current-track="currentTrack"
            :can-place="player.id === currentPlayer?.id && !!currentTrack"
            @place-track="handlePlaceTrack"
            @use-token="handleUseToken"
          />
        </div>

        <!-- Scores -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">{{ $t('game.score.title') }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="player in players"
              :key="player.id"
              class="text-center p-3 rounded-lg"
              :class="player.id === currentPlayer?.id ? 'bg-green-100' : 'bg-gray-50'"
            >
              <p class="font-semibold">{{ player.name }}</p>
              <p class="text-2xl font-bold text-green-600">{{ player.tokens }}</p>
              <p class="text-sm text-gray-600">{{ $t('game.score.tokens', { count: player.tokens }) }}</p>
              <p class="text-xs text-gray-500">{{ $t('game.score.total', { score: player.score }) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Finished -->
      <div v-else-if="gamePhase === 'finished'" class="max-w-2xl mx-auto">
        <div class="card text-center">
          <h2 class="text-3xl font-bold mb-4 text-green-600">{{ $t('game.end.title') }}</h2>
          <p class="text-xl mb-6">{{ $t('game.end.winner', { player: winner?.name, score: winner?.tokens }) }}</p>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">{{ $t('game.end.finalScores') }}</h3>
            <div class="space-y-2">
              <div
                v-for="(player, index) in sortedPlayers"
                :key="player.id"
                class="flex justify-between items-center p-3 rounded-lg"
                :class="index === 0 ? 'bg-yellow-100' : 'bg-gray-50'"
              >
                <span class="font-medium">{{ index + 1 }}. {{ player.name }}</span>
                <span class="font-bold">{{ player.tokens }} {{ $t('game.score.tokens', { count: player.tokens }) }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-4 justify-center">
            <button @click="playAgain" class="btn btn-primary">
              🔄 {{ $t('game.end.playAgain') }}
            </button>
            <button @click="$router.push('/')" class="btn btn-secondary">
              🏠 {{ $t('game.backToHome') }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import TrackPlayer from '@/components/TrackPlayer.vue'
import PlayerTimeline from '@/components/PlayerTimeline.vue'
import type { Track } from '@/types'

const router = useRouter()
const gameStore = useGameStore()

// Reactive state
const isLoadingTrack = ref(false)

// Computed
const players = computed(() => gameStore.players)
const currentPlayer = computed(() => gameStore.currentPlayer)
const currentTrack = computed(() => gameStore.currentTrack)
const gamePhase = computed(() => gameStore.gamePhase)
const round = computed(() => gameStore.round)
const settings = computed(() => gameStore.settings)
const winner = computed(() => gameStore.winner)
const sortedPlayers = computed(() => 
  [...players.value].sort((a, b) => {
    // Sort by tokens first (official Hitster rule)
    if (b.tokens !== a.tokens) return b.tokens - a.tokens
    // Use score as tiebreaker
    return b.score - a.score
  })
)

// Methods
async function loadNextTrack() {
  isLoadingTrack.value = true
  try {
    const track = await gameStore.getNextTrack()
    if (!track) {
      // Handle error - no tracks available
      console.error('No tracks available')
    }
  } catch (error) {
    console.error('Error loading track:', error)
  } finally {
    isLoadingTrack.value = false
  }
}

function handlePlaceTrack(track: Track, position: number) {
  const isCorrect = gameStore.placeTrackOnTimeline(track, position)
  
  // Show result feedback
  setTimeout(() => {
    gameStore.nextPlayer()
  }, 2000)
}

function handleUseToken(ability: string) {
  if (!currentPlayer.value) return
  
  const success = gameStore.useToken(currentPlayer.value.id, ability as any)
  
  if (success) {
    switch (ability) {
      case 'skip':
        // Skip current track and load a new one
        loadNextTrack()
        break
      case 'hint':
        // Show hint (could be implemented in UI)
        alert(`Hint: This track was released in the ${Math.floor(currentTrack.value?.year! / 10) * 10}s`)
        break
    }
  }
}

function playAgain() {
  gameStore.resetGame()
  router.push('/')
}

// Lifecycle
onMounted(() => {
  // If no game state, redirect to home
  if (gameStore.gamePhase === 'setup' && gameStore.players.length === 0) {
    router.push('/')
  }
})
</script>
