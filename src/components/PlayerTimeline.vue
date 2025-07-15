<template>
  <div class="card" :class="{ 'ring-2 ring-green-500': isCurrent }">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold flex items-center space-x-2">
        <span>{{ player.name }}</span>
        <span v-if="isCurrent" class="text-green-500">👑</span>
      </h3>
      <div class="text-right">
        <p class="text-2xl font-bold">{{ player.score }}</p>
        <p class="text-sm text-gray-600">{{ $t('game.score.tokens', { count: player.tokens }) }}</p>
      </div>
    </div>

    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ $t('game.timeline.title') }}</h4>
      
      <!-- Empty Timeline Message -->
      <div v-if="player.timeline.length === 0" class="text-center py-8 text-gray-500">
        <p>{{ $t('game.timeline.empty') }}</p>
        
        <!-- Drop Zone for First Track -->
        <div
          v-if="canPlace"
          class="timeline-slot mt-4"
          :class="{ 'drag-over': dragOverFirst }"
          @dragover.prevent="dragOverFirst = true"
          @dragleave.prevent="dragOverFirst = false"
          @drop.prevent="handleDrop(0)"
        >
          <p class="text-center text-gray-500">{{ $t('game.timeline.placeHere') }}</p>
        </div>
      </div>

      <!-- Timeline with Tracks -->
      <div v-else class="space-y-2">
        <!-- Before first track -->
        <div
          v-if="canPlace"
          class="timeline-slot h-16"
          :class="{ 'drag-over': dragOverPositions[0] }"
          @dragover.prevent="dragOverPositions[0] = true"
          @dragleave.prevent="dragOverPositions[0] = false"
          @drop.prevent="handleDrop(0)"
        >
          <p class="text-center text-gray-500 text-sm">{{ $t('game.placeEarlier') }}</p>
        </div>

        <!-- Track Cards -->
        <div
          v-for="(track, index) in player.timeline"
          :key="track.id"
          class="track-card"
        >
          <div class="flex items-center space-x-3">
            <img
              :src="getTrackImage(track)"
              :alt="track.name"
              class="w-12 h-12 rounded object-cover flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ track.name }}</p>
              <p class="text-sm text-gray-600 truncate">{{ getArtistNames(track) }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="font-bold text-lg">{{ track.year }}</p>
            </div>
          </div>

          <!-- Drop zone after this track -->
          <div
            v-if="canPlace && index < player.timeline.length - 1"
            class="timeline-slot h-16 mt-2"
            :class="{ 'drag-over': dragOverPositions[index + 1] }"
            @dragover.prevent="dragOverPositions[index + 1] = true"
            @dragleave.prevent="dragOverPositions[index + 1] = false"
            @drop.prevent="handleDrop(index + 1)"
          >
            <p class="text-center text-gray-500 text-sm">{{ $t('game.placeBetween') }}</p>
          </div>
        </div>

        <!-- After last track -->
        <div
          v-if="canPlace"
          class="timeline-slot h-16"
          :class="{ 'drag-over': dragOverPositions[player.timeline.length] }"
          @dragover.prevent="dragOverPositions[player.timeline.length] = true"
          @dragleave.prevent="dragOverPositions[player.timeline.length] = false"
          @drop.prevent="handleDrop(player.timeline.length)"
        >
          <p class="text-center text-gray-500 text-sm">{{ $t('game.placeLater') }}</p>
        </div>
      </div>
    </div>

    <!-- Current Track (draggable) -->
    <div
      v-if="canPlace && currentTrack"
      class="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-move"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      <div class="flex items-center space-x-3">
        <img
          :src="getTrackImage(currentTrack)"
          :alt="currentTrack.name"
          class="w-12 h-12 rounded object-cover flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="font-medium text-blue-800">{{ $t('game.newTrack') }}</p>
          <p class="text-sm text-blue-600">{{ $t('game.dragToPlace') }}</p>
        </div>
        <div class="text-blue-500">
          <span class="text-2xl">🎵</span>
        </div>
      </div>
    </div>

    <!-- Timeline Stats -->
    <div v-if="player.timeline.length > 0" class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex justify-between text-sm text-gray-600">
        <span>{{ $t('game.tracksInTimeline', { count: player.timeline.length }) }}</span>
        <span v-if="timelineSpan">{{ timelineSpan }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Player, Track } from '@/types'

interface Props {
  player: Player
  isCurrent: boolean
  currentTrack: Track | null
  canPlace: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  placeTrack: [track: Track, position: number]
}>()

// Reactive state
const dragOverFirst = ref(false)
const dragOverPositions = ref<boolean[]>([])

// Computed
const timelineSpan = computed(() => {
  if (props.player.timeline.length < 2) return null
  const years = props.player.timeline.map(track => track.year).sort((a, b) => a - b)
  return `${years[0]} - ${years[years.length - 1]}`
})

// Methods
function getTrackImage(track: Track): string {
  return track.images?.[0]?.url || track.album.images?.[0]?.url || '/placeholder-album.png'
}

function getArtistNames(track: Track): string {
  return track.artists.map(artist => artist.name).join(', ')
}

function handleDragStart(event: DragEvent) {
  if (!props.currentTrack) return
  
  // Store track data in drag event
  event.dataTransfer?.setData('text/plain', JSON.stringify(props.currentTrack))
  
  // Add dragging class to current track element
  const target = event.target as HTMLElement
  target.classList.add('dragging')
}

function handleDragEnd(event: DragEvent) {
  // Remove dragging class
  const target = event.target as HTMLElement
  target.classList.remove('dragging')
  
  // Reset drag over states
  dragOverFirst.value = false
  dragOverPositions.value = []
}

function handleDrop(position: number) {
  if (!props.currentTrack || !props.canPlace) return
  
  // Reset drag over states
  dragOverFirst.value = false
  dragOverPositions.value = []
  
  // Emit place track event
  emit('placeTrack', props.currentTrack, position)
}

// Initialize drag over positions array
function initializeDragOverPositions() {
  dragOverPositions.value = new Array(props.player.timeline.length + 1).fill(false)
}

// Watch for timeline changes to update drag over positions
import { watch } from 'vue'
watch(
  () => props.player.timeline.length,
  () => {
    initializeDragOverPositions()
  },
  { immediate: true }
)
</script>
