<template>
  <div class="card">
    <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
      
      <!-- Album Cover (hidden during guessing, shown after answer revealed) -->
      <div class="flex-shrink-0">
        <div v-if="!showAnswer" class="w-32 h-32 rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
        </div>
        <img
          v-else
          :src="trackImage"
          :alt="track.name"
          class="w-32 h-32 rounded-lg shadow-lg object-cover"
        />
      </div>

      <!-- Track Info and Controls -->
      <div class="flex-1 text-center md:text-left">
        
        <!-- Track Info -->
        <div class="mb-4">
          <p class="text-gray-600">{{ $t('game.turn.listening') }}</p>
          <p class="text-sm text-gray-500">{{ $t('game.turn.placeOnTimeline') }}</p>
        </div>

        <!-- Custom Audio Player -->
        <div class="mb-4">
          <div v-if="!canPlayFullTrack" class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <svg class="w-8 h-8 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
              </svg>
              <h3 class="text-lg font-semibold text-blue-800">
                {{ hasSpotifyUri ? $t('game.premiumRequired') : $t('game.demoMode') }}
              </h3>
            </div>
            <p class="text-blue-700 mb-2">
              {{ hasSpotifyUri ? $t('game.needsPremium') : $t('game.noPreview') }}
            </p>
            <p class="text-sm text-blue-600">
              <strong>{{ hasSpotifyUri ? $t('game.premiumNeededForFullPlay') : $t('game.needSpotifyForAudio') }}</strong>
            </p>
            <p class="text-xs text-blue-500 mt-1">{{ $t('game.demoModeInstructions') }}</p>
          </div>
          
          <!-- Hidden Audio Element (for preview fallback) -->
          <audio
            v-if="canPlayPreview && !canPlayFullTrack"
            ref="audioPlayer"
            :src="track.preview_url || undefined"
            @ended="onAudioEnded"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @loadstart="onLoadStart"
            @canplay="onCanPlay"
            preload="metadata"
          >
            {{ $t('game.audioNotSupported') }}
          </audio>

          <!-- Custom Player Interface -->
          <div v-if="canPlayAudio" class="music-player-controls bg-gray-900 rounded-lg p-4">
            <!-- Main Controls -->
            <div class="flex items-center justify-center space-x-6 mb-4">
              <button
                @click="restartTrack"
                class="control-btn"
                :disabled="!canPlayAudio"
                title="Restart"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button
                @click="togglePlayback"
                class="play-btn"
                :disabled="!canPlayAudio"
              >
                <div v-if="isLoading" class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <svg v-else-if="isPlaying" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
              </button>

              <button
                @click="toggleMute"
                class="control-btn"
                :disabled="!canPlayAudio"
                title="Mute/Unmute"
              >
                <svg v-if="isMuted || volume === 0" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.83 13.6H2a1 1 0 01-1-1V7.4a1 1 0 011-1h2.83l3.553-3.193a1 1 0 011.617.793zM16 8.4A1 1 0 1117.6 7a4 4 0 010 6 1 1 0 11-1.6-1.2 2 2 0 000-3.6z" clip-rule="evenodd" />
                  <path d="M18.293 6.293a1 1 0 011.414 1.414L17.414 10l2.293 2.293a1 1 0 01-1.414 1.414L16 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L14.586 10l-2.293-2.293a1 1 0 011.414-1.414L16 8.586l2.293-2.293z"/>
                </svg>
                <svg v-else-if="volume < 0.5" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.83 13.6H2a1 1 0 01-1-1V7.4a1 1 0 011-1h2.83l3.553-3.193a1 1 0 011.617.793zM15 8.4A1 1 0 1116.6 7a2 2 0 010 6 1 1 0 11-1.6-1.2V8.4z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.83 13.6H2a1 1 0 01-1-1V7.4a1 1 0 011-1h2.83l3.553-3.193a1 1 0 011.617.793zM15 8.4A1 1 0 1116.6 7a4 4 0 010 6 1 1 0 11-1.6-1.2 2 2 0 000-3.6z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <!-- Progress Bar -->
            <div class="mb-3">
              <div class="flex items-center space-x-3 text-xs text-gray-300">
                <span class="w-12 text-right">{{ formatTime(currentTime) }}</span>
                <div class="flex-1 relative">
                  <div 
                    class="progress-track" 
                    @click="seekTo($event)" 
                    @touchstart="startProgressDrag($event)"
                    @touchmove="updateProgressDrag($event)"
                    @touchend="endProgressDrag($event)"
                  >
                    <div 
                      class="progress-fill" 
                      :style="{ width: progressPercent + '%' }"
                    ></div>
                    <div 
                      class="progress-handle" 
                      :style="{ left: progressPercent + '%' }"
                    ></div>
                  </div>
                </div>
                <span class="w-12">{{ formatTime(duration) }}</span>
              </div>
            </div>

            <!-- Volume Control -->
            <div class="flex items-center space-x-3">
              <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.83 13.6H2a1 1 0 01-1-1V7.4a1 1 0 011-1h2.83l3.553-3.193a1 1 0 011.617.793z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  :value="volume"
                  @input="updateVolume"
                  @touchstart="handleVolumeTouch"
                  @touchmove="handleVolumeTouch"
                  @touchend="handleVolumeTouch"
                  class="volume-slider"
                  :disabled="!track.preview_url"
                />
              </div>
              <span class="text-xs text-gray-400 w-8">{{ Math.round(volume * 100) }}%</span>
            </div>
          </div>
        </div>

        <!-- Reveal Answer (if answered) -->
        <div v-if="showAnswer" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="text-center">
            <h4 class="text-lg font-bold text-blue-800">{{ track.name }}</h4>
            <p class="text-blue-700">{{ artistNames }}</p>
            <p class="text-blue-600">{{ track.album.name }} ({{ track.year }})</p>
            <p class="text-sm text-blue-500 mt-2">
              <a 
                :href="track.external_urls.spotify" 
                target="_blank" 
                rel="noopener noreferrer"
                class="underline hover:no-underline"
              >
                {{ $t('game.openInSpotify') }} ↗
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Placement Instructions -->
    <div v-if="!showAnswer" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-center font-medium text-yellow-800">
        {{ $t('game.turn.placing') }}
      </p>
      <p class="text-center text-sm text-yellow-700 mt-1">
        {{ $t('game.dragToTimeline') }}
      </p>
    </div>

    <!-- Result Feedback -->
    <div v-if="showResult" class="mt-4 p-4 rounded-lg text-center" :class="resultClass">
      <p class="font-bold text-lg">{{ resultMessage }}</p>
      <p v-if="pointsEarned > 0" class="text-sm mt-1">
        {{ $t('game.turn.points', { points: pointsEarned }) }}
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
const audioPlayer = ref<HTMLAudioElement>()
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
    ? 'bg-green-50 border border-green-200 text-green-800'
    : 'bg-red-50 border border-red-200 text-red-800'
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

