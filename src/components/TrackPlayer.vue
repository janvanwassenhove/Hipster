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
        <div class="mb-6">
          <div v-if="!canPlayAudio && isMobileDevice && hasSpotifyUri" class="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-400/30 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div class="flex items-center justify-center mb-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                {{ $t('game.mobileListening') }}
              </h3>
            </div>
            <p class="text-blue-200 mb-4 font-medium">
              {{ $t('game.mobileGameMode') }}
            </p>
            <div class="bg-blue-800/30 rounded-xl p-4 border border-blue-500/30">
              <p class="text-blue-100 text-sm font-medium">
                {{ $t('game.listenCarefully') }}
              </p>
            </div>
          </div>
          
          <div v-else-if="!canPlayFullTrack" class="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-400/30 rounded-2xl p-6 text-center backdrop-blur-sm">
            <div class="flex items-center justify-center mb-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                {{ hasSpotifyUri ? $t('game.premiumRequired') : $t('game.demoMode') }}
              </h3>
            </div>
            <p class="text-blue-200 mb-3 font-medium">
              {{ hasSpotifyUri ? $t('game.needsPremium') : $t('game.noPreview') }}
            </p>
            <p class="text-sm text-blue-300 font-semibold">
              <strong>{{ hasSpotifyUri ? $t('game.premiumNeededForFullPlay') : $t('game.needSpotifyForAudio') }}</strong>
            </p>
            <p class="text-xs text-blue-400 mt-2 opacity-80">{{ $t('game.demoModeInstructions') }}</p>
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
            playsinline
            webkit-playsinline
            crossorigin="anonymous"
          >
            {{ $t('game.audioNotSupported') }}
          </audio>

          <!-- Custom Player Interface -->
          <div v-if="canPlayAudio" class="music-player-controls bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
            <!-- Main Controls -->
            <div class="flex items-center justify-center space-x-8 mb-6">
              <button
                @click="restartTrack"
                class="control-btn group relative"
                :disabled="!canPlayAudio"
                title="Restart"
              >
                <div class="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-600/50 shadow-lg group-hover:from-purple-600 group-hover:to-pink-600 group-hover:border-purple-400/50 transition-all duration-300 group-hover:scale-110">
                  <svg class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
              
              <button
                @click="togglePlayback"
                class="play-btn group relative"
                :disabled="!canPlayAudio"
              >
                <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-400/60">
                  <div v-if="isLoading" class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <svg v-else-if="isPlaying" class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>

              <button
                @click="toggleMute"
                class="control-btn group relative"
                :disabled="!canPlayAudio"
                title="Mute/Unmute"
              >
                <div class="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-600/50 shadow-lg group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:border-cyan-400/50 transition-all duration-300 group-hover:scale-110">
                  <svg v-if="isMuted || volume === 0" class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.83 13.6H2a1 1 0 01-1-1V7.4a1 1 0 011-1h2.83l3.553-3.193a1 1 0 011.617.793zM16 8.4A1 1 0 1117.6 7a4 4 0 010 6 1 1 0 11-1.6-1.2 2 2 0 000-3.6z" clip-rule="evenodd" />
                    <path d="M18.293 6.293a1 1 0 011.414 1.414L17.414 10l2.293 2.293a1 1 0 01-1.414 1.414L16 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L14.586 10l-2.293-2.293a1 1 0 011.414-1.414L16 8.586l2.293-2.293z"/>
                  </svg>
                  <svg v-else-if="volume < 0.5" class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.83 13.6H2a1 1 0 01-1-1V7.4a1 1 0 011-1h2.83l3.553-3.193a1 1 0 011.617.793zM15 8.4A1 1 0 1116.6 7a2 2 0 010 6 1 1 0 11-1.6-1.2V8.4z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.83 13.6H2a1 1 0 01-1-1V7.4a1 1 0 011-1h2.83l3.553-3.193a1 1 0 011.617.793zM15 8.4A1 1 0 1116.6 7a4 4 0 010 6 1 1 0 11-1.6-1.2 2 2 0 000-3.6z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>

            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex items-center space-x-4 text-sm text-gray-300">
                <span class="w-12 text-right font-mono">{{ formatTime(currentTime) }}</span>
                <div class="flex-1 relative">
                  <div 
                    class="progress-track relative h-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full cursor-pointer group overflow-hidden" 
                    @click="seekTo($event)" 
                    @touchstart="startProgressDrag($event)"
                    @touchmove="updateProgressDrag($event)"
                    @touchend="endProgressDrag($event)"
                  >
                    <!-- Background glow -->
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div 
                      class="progress-fill absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg transition-all duration-150 ease-out" 
                      :style="{ width: progressPercent + '%' }"
                    ></div>
                    <div 
                      class="progress-handle absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                      :style="{ left: progressPercent + '%' }"
                    ></div>
                  </div>
                </div>
                <span class="w-12 font-mono">{{ formatTime(duration) }}</span>
              </div>
            </div>

            <!-- Volume Control -->
            <div class="flex items-center space-x-4">
              <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.83 13.6H2a1 1 0 01-1-1V7.4a1 1 0 011-1h2.83l3.553-3.193a1 1 0 011.617.793z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1 relative group">
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
                  class="volume-slider w-full h-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full appearance-none cursor-pointer slider-thumb"
                  :disabled="!track.preview_url"
                />
              </div>
              <span class="text-sm text-gray-400 w-10 font-mono">{{ Math.round(volume * 100) }}%</span>
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
  // Spotify Web Playback SDK has limited mobile support
  return hasSpotifyUri.value && spotifyService.isPlayerReady() && !isMobileDevice.value
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
  
  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (canPlayFullTrack.value && !isMobile) {
    // Debug: Check available devices
    await spotifyService.getAvailableDevices()
    
    // Use Spotify Web Playback SDK for full tracks (desktop only)
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
          try {
            await audioPlayer.value.play()
          } catch (error) {
            console.error('Error playing preview fallback:', error)
          }
        }
      }
    }
  } else if (canPlayPreview.value && audioPlayer.value) {
    // Use HTML5 audio for previews (works on all devices)
    if (isPlaying.value) {
      audioPlayer.value.pause()
    } else {
      try {
        // For mobile devices, ensure user interaction before playing
        await audioPlayer.value.play()
      } catch (error) {
        console.error('Error playing audio:', error)
        
        // Handle common mobile autoplay errors
        if (error instanceof Error && error.name === 'NotAllowedError') {
          console.warn('Autoplay blocked - user interaction required')
          // Show a user-friendly message or prompt for interaction
        }
      }
    }
  } else {
    // On mobile without audio capabilities, show visual-only mode message
    console.log('Mobile device without audio playback - visual mode only')
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

// Watch for track changes to auto-start playback
watch(() => props.track, async (newTrack, oldTrack) => {
  if (newTrack && newTrack !== oldTrack) {
    console.log('New track detected:', newTrack.name)
    
    // Wait a moment for the audio element to be ready
    await nextTick()
    
    // Don't auto-start on mobile devices due to autoplay policies
    // User must explicitly click play button
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (!isMobile) {
      // Small delay to ensure everything is properly initialized on desktop
      setTimeout(async () => {
        if (canPlayAudio.value && !isPlaying.value) {
          await togglePlayback()
        }
      }, 100)
    } else {
      console.log('Mobile device detected - autoplay disabled due to browser policies')
    }
  }
}, { immediate: false })

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
  
  // Improve mobile touch responsiveness
  if (isMobileDevice.value) {
    audioPlayer.value.addEventListener('touchstart', (e) => {
      // Prevent default to avoid unwanted behaviors on mobile
      e.preventDefault()
    }, { passive: false })
  }
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
