<template>
  <div class="card relative overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-500/10">
    <!-- Animated background patterns -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
    
    <div class="relative z-10 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 p-4">
      
      <!-- Album Cover (hidden during guessing, shown after answer revealed) -->
      <div class="flex-shrink-0">
        <div v-if="!showAnswer" class="relative group">
          <div class="w-24 h-24 rounded-xl shadow-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700/50 backdrop-blur-sm">
            <!-- Vinyl record effect -->
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 shadow-inner flex items-center justify-center">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
              </div>
            </div>
          </div>
          <!-- Glow effect -->
          <div class="absolute inset-0 w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        </div>
        <div v-else class="relative group">
          <img
            :src="trackImage"
            :alt="track.name"
            class="w-24 h-24 rounded-xl shadow-xl object-cover border border-gray-700/50 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-300"
          />
          <!-- Glow effect for revealed image -->
          <div class="absolute inset-0 w-24 h-24 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        </div>
      </div>

      <!-- Track Info and Controls -->
      <div class="flex-1 text-center md:text-left">
        
        <!-- Track Info -->
        <div class="mb-3">
          <p class="text-gray-300 font-medium text-base bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{{ $t('game.turn.listening') }}</p>
          <p class="text-xs text-gray-400 mt-1 font-light">{{ $t('game.turn.placeOnTimeline') }}</p>
        </div>

        <!-- Custom Audio Player -->
        <div class="mb-3">
          <!-- Device Help Modal -->
          <div v-if="showDeviceHelp" class="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-400/30 rounded-xl p-4 text-center backdrop-blur-sm mb-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <h3 class="text-sm font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                  {{ deviceError === 'NO_DEVICES' ? $t('game.deviceHelp.noDevices.title', 'No Spotify App Found') : 
                     deviceError === 'DEVICE_INACTIVE' ? $t('game.deviceHelp.inactive.title', 'Spotify App Inactive') :
                     deviceError === 'ACTIVATION_FAILED' ? $t('game.deviceHelp.activationFailed.title', 'Device Activation Failed') :
                     $t('game.deviceHelp.generic.title', 'Playback Issue') }}
                </h3>
              </div>
              <button @click="dismissDeviceHelp" class="text-amber-300 hover:text-amber-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div class="text-left space-y-2">
              <p class="text-amber-200 text-xs font-medium">
                {{ deviceError === 'NO_DEVICES' ? $t('game.deviceHelp.noDevices.message', 'No Spotify devices detected.') :
                   deviceError === 'DEVICE_INACTIVE' ? $t('game.deviceHelp.inactive.message', 'Your Spotify app became inactive after being idle.') :
                   deviceError === 'ACTIVATION_FAILED' ? $t('game.deviceHelp.activationFailed.message', 'Could not activate your Spotify device.') :
                   $t('game.deviceHelp.generic.message', 'There was a problem with playback.') }}
              </p>
              
              <div class="bg-amber-800/30 rounded-lg p-3 text-xs">
                <p class="text-amber-100 font-medium mb-2">{{ $t('game.deviceHelp.steps.title', 'Quick Fix:') }}</p>
                <ol class="text-amber-200 space-y-1 list-decimal list-inside">
                  <li>{{ $t('game.deviceHelp.steps.step1', 'Open the Spotify app on your device') }}</li>
                  <li>{{ $t('game.deviceHelp.steps.step2', 'Play any song (you can pause it right away)') }}</li>
                  <li>{{ $t('game.deviceHelp.steps.step3', 'Come back to this game and try again') }}</li>
                </ol>
              </div>
              
              <div class="flex justify-center space-x-3 mt-4">
                <button @click="retryPlayback" 
                        :disabled="isLoading"
                        class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-medium hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="isLoading" class="flex items-center">
                    <svg class="w-3 h-3 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    {{ $t('game.deviceHelp.retrying', 'Retrying...') }}
                  </span>
                  <span v-else>{{ $t('game.deviceHelp.retry', 'Try Again') }}</span>
                </button>
                <button @click="dismissDeviceHelp" class="px-4 py-2 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors">
                  {{ $t('game.deviceHelp.dismiss', 'Dismiss') }}
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="!canPlayAudio && isMobileDevice && hasSpotifyUri" class="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-400/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <div class="flex items-center justify-center mb-2">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <h3 class="text-sm font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                {{ $t('game.spotifyConnect.title', 'Spotify Connect') }}
              </h3>
            </div>
            <p class="text-green-200 text-xs">
              {{ $t('game.spotifyConnect.description', 'Music will play through your Spotify app') }}
            </p>
          </div>
          
          <div v-else-if="!canPlayFullTrack" class="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <div class="flex items-center justify-center mb-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 shadow-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
              </div>
              <h3 class="text-sm font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                {{ hasSpotifyUri ? $t('game.premiumRequired') : $t('game.demoMode') }}
              </h3>
            </div>
            <p class="text-blue-200 text-xs">
              {{ hasSpotifyUri ? $t('game.needsPremium') : $t('game.needSpotifyForAudio') }}
            </p>
          </div>
          
          <!-- Custom Player Interface -->
          <div v-if="canPlayAudio" class="music-player-controls bg-gradient-to-br from-gray-900/40 to-purple-900/40 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30 shadow-lg">
            <!-- Main Controls -->
            <div class="flex items-center justify-center space-x-4 mb-3">
              <button
                @click="togglePlayback"
                class="play-btn group relative"
                :disabled="!canPlayAudio"
              >
                <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-400/40">
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
        <div v-if="showAnswer" class="p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-400/30 rounded-xl backdrop-blur-sm">
          <div class="text-center">
            <h4 class="text-lg font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent mb-1">{{ track.name }}</h4>
            <p class="text-blue-200 text-sm font-medium mb-1">{{ artistNames }}</p>
            <p class="text-blue-300 text-sm font-medium">{{ track.album.name }} ({{ track.year }})</p>
            <p class="text-sm text-blue-400 mt-3">
              <a 
                :href="track.external_urls.spotify" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full hover:from-green-500 hover:to-green-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 text-xs"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
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
    <div v-if="!showAnswer" class="mt-3 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-400/30 rounded-xl backdrop-blur-sm">
      <div class="text-center">
        <div class="flex items-center justify-center mb-2">
          <div class="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2 animate-pulse">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="font-bold text-sm bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {{ $t('game.turn.placing') }}
          </p>
        </div>
        <p class="text-purple-200 text-xs font-medium">
          {{ isMobileDevice ? $t('game.timeline.mobileInstructions') : $t('game.dragToTimeline') }}
        </p>
      </div>
    </div>

    <!-- Result Feedback -->
    <div v-if="showResult" class="mt-3 p-4 rounded-xl text-center backdrop-blur-sm" :class="resultClass">
      <div class="flex items-center justify-center mb-2">
        <div v-if="isCorrect" class="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-2 animate-bounce">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div v-else class="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-2 animate-pulse">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <p class="font-bold text-lg">{{ resultMessage }}</p>
      </div>
      <p v-if="pointsEarned > 0" class="text-sm mt-1 font-semibold">
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
const deviceError = ref<string | null>(null)
const showDeviceHelp = ref(false)

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
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|CriOS/i.test(navigator.userAgent)
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
  return canPlayFullTrack.value
})

