<template>
  <div class="card">
    <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
      
      <!-- Album Cover -->
      <div class="flex-shrink-0">
        <img
          :src="trackImage"
          :alt="track.name"
          class="w-32 h-32 rounded-lg shadow-lg object-cover"
        />
      </div>

      <!-- Track Info and Controls -->
      <div class="flex-1 text-center md:text-left">
        
        <!-- Track Info (based on difficulty) -->
        <div v-if="difficulty === 'original'" class="mb-4">
          <p class="text-gray-600">{{ $t('game.turn.listening') }}</p>
          <p class="text-sm text-gray-500">{{ $t('game.difficulties.originalHint') }}</p>
        </div>
        
        <div v-else-if="difficulty === 'pro'" class="mb-4">
          <h3 class="text-xl font-bold text-gray-800">{{ track.name }}</h3>
          <p class="text-lg text-gray-600">{{ artistNames }}</p>
          <p class="text-sm text-gray-500">{{ $t('game.difficulties.proHint') }}</p>
        </div>
        
        <div v-else-if="difficulty === 'expert'" class="mb-4">
          <h3 class="text-xl font-bold text-gray-800">{{ track.name }}</h3>
          <p class="text-lg text-gray-600">{{ artistNames }}</p>
          <p class="text-gray-600">{{ track.album.name }}</p>
          <p class="text-sm text-gray-500">{{ $t('game.difficulties.expertHint') }}</p>
        </div>

        <!-- Audio Player -->
        <div class="mb-4">
          <div v-if="!track.preview_url" class="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
            <p class="text-gray-600">🎵 {{ $t('game.demoMode') }}</p>
            <p class="text-sm text-gray-500">{{ $t('game.noPreview') }}</p>
          </div>
          <audio
            v-else
            ref="audioPlayer"
            :src="track.preview_url"
            controls
            class="w-full"
            @ended="onAudioEnded"
          >
            {{ $t('game.audioNotSupported') }}
          </audio>
        </div>

        <!-- Play/Pause Controls -->
        <div class="flex items-center justify-center md:justify-start space-x-4 mb-4">
          <button
            @click="togglePlayback"
            class="btn btn-primary"
            :disabled="!track.preview_url"
          >
            <span v-if="isPlaying">⏸️ {{ $t('game.pause') }}</span>
            <span v-else>▶️ {{ $t('game.play') }}</span>
          </button>
          
          <button
            @click="restartTrack"
            class="btn btn-secondary"
            :disabled="!track.preview_url"
          >
            🔄 {{ $t('game.restart') }}
          </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Track } from '@/types'

interface Props {
  track: Track
  difficulty: 'original' | 'pro' | 'expert'
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

// Methods
function togglePlayback() {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
}

function restartTrack() {
  if (!audioPlayer.value) return
  
  audioPlayer.value.currentTime = 0
  if (isPlaying.value) {
    audioPlayer.value.play()
  }
}

function onAudioEnded() {
  isPlaying.value = false
}

// Lifecycle
onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener('play', () => {
      isPlaying.value = true
    })
    
    audioPlayer.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
  }
})

onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})
</script>
