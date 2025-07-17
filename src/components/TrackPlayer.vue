<template>
  <div class="card relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
    <!-- Animated background patterns -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
    
    <div class="relative z-10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 p-6">
      
      <!-- Album Cover (hidden during guessing, shown after answer revealed) -->
      <div class="flex-shrink-0">
        <div v-if="!showAnswer" class="relative group">
          <div class="w-40 h-40 rounded-2xl shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700/50 backdrop-blur-sm">
            <!-- Vinyl record effect -->
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-gray-900 to-black shadow-inner flex items-center justify-center">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
              </div>
            </div>
          </div>
          <!-- Glow effect -->
          <div class="absolute inset-0 w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        </div>
        <div v-else class="relative group">
          <img
            :src="trackImage"
            :alt="track.name"
            class="w-40 h-40 rounded-2xl shadow-2xl object-cover border border-gray-700/50 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-300"
          />
          <!-- Glow effect for revealed image -->
          <div class="absolute inset-0 w-40 h-40 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        </div>
      </div>

      <!-- Track Info and Controls -->
      <div class="flex-1 text-center md:text-left">
        
        <!-- Track Info -->
        <div class="mb-6">
          <p class="text-gray-300 font-medium text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{{ $t('game.turn.listening') }}</p>
          <p class="text-sm text-gray-400 mt-2 font-light">{{ $t('game.turn.placeOnTimeline') }}</p>
        </div>

        <!-- Custom Audio Player -->
        <div class="mb-4">
          <div v-if="!canPlayAudio && isMobileDevice && hasSpotifyUri" class="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-400/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <div class="flex items-center justify-center mb-2">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                {{ $t('game.spotifyConnect.title', 'Spotify Connect') }}
              </h3>
            </div>
            <p class="text-green-200 mb-3 text-sm font-medium">
              {{ $t('game.spotifyConnect.description', 'Music will play through your Spotify app') }}
            </p>
            <div class="bg-green-800/30 rounded-lg p-3 border border-green-500/30">
              <p class="text-green-100 text-xs font-medium mb-1">
                📱 {{ $t('game.spotifyConnect.instructions', 'Make sure your Spotify app is open on this device') }}
              </p>
              <p class="text-green-200 text-xs">
                {{ $t('game.spotifyConnect.note', 'Audio will play through your device speakers or headphones') }}
              </p>
            </div>
          </div>
          
          <div v-else-if="!canPlayFullTrack" class="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-400/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <div class="flex items-center justify-center mb-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                {{ hasSpotifyUri ? $t('game.premiumRequired') : $t('game.demoMode') }}
              </h3>
            </div>
            <p class="text-blue-200 mb-2 text-sm font-medium">
              {{ hasSpotifyUri ? $t('game.needsPremium') : $t('game.needSpotifyForAudio') }}
            </p>
            <p class="text-xs text-blue-300 font-semibold">
              <strong>{{ hasSpotifyUri ? $t('game.premiumNeededForFullPlay') : $t('game.needSpotifyForAudio') }}</strong>
            </p>
            <p class="text-xs text-blue-400 mt-1 opacity-80">{{ $t('game.demoModeInstructions') }}</p>
          </div>
          
          <!-- Compact Custom Player Interface -->
          <div v-if="canPlayAudio" class="music-player-controls bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50 shadow-xl">
            <!-- Compact Controls -->
            <div class="flex items-center justify-center space-x-4">
              <button
                @click="restartTrack"
                class="control-btn group relative"
                :disabled="!canPlayAudio"
                title="Restart"
              >
                <div class="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-600/50 shadow-lg group-hover:from-purple-600 group-hover:to-pink-600 group-hover:border-purple-400/50 transition-all duration-300 group-hover:scale-105">
                  <svg class="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
              
              <button
                @click="togglePlayback"
                class="play-btn group relative"
                :disabled="!canPlayAudio"
              >
                <div class="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/40 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-purple-400/50">
                  <div v-if="isLoading" class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <svg v-else-if="isPlaying" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Reveal Answer (if answered) -->
        <div v-if="showAnswer" class="p-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-400/30 rounded-2xl backdrop-blur-sm">
          <div class="text-center">
            <h4 class="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent mb-2">{{ track.name }}</h4>
            <p class="text-blue-200 text-lg font-medium mb-1">{{ artistNames }}</p>
            <p class="text-blue-300 font-medium">{{ track.album.name }} ({{ track.year }})</p>
            <p class="text-sm text-blue-400 mt-4">
              <a 
                :href="track.external_urls.spotify" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full hover:from-green-500 hover:to-green-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                {{ $t('game.openInSpotify') }}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Placement Instructions -->
    <div v-if="!showAnswer" class="mt-6 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-400/30 rounded-2xl backdrop-blur-sm">
      <div class="text-center">
        <div class="flex items-center justify-center mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="font-bold text-lg bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {{ $t('game.turn.placing') }}
          </p>
        </div>
        <p class="text-purple-200 text-sm font-medium">
          {{ $t('game.dragToTimeline') }}
        </p>
      </div>
    </div>

    <!-- Result Feedback -->
    <div v-if="showResult" class="mt-6 p-6 rounded-2xl text-center backdrop-blur-sm" :class="resultClass">
      <div class="flex items-center justify-center mb-3">
        <div v-if="isCorrect" class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-3 animate-bounce">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div v-else class="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <p class="font-bold text-2xl">{{ resultMessage }}</p>
      </div>
      <p v-if="pointsEarned > 0" class="text-lg mt-2 font-semibold">
        <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {{ $t('game.turn.points', { points: pointsEarned }) }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { spotifyService } from '@/services/spotify'
import type { Track } from '@/types'

interface Props {
  track: Track
  showAnswer?: boolean
  showResult?: boolean
  isCorrect?: boolean
  pointsEarned?: number
}

const props = withDefaults(defineProps<Props>(), {
  showAnswer: false,
  showResult: false,
  isCorrect: false,
  pointsEarned: 0
})

const emit = defineEmits<{
  placeTrack: [track: Track, position: number]
}>()

const { t } = useI18n()

// Reactive state
const isPlaying = ref(false)
const isLoading = ref(false)
const canPlay = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const isMuted = ref(false)
const isDraggingProgress = ref(false)
const isDraggingVolume = ref(false)

// Computed
const trackImage = computed(() => {
  // First try track images, then album images, then placeholder
  const trackImg = props.track.images?.[0]?.url
  const albumImg = props.track.album.images?.[0]?.url
  
  return trackImg || albumImg || 'https://via.placeholder.com/300x300/6B7280/FFFFFF?text=No+Image'
})

const artistNames = computed(() => {
  return props.track.artists.map(artist => artist.name).join(', ')
})

const resultClass = computed(() => {
  if (!props.showResult) return ''
  return props.isCorrect 
    ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-400/30 text-cyan-100'
    : 'bg-gradient-to-r from-red-900/40 to-pink-900/40 border border-red-400/30 text-red-100'
})

const resultMessage = computed(() => {
  if (!props.showResult) return ''
  return props.isCorrect
    ? t('game.turn.correct', { year: props.track.year })
    : t('game.turn.incorrect', { year: props.track.year })
})

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const hasSpotifyUri = computed(() => {
  return !!props.track.uri
})

const isMobileDevice = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

const canPlayFullTrack = computed(() => {
  // On mobile: use Spotify Connect if authenticated
  // On desktop: use Web Playback SDK if ready
  if (isMobileDevice.value) {
    return hasSpotifyUri.value && spotifyService.isAuthenticated()
  }
  return hasSpotifyUri.value && spotifyService.isPlayerReady()
})

const canPlayAudio = computed(() => {
  return canPlayFullTrack.value || !!props.track.preview_url
})

// Methods
async function togglePlayback() {
  console.log('=== TOGGLE PLAYBACK DEBUG ===')
  console.log('Current isPlaying state:', isPlaying.value)
  console.log('Can play full track:', canPlayFullTrack.value)
  console.log('Is mobile device:', isMobileDevice.value)
  console.log('Has Spotify URI:', hasSpotifyUri.value)
  console.log('Track URI:', props.track.uri)
  
  try {
    if (canPlayFullTrack.value && props.track.uri) {
      if (isMobileDevice.value) {
        console.log('🎵 Using Spotify Connect for mobile...')
      } else {
        console.log('🎵 Using Spotify Web Playback SDK for desktop...')
      }
      
      if (isPlaying.value) {
        console.log('⏸️ Pausing playback...')
        const success = await spotifyService.pausePlayback()
        if (success) {
          isPlaying.value = false
          console.log('✅ Pause successful')
        }
      } else {
        console.log('▶️ Starting playback...')
        const success = await spotifyService.startPlayback(props.track.uri)
        if (success) {
          isPlaying.value = true
          console.log('✅ Play successful')
          
          // Monitor playback state
          if (isMobileDevice.value) {
            monitorSpotifyConnectPlayback()
          } else {
            monitorSpotifyPlayback()
          }
        } else {
          console.error('❌ Play failed')
        }
      }
    } else {
      console.log('❌ Cannot play full track - missing requirements')
    }
  } catch (error) {
    console.error('❌ Playback error:', error)
    
    // Show user-friendly error for mobile
    if (isMobileDevice.value && error.message.includes('No active Spotify device')) {
      alert('Please open the Spotify app on your device first, then try again.')
    }
  }
  
  console.log('Final isPlaying state:', isPlaying.value)
  console.log('=== END TOGGLE PLAYBACK DEBUG ===')
}

// Add method to monitor Spotify Connect playback
function monitorSpotifyConnectPlayback() {
  const checkPlayback = async () => {
    if (!canPlayFullTrack.value || !isMobileDevice.value) return
    
    const state = await spotifyService.getSpotifyConnectState()
    if (state) {
      const isCurrentTrack = state.item?.uri === props.track.uri
      const isActuallyPlaying = state.is_playing && isCurrentTrack
      
      console.log('Spotify Connect state check:', {
        is_playing: state.is_playing,
        currentTrackUri: state.item?.uri,
        expectedUri: props.track.uri,
        isCurrentTrack,
        isActuallyPlaying,
        componentIsPlaying: isPlaying.value
      })
      
      // Sync component state with actual playback
      if (isPlaying.value !== isActuallyPlaying) {
        console.log(`🔄 Syncing Spotify Connect state: ${isPlaying.value} → ${isActuallyPlaying}`)
        isPlaying.value = isActuallyPlaying
      }
      
      if (isPlaying.value) {
        setTimeout(checkPlayback, 2000) // Check again in 2 seconds
      }
    } else {
      // No active playback
      if (isPlaying.value) {
        console.log('No active Spotify Connect playback detected')
        isPlaying.value = false
      }
    }
  }
  
  checkPlayback()
}

// Monitor Spotify playback state
function monitorSpotifyPlayback() {
  const checkPlayback = async () => {
    if (!canPlayFullTrack.value) return
    
    const state = await spotifyService.getPlaybackState()
    if (state) {
      isPlaying.value = !state.paused
      currentTime.value = state.position / 1000 // Convert to seconds
      duration.value = state.duration / 1000 // Convert to seconds
      
      if (isPlaying.value) {
        setTimeout(checkPlayback, 1000) // Check again in 1 second
      }
    }
  }
  
  checkPlayback()
}

// Add this to monitor actual playback state
async function checkPlaybackState() {
  if (spotifyService.isPlayerReady()) {
    try {
      const state = await spotifyService.getPlaybackState()
      if (state) {
        const isCurrentTrack = state.track_window?.current_track?.uri === props.track.uri
        const isActuallyPlaying = state.paused === false && isCurrentTrack
        
        console.log('Playback state check:', {
          paused: state.paused,
          currentTrackUri: state.track_window?.current_track?.uri,
          expectedUri: props.track.uri,
          isCurrentTrack,
          isActuallyPlaying,
          componentIsPlaying: isPlaying.value
        })
        
        // Sync component state with actual playback
        if (isPlaying.value !== isActuallyPlaying) {
          console.log(`🔄 Syncing playback state: ${isPlaying.value} → ${isActuallyPlaying}`)
          isPlaying.value = isActuallyPlaying
        }
      }
    } catch (error) {
      console.warn('Could not check playback state:', error)
    }
  }
}

// Call this periodically when component is mounted
onMounted(() => {
  // Check playback state every 2 seconds
  const interval = setInterval(checkPlaybackState, 2000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})

function handleVolumeTouch(event: TouchEvent) {
  // Let the default range input handle touch events
  // This prevents conflicts with our custom touch handling
  event.stopPropagation()
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(() => {
  // Initialize Spotify player if authenticated
  if (spotifyService.isAuthenticated()) {
    nextTick(() => {
      spotifyService.initializePlayerIfReady()
    })
  }
})

// Watch for track changes to auto-start playback
watch(() => props.track, async (newTrack, oldTrack) => {
  if (newTrack && newTrack !== oldTrack) {
    console.log('New track detected:', newTrack.name)
    
    // Wait a moment for the audio element to be ready
    await nextTick()
    
    // Reset playing state when new track is loaded
    isPlaying.value = false
    
    // Auto-start playback
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Always try auto-start, but handle mobile restrictions gracefully
    setTimeout(async () => {
      console.log('Checking if auto-playback can start:', { 
        canPlayAudio: canPlayAudio.value, 
        canPlayFullTrack: canPlayFullTrack.value,
        hasSpotifyUri: hasSpotifyUri.value,
        isPlayerReady: spotifyService.isPlayerReady(),
        isPlaying: isPlaying.value 
      })
      
      if (canPlayAudio.value && !isPlaying.value) {
        console.log('Auto-starting playback for new track:', newTrack.name)
        try {
          await togglePlayback()
          console.log('✅ Auto-playback started successfully')
        } catch (error) {
          if (isMobile) {
            console.log('🔇 Auto-playback blocked on mobile - user interaction required')
          } else {
            console.error('❌ Auto-playback failed:', error)
          }
        }
      } else {
        const reason = !canPlayAudio.value ? 'No audio source available' : 'Already playing'
        console.log(`Cannot auto-start playback: ${reason}`)
        
        // On desktop, if has Spotify URI, try to use Spotify Web Playback SDK
        if (!isMobile && hasSpotifyUri.value) {
          console.log('Has Spotify URI - playback will use Spotify Web Playback SDK')
        }
      }
    }, 300) // Longer delay for better reliability and to let Spotify services initialize
  }
}, { immediate: false })

onUnmounted(() => {
  // Stop any playback when component unmounts
  if (canPlayFullTrack.value) {
    spotifyService.stopPlayback()
  }
})
</script>

<style scoped>
/* Custom animations and effects */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* Volume slider styling */
.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  transition: all 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
}

/* Progress bar track background with gradient */
.volume-slider {
  background: linear-gradient(to right, #374151, #4b5563);
  outline: none;
}

/* Hover effects for buttons */
.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Glass morphism effect */
.card {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Enhanced glow effects */
.group:hover .absolute {
  transition: all 0.3s ease;
}

/* Pulse animation for notification icons */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}
</style>