// Methods
async function togglePlayback() {
  isLoading.value = true
  deviceError.value = null
  showDeviceHelp.value = false

  try {
    // First, ensure playback is ready
    const playbackReady = await spotifyService.ensurePlaybackReady()
    if (!playbackReady) {
      throw new Error('NO_DEVICES_AVAILABLE')
    }

    if (canPlayFullTrack.value && props.track.uri) {
      if (isPlaying.value) {
        const success = await spotifyService.pausePlayback()
        if (success) {
          isPlaying.value = false
        }
      } else {
        const success = await spotifyService.startPlayback(props.track.uri)
        if (success) {
          isPlaying.value = true
          
          // Monitor playback state
          if (isMobileDevice.value) {
            monitorSpotifyConnectPlayback()
          } else {
            monitorSpotifyPlayback()
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Playback error:', error)
    
    // Handle different error types
    if (error.message === 'NO_DEVICES_AVAILABLE') {
      deviceError.value = 'NO_DEVICES'
      showDeviceHelp.value = true
    } else if (error.message === 'DEVICE_NOT_FOUND' || error.message === 'DEVICE_BECAME_INACTIVE') {
      deviceError.value = 'DEVICE_INACTIVE'
      showDeviceHelp.value = true
    } else if (error.message === 'PREMIUM_REQUIRED') {
      deviceError.value = 'PREMIUM_REQUIRED'
    } else if (error.message === 'DEVICE_ACTIVATION_FAILED') {
      deviceError.value = 'ACTIVATION_FAILED'
      showDeviceHelp.value = true
    } else if (error.message.includes('No active Spotify device') || error.message.includes('No Spotify devices available')) {
      deviceError.value = 'DEVICE_INACTIVE'
      showDeviceHelp.value = true
    } else {
      deviceError.value = 'PLAYBACK_FAILED'
    }
  } finally {
    isLoading.value = false
  }
}

// Add method to dismiss device help
function dismissDeviceHelp() {
  showDeviceHelp.value = false
  deviceError.value = null
}

// Add method to retry playback
async function retryPlayback() {
  showDeviceHelp.value = false
  deviceError.value = null
  await togglePlayback()
}

// Add method to monitor Spotify Connect playback
function monitorSpotifyConnectPlayback() {
  const checkPlayback = async () => {
    if (!canPlayFullTrack.value || !isMobileDevice.value) return
    
    // Keep the Spotify Connect session active
    await spotifyService.keepSpotifyConnectActive()
    
    const state = await spotifyService.getSpotifyConnectState()
    if (state) {
      const isCurrentTrack = state.item?.uri === props.track.uri
      const isActuallyPlaying = state.is_playing && isCurrentTrack
      
      // Sync component state with actual playback
      if (isPlaying.value !== isActuallyPlaying) {
        isPlaying.value = isActuallyPlaying
      }
      
      if (isPlaying.value) {
        setTimeout(checkPlayback, 5000) // Check again in 5 seconds (longer interval)
      }
    } else {
      // No active playback - device might have become inactive
      if (isPlaying.value) {
        console.log('🔇 No active playback detected - device may have become inactive')
        isPlaying.value = false
        
        // Check if we should show device help
        if (!showDeviceHelp.value && !deviceError.value) {
          const hasDevices = await spotifyService.hasAvailableDevices()
          if (hasDevices) {
            deviceError.value = 'DEVICE_INACTIVE'
            showDeviceHelp.value = true
          }
        }
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
    
    // Reset error states for new track
    deviceError.value = null
    showDeviceHelp.value = false
    
    // Wait a moment for the audio element to be ready
    await nextTick()
    
    // Reset playing state when new track is loaded
    isPlaying.value = false
    
    // Auto-start playback
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|CriOS/i.test(navigator.userAgent)
    
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
          // Check if playback is ready before attempting auto-start
          const playbackReady = await spotifyService.ensurePlaybackReady()
          if (playbackReady) {
            await togglePlayback()
            console.log('✅ Auto-playback started successfully')
          } else {
            console.log('🔇 Auto-playback skipped - no devices available')
          }
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