const canPlayFullTrack = computed(() => {
  return hasSpotifyUri.value && spotifyService.isPlayerReady()
})

const canPlayPreview = computed(() => {
  return !!props.track.preview_url
})

const canPlayAudio = computed(() => {
  return canPlayFullTrack.value || canPlayPreview.value
})

// Methods
async function togglePlayback() {
  console.log('Toggle playback called, isPlaying:', isPlaying.value)
  console.log('Can play full track:', canPlayFullTrack.value)
  console.log('Can play preview:', canPlayPreview.value)
  console.log('Spotify player ready:', spotifyService.isPlayerReady())
  
  if (canPlayFullTrack.value) {
    // Debug: Check available devices
    await spotifyService.getAvailableDevices()
    
    // Use Spotify Web Playback SDK for full tracks
    if (isPlaying.value) {
      await spotifyService.pausePlayback()
      isPlaying.value = false
    } else {
      const success = await spotifyService.playTrack(props.track.uri!)
      if (success) {
        isPlaying.value = true
        // Start monitoring playback state
        monitorSpotifyPlayback()
      } else {
        console.warn('Failed to play track, falling back to preview if available')
        // Fallback to preview if full track fails
        if (canPlayPreview.value && audioPlayer.value) {
          audioPlayer.value.play().catch(error => {
            console.error('Error playing preview fallback:', error)
          })
        }
      }
    }
  } else if (canPlayPreview.value && audioPlayer.value) {
    // Fallback to HTML5 audio for previews
    if (isPlaying.value) {
      audioPlayer.value.pause()
    } else {
      audioPlayer.value.play().catch(error => {
        console.error('Error playing audio:', error)
      })
    }
  }
}

