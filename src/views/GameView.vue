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
            <div class="flex items-center space-x-3 text-sm opacity-80">
              <span>{{ $t('game.round') }} {{ round }}</span>
              <span v-if="settings.theme" class="px-2 py-1 bg-purple-500/30 rounded-full border border-purple-400/50 text-purple-200 font-medium">
                🎵 {{ $t(`game.themes.${settings.theme}`) }}
              </span>
              <span v-else class="px-2 py-1 bg-gray-500/30 rounded-full border border-gray-400/50 text-gray-200 font-medium">
                🎵 {{ $t('game.allMusic') }}
              </span>
            </div>
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
          <h2 class="text-2xl font-bold text-white mb-2">
            {{ $t('game.turn.currentPlayer', { player: currentPlayer?.name }) }}
          </h2>
          <p class="text-white">{{ $t('game.turn.ready') }}</p>
          
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

        <!-- Spotify Status Warning (when not connected) -->
        <div v-if="!isSpotifyConnected" class="card bg-yellow-50 border-yellow-200">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-yellow-800">{{ $t('game.spotify.notConnected') }}</h3>
              <p class="text-yellow-700 text-sm">{{ $t('game.demoModeActive') }}</p>
            </div>
            <div class="flex space-x-2">
              <button @click="goToLogin" class="btn btn-sm bg-yellow-600 hover:bg-yellow-700 text-white">
                {{ $t('game.spotify.login') }}
              </button>
              <button @click="reauthorizeSpotify" class="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white">
                🔐 Re-auth
              </button>
              <button @click="refreshSpotifyAuth" class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white">
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        <!-- Spotify Permissions Warning (when connected but can't play) -->
        <div v-else-if="isSpotifyConnected && needsReauth" class="card bg-orange-50 border-orange-200">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-orange-800">Playback Permissions Needed</h3>
              <p class="text-orange-700 text-sm">Your Spotify connection needs updated permissions to play music.</p>
            </div>
            <div class="flex space-x-2">
              <button @click="reauthorizeSpotify" class="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white">
                🔐 Update Permissions
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Device Instructions -->
        <div v-if="isMobileDevice && isSpotifyConnected" class="card bg-blue-50 border-blue-200">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-blue-800">Mobile Device Detected</h3>
              <p class="text-blue-700 text-sm">Music will play through your Spotify app using Spotify Connect.</p>
              <p class="text-blue-600 text-xs mt-1">💡 If playback stops working, open Spotify and tap play, then return to the game.</p>
            </div>
          </div>
        </div>

        <!-- Track Player -->
        <TrackPlayer
          v-if="currentTrack"
          :track="currentTrack"
          :show-result="showResult"
          :show-answer="showAnswer"
          :is-correct="lastPlacementResult.isCorrect"
          :points-earned="lastPlacementResult.pointsEarned"
          @place-track="handlePlaceTrack"
        />

        <!-- Continue Button for Wrong Answers -->
        <div v-if="showCorrectAnswer && !lastPlacementResult.isCorrect" class="text-center mb-6">
          <div class="card bg-gradient-to-r from-red-900/40 to-pink-900/40 border border-red-400/30 backdrop-blur-sm">
            <div class="mb-4">
              <div class="flex items-center justify-center mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div class="text-center">
                  <h3 class="text-2xl font-bold text-red-200 mb-2">{{ $t('game.turn.wrongPlacement') }}</h3>
                  <div class="text-red-100">
                    <p class="text-lg font-semibold">{{ currentTrack?.name }}</p>
                    <p class="text-base">{{ currentTrack?.artists.map(a => a.name).join(', ') }}</p>
                    <p class="text-sm opacity-90">{{ $t('game.turn.releasedIn', { year: currentTrack?.year }) }}</p>
                  </div>
                </div>
              </div>
              <p class="text-red-200 text-lg mb-4">{{ $t('game.turn.correctPlacement') }}</p>
              <p class="text-red-300 text-sm">{{ $t('game.turn.studyTimeline') }}</p>
            </div>
            <button 
              @click="continueAfterWrongAnswer"
              class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              {{ $t('game.turn.continue') }}
            </button>
          </div>
        </div>

        <!-- Current Player Timeline -->
        <div v-if="currentPlayer && currentPlayer.timeline" class="max-w-4xl mx-auto">
          <PlayerTimeline
            :player="currentPlayer"
            :is-current="true"
            :current-track="currentTrack"
            :can-place="!!currentTrack"
            @place-track="handlePlaceTrack"
            @use-token="handleUseToken"
          />
        </div>

        <!-- Scores -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4 text-gray-100">{{ $t('game.score.title') }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="player in players"
              :key="player.id"
              class="text-center p-3 rounded-lg"
              :class="player.id === currentPlayer?.id ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-50'"
            >
              <p class="font-semibold text-gray-800">{{ player.name }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ player.tokens }}</p>
              <p class="text-sm text-gray-600">{{ $t('game.score.tokens', { count: player.tokens }) }}</p>
              <p class="text-xs text-gray-500">{{ $t('game.score.total', { score: player.score }) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Finished -->
      <div v-else-if="gamePhase === 'finished'" class="max-w-2xl mx-auto">
        <div class="card text-center">
          <h2 class="text-3xl font-bold mb-4 text-white">{{ $t('game.end.title') }}</h2>
          <p class="text-xl mb-6">{{ $t('game.end.winner', { player: winner?.name, score: winner?.timeline?.length || 0 }) }}</p>
          
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">{{ $t('game.end.finalScores') }}</h3>
            <div class="space-y-2">
              <div
                v-for="(player, index) in sortedPlayers"
                :key="player.id"
                class="flex justify-between items-center p-3 rounded-lg"
                :class="index === 0 ? 'bg-yellow-100' : 'bg-gray-50'"
              >
                <span class="font-medium text-gray-800">{{ index + 1 }}. {{ player.name }}</span>
                <span class="font-bold text-gray-800">{{ player.timeline?.length || 0 }} {{ $t('game.songs') }} | {{ player.tokens }} {{ $t('game.score.tokens', { count: player.tokens }) }}</span>
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

    <!-- Hint Dialog -->
    <div v-if="showHintDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/20 shadow-2xl shadow-purple-500/10 rounded-2xl p-8 max-w-md w-full mx-auto relative overflow-hidden">
        <!-- Animated background patterns -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div class="relative z-10">
          <!-- Header -->
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-2xl">💡</span>
            </div>
            <h3 class="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              {{ $t('game.tokens.hint.label') }}
            </h3>
          </div>
          
          <!-- Hint Content -->
          <div class="mb-8">
            <p class="text-gray-200 text-lg leading-relaxed">
              {{ hintMessage }}
            </p>
          </div>
          
          <!-- Close Button -->
          <div class="flex justify-center">
            <button 
              @click="closeHintDialog"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { spotifyService } from '@/services/spotify'
import TrackPlayer from '@/components/TrackPlayer.vue'
import PlayerTimeline from '@/components/PlayerTimeline.vue'
import type { Track } from '@/types'

const router = useRouter()
const gameStore = useGameStore()

// Reactive state
const isLoadingTrack = ref(false)
const showHintDialog = ref(false)
const hintMessage = ref('')
const spotifyAuthState = ref(spotifyService.isAuthenticated())
const showResult = ref(false)
const showAnswer = ref(false)
const showCorrectAnswer = ref(false)
const lastPlacementResult = ref({ isCorrect: false, pointsEarned: 0 })

// Computed
const players = computed(() => gameStore.players)
const currentPlayer = computed(() => gameStore.currentPlayer)
const currentTrack = computed(() => gameStore.currentTrack)
const gamePhase = computed(() => gameStore.gamePhase)
const round = computed(() => gameStore.round)
const settings = computed(() => gameStore.settings)
const winner = computed(() => gameStore.winner)
const isSpotifyConnected = computed(() => spotifyAuthState.value)
const isMobileDevice = computed(() => 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|CriOS/i.test(navigator.userAgent)
)
const needsReauth = computed(() => {
  // Only show reauth warning if:
  // 1. User is connected 
  // 2. Player initialization was attempted but failed after reasonable time
  // 3. Or if there's a specific permission error
  
  if (!isSpotifyConnected.value) return false
  
  // Give the player some time to initialize (30 seconds)
  const playerNotReadyForLongTime = !spotifyService.isPlayerReady()
  
  // Only show warning if we're confident there's an issue
  return playerNotReadyForLongTime && timeSpentInGame.value > 30000
})

// Track time spent in game to avoid premature reauth warnings
const gameStartTime = ref(Date.now())
const timeSpentInGame = computed(() => Date.now() - gameStartTime.value)
const sortedPlayers = computed(() => 
  [...players.value].sort((a, b) => {
    // Sort by timeline length first (main winning condition)
    const aLength = a.timeline?.length || 0
    const bLength = b.timeline?.length || 0
    if (bLength !== aLength) return bLength - aLength
    // Sort by tokens as tiebreaker
    if (b.tokens !== a.tokens) return b.tokens - a.tokens
    // Use score as final tiebreaker
    return b.score - a.score
  })
)

// Methods
async function loadNextTrack() {
  isLoadingTrack.value = true
  // Reset feedback states for new track
  showResult.value = false
  showAnswer.value = false
  lastPlacementResult.value = { isCorrect: false, pointsEarned: 0 }
  
  try {
    console.log('Loading next track...')
    const track = await gameStore.getNextTrack()
    if (!track) {
      // Handle error - no tracks available
      console.error('No tracks available')
    } else {
      console.log('Track loaded successfully:', track.name, 'by', track.artists[0]?.name)
      // Note: Auto-playback will be handled by TrackPlayer component's track watcher
    }
  } catch (error) {
    console.error('Error loading track:', error)
  } finally {
    isLoadingTrack.value = false
  }
}

function handlePlaceTrack(track: Track, position: number) {
  const isCorrect = gameStore.placeTrackOnTimeline(track, position)
  
  // Calculate points earned (similar to game store logic)
  let pointsEarned = 0
  if (isCorrect && currentPlayer.value) {
    pointsEarned = 1
    if (currentPlayer.value.timeline.length >= 5) pointsEarned = 2
    if (currentPlayer.value.timeline.length >= 8) pointsEarned = 3
  }
  
  // Store the result
  lastPlacementResult.value = { isCorrect, pointsEarned }
  
  // Show result feedback immediately
  showResult.value = true
  
  // Show answer (album cover and full track info) after a brief delay
  setTimeout(() => {
    showAnswer.value = true
  }, 500)
  
  if (isCorrect) {
    // For correct answers, proceed normally
    setTimeout(() => {
      // Reset the feedback states
      showResult.value = false
      showAnswer.value = false
      // Move to next player
      gameStore.nextPlayer()
    }, 4000)
  } else {
    // For wrong answers, show the correct answer and wait for user to continue
    setTimeout(() => {
      // Show the correct placement by temporarily placing the track correctly
      showCorrectAnswer.value = true
      
      // Find correct position and place the track there temporarily
      if (currentPlayer.value && currentTrack.value) {
        const correctPosition = findCorrectPosition(currentTrack.value, currentPlayer.value.timeline)
        const tempTrack = { ...currentTrack.value, revealed: true }
        gameStore.addTrackToTimelineAtPosition(tempTrack, correctPosition)
      }
    }, 1500)
  }
}

function findCorrectPosition(track: Track, timeline: Track[]): number {
  // Find where this track should be placed chronologically
  for (let i = 0; i < timeline.length; i++) {
    if (track.year <= timeline[i].year) {
      return i
    }
  }
  return timeline.length
}

function continueAfterWrongAnswer() {
  // Remove the temporarily placed track
  if (currentTrack.value && currentPlayer.value) {
    gameStore.removeTrackFromTimeline(currentTrack.value.id)
  }
  
  // Reset all feedback states
  showResult.value = false
  showAnswer.value = false
  showCorrectAnswer.value = false
  
  // Move to next player
  gameStore.nextPlayer()
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
        // Show hint in styled dialog
        const decade = Math.floor(currentTrack.value?.year! / 10) * 10
        hintMessage.value = `This track was released in the ${decade}s`
        showHintDialog.value = true
        break
    }
  }
}