async function restartTrack() {
  console.log('Restart track called')
  
  if (canPlayFullTrack.value) {
    // Restart full track
    const success = await spotifyService.playTrack(props.track.uri!)
    if (success) {
      isPlaying.value = true
      monitorSpotifyPlayback()
    }
  } else if (audioPlayer.value) {
    // Restart preview
    audioPlayer.value.currentTime = 0
    if (isPlaying.value) {
      audioPlayer.value.play().catch(error => {
        console.error('Error playing audio after restart:', error)
      })
    }
  }
}

async function stopPlayback() {
  if (canPlayFullTrack.value) {
    await spotifyService.stopPlayback()
  } else if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
  isPlaying.value = false
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

function toggleMute() {
  if (!audioPlayer.value) return
  
  if (isMuted.value) {
    audioPlayer.value.volume = volume.value
    isMuted.value = false
  } else {
    audioPlayer.value.volume = 0
    isMuted.value = true
  }
}

function updateVolume(event: Event) {
  if (!audioPlayer.value) return
  
  const target = event.target as HTMLInputElement
  const newVolume = parseFloat(target.value)
  volume.value = newVolume
  audioPlayer.value.volume = newVolume
  
  if (newVolume === 0) {
    isMuted.value = true
  } else if (isMuted.value) {
    isMuted.value = false
  }
}

function handleVolumeTouch(event: TouchEvent) {
  // Let the default range input handle touch events
  // This prevents conflicts with our custom touch handling
  event.stopPropagation()
}

function seekTo(event: MouseEvent | TouchEvent) {
  if (!audioPlayer.value || !props.track.preview_url) return
  
  const progressTrack = event.currentTarget as HTMLElement
  const rect = progressTrack.getBoundingClientRect()
  
  // Handle both mouse and touch events
  let clientX: number
  if ('touches' in event) {
    if (event.touches.length > 0) {
      clientX = event.touches[0].clientX
    } else if (event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX
    } else {
      return
    }
  } else {
    clientX = event.clientX
  }
  
  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  const newTime = percent * duration.value
  
  audioPlayer.value.currentTime = newTime
}

// Progress bar touch drag functions
function startProgressDrag(event: TouchEvent) {
  if (!audioPlayer.value || !props.track.preview_url) return
  event.preventDefault()
  isDraggingProgress.value = true
  updateProgressFromTouch(event)
}

function updateProgressDrag(event: TouchEvent) {
  if (!isDraggingProgress.value) return
  event.preventDefault()
  updateProgressFromTouch(event)
}

function endProgressDrag(event: TouchEvent) {
  if (!isDraggingProgress.value) return
  event.preventDefault()
  isDraggingProgress.value = false
  updateProgressFromTouch(event)
}

function updateProgressFromTouch(event: TouchEvent) {
  if (!audioPlayer.value || !props.track.preview_url) return
  
  const progressTrack = event.currentTarget as HTMLElement
  const rect = progressTrack.getBoundingClientRect()
  
  const touch = event.touches[0] || event.changedTouches[0]
  if (!touch) return
  
  const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
  const newTime = percent * duration.value
  
  audioPlayer.value.currentTime = newTime
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Audio event handlers
function onTimeUpdate() {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration
    audioPlayer.value.volume = volume.value
  }
}

function onLoadStart() {
  isLoading.value = true
  canPlay.value = false
}

function onCanPlay() {
  isLoading.value = false
  canPlay.value = true
}

function onAudioEnded() {
  isPlaying.value = false
}

// Lifecycle
onMounted(() => {
  // Initialize Spotify player if authenticated
  if (spotifyService.isAuthenticated()) {
    nextTick(() => {
      spotifyService.initializePlayerIfReady()
    })
  }
  
  // Use nextTick to ensure the DOM is fully rendered
  nextTick(() => {
    if (audioPlayer.value) {
      setupAudioEventListeners()
    }
  })
})

// Watch for changes to the audio element and set up listeners
watch(audioPlayer, (newAudio: HTMLAudioElement | undefined) => {
  if (newAudio) {
    setupAudioEventListeners()
  }
})

function setupAudioEventListeners() {
  if (!audioPlayer.value) return
  
  audioPlayer.value.addEventListener('play', () => {
    isPlaying.value = true
  })
  
  audioPlayer.value.addEventListener('pause', () => {
    isPlaying.value = false
  })
  
  // Set initial volume
  audioPlayer.value.volume = volume.value
}

onUnmounted(() => {
  // Stop any playback when component unmounts
  if (canPlayFullTrack.value) {
    spotifyService.stopPlayback()
  } else if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})
</script>