function closeHintDialog() {
  showHintDialog.value = false
  hintMessage.value = ''
}

function playAgain() {
  gameStore.resetGame()
  router.push('/')
}

function goToLogin() {
  router.push('/')
}

function refreshSpotifyAuth() {
  const isAuth = spotifyService.isAuthenticated()
  console.log('Spotify auth check in GameView:', {
    isAuthenticated: isAuth,
    previousState: isSpotifyConnected.value
  })
  
  // Update reactive state only if it changed to prevent unnecessary updates
  if (spotifyAuthState.value !== isAuth) {
    spotifyAuthState.value = isAuth
    console.log('Spotify auth state updated:', isAuth)
  }
  
  // Initialize player if authenticated but not attempted yet
  if (isAuth && !spotifyService.isPlayerReady()) {
    console.log('Initializing player after auth check')
    spotifyService.initializePlayerIfReady()
  }
}

async function reauthorizeSpotify() {
  console.log('🔄 Re-authorizing Spotify with updated permissions')
  await spotifyService.forceReauth()
  // Refresh auth state after reauthorization
  refreshSpotifyAuth()
}

// Lifecycle
onMounted(() => {
  // If no game state, redirect to home
  if (gameStore.gamePhase === 'setup' && gameStore.players.length === 0) {
    router.push('/')
  }
  
  // Refresh Spotify auth state once on mount
  refreshSpotifyAuth()
  
  // Start session maintenance for mobile devices if authenticated
  if (spotifyService.isAuthenticated()) {
    spotifyService.startSessionMaintenance()
  }
  
  // Check auth state much less frequently to prevent multiple login prompts
  const authCheckInterval = setInterval(() => {
    // Only check if user isn't already authenticated to avoid unnecessary calls
    if (!spotifyAuthState.value) {
      refreshSpotifyAuth()
    } else {
      // Ensure session maintenance is running for authenticated users
      spotifyService.startSessionMaintenance()
    }
  }, 120000) // Check every 2 minutes instead of 60 seconds
  
  // Clean up interval on unmount
  onUnmounted(() => {
    clearInterval(authCheckInterval)
    // Stop session maintenance when leaving the game
    spotifyService.stopSessionMaintenance()
  })
})

// Watch for track changes to reset feedback states
watch(currentTrack, (newTrack) => {
  if (newTrack) {
    // Reset feedback states when a new track is loaded
    showResult.value = false
    showAnswer.value = false
    lastPlacementResult.value = { isCorrect: false, pointsEarned: 0 }
  }
})
</script>
