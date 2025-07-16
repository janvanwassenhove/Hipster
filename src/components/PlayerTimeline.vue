<template>
  <div class="card" :class="{ 'ring-2 ring-green-500': isCurrent }">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold flex items-center space-x-2">
        <span>{{ player.name }}</span>
        <span v-if="isCurrent" class="text-green-500">👑</span>
      </h3>
      <div class="text-right">
        <p class="text-2xl font-bold">{{ player.score }}</p>
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <span>🎵</span>
          <span>{{ $t('game.score.tokens', { count: player.tokens }) }}</span>
        </div>
      </div>
    </div>

    <!-- Token Abilities (only show for current player) -->
    <div v-if="isCurrent && canPlace && player.tokens > 0" class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ $t('game.tokenAbilities') }}</h4>
      <div class="flex space-x-2">
        <button 
          @click="useTokenAbility('skip')" 
          class="btn btn-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
          :title="$t('game.tokens.skip.description')"
        >
          ⏭️ {{ $t('game.tokens.skip.label') }}
        </button>
        <button 
          @click="useTokenAbility('hint')" 
          class="btn btn-sm bg-blue-100 hover:bg-blue-200 text-blue-800"
          :title="$t('game.tokens.hint.description')"
        >
          💡 {{ $t('game.tokens.hint.label') }}
        </button>
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
          :data-drop-zone="0"
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
          :data-drop-zone="0"
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
            <!-- Album Cover (only shown if revealed) -->
            <div class="w-12 h-12 rounded object-cover flex-shrink-0 relative">
              <img
                v-if="track.revealed"
                :src="getTrackImage(track)"
                :alt="track.name"
                class="w-12 h-12 rounded object-cover"
              />
              <div
                v-else
                class="w-12 h-12 rounded bg-gray-200 flex items-center justify-center"
              >
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
              </div>
            </div>
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
            :data-drop-zone="index + 1"
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
          :data-drop-zone="player.timeline.length"
        >
          <p class="text-center text-gray-500 text-sm">{{ $t('game.placeLater') }}</p>
        </div>
      </div>
    </div>

    <!-- Current Track (draggable) -->
    <div
      v-if="canPlace && currentTrack"
      class="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-move touch-manipulation select-none"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      :style="{ touchAction: 'none' }"
    >
      <div class="flex items-center space-x-3">
        <!-- Hidden Album Cover - show placeholder instead -->
        <div class="w-12 h-12 rounded bg-blue-200 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
        </div>
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
  useToken: [ability: string]
}>()

// Reactive state
const dragOverFirst = ref(false)
const dragOverPositions = ref<boolean[]>([])

// Touch state for mobile drag and drop
const isDragging = ref(false)
const touchStartPos = ref({ x: 0, y: 0 })
const currentTouchPos = ref({ x: 0, y: 0 })
const dragClone = ref<HTMLElement | null>(null)

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

function useTokenAbility(ability: string) {
  emit('useToken', ability)
}

// Touch event handlers for mobile drag and drop
function handleTouchStart(event: TouchEvent) {
  if (!props.currentTrack || !props.canPlace) return
  
  try {
    event.preventDefault()
    isDragging.value = true
    
    const touch = event.touches[0]
    if (!touch) return
    
    touchStartPos.value = { x: touch.clientX, y: touch.clientY }
    currentTouchPos.value = { x: touch.clientX, y: touch.clientY }
    
    // Create visual clone for dragging
    const target = event.target as HTMLElement
    const rect = target.getBoundingClientRect()
    
    dragClone.value = target.cloneNode(true) as HTMLElement
    dragClone.value.style.position = 'fixed'
    dragClone.value.style.top = `${rect.top}px`
    dragClone.value.style.left = `${rect.left}px`
    dragClone.value.style.width = `${rect.width}px`
    dragClone.value.style.height = `${rect.height}px`
    dragClone.value.style.zIndex = '9999'
    dragClone.value.style.opacity = '0.8'
    dragClone.value.style.transform = 'rotate(2deg)'
    dragClone.value.style.pointerEvents = 'none'
    dragClone.value.classList.add('dragging')
    
    document.body.appendChild(dragClone.value)
    
    // Add dragging class to original
    target.classList.add('dragging')
    
    // Add visual feedback with slight vibration effect (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  } catch (error) {
    console.warn('Touch start error:', error)
    cleanupTouchState()
  }
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value || !dragClone.value) return
  
  try {
    event.preventDefault()
    
    const touch = event.touches[0]
    if (!touch) return
    
    currentTouchPos.value = { x: touch.clientX, y: touch.clientY }
    
    // Move the clone with better offset
    const offsetX = 50
    const offsetY = 50
    dragClone.value.style.left = `${touch.clientX - offsetX}px`
    dragClone.value.style.top = `${touch.clientY - offsetY}px`
    
    // Check for drop zones
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const dropZone = elementBelow?.closest('[data-drop-zone]')
    
    // Reset all drag over states
    dragOverFirst.value = false
    dragOverPositions.value.fill(false)
    
    if (dropZone) {
      const position = parseInt(dropZone.getAttribute('data-drop-zone') || '0')
      if (position === 0) {
        dragOverFirst.value = true
      } else if (position <= dragOverPositions.value.length) {
        dragOverPositions.value[position] = true
      }
    }
  } catch (error) {
    console.warn('Touch move error:', error)
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (!isDragging.value) return
  
  try {
    event.preventDefault()
    isDragging.value = false
    
    // Find drop target
    const touch = event.changedTouches[0]
    if (!touch) {
      cleanupTouchState()
      return
    }
    
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const dropZone = elementBelow?.closest('[data-drop-zone]')
    
    // Clean up visual elements
    if (dragClone.value) {
      // Add a smooth fade-out effect before removing
      dragClone.value.style.transition = 'opacity 0.2s ease-out'
      dragClone.value.style.opacity = '0'
      
      setTimeout(() => {
        if (dragClone.value && document.body.contains(dragClone.value)) {
          document.body.removeChild(dragClone.value)
        }
        dragClone.value = null
      }, 200)
    }
    
    // Remove dragging class from original
    const draggingElement = document.querySelector('.dragging')
    if (draggingElement) {
      draggingElement.classList.remove('dragging')
    }
    
    // Reset drag over states
    dragOverFirst.value = false
    dragOverPositions.value.fill(false)
    
    // Handle drop if valid
    if (dropZone && props.currentTrack) {
      const dropPosition = parseInt(dropZone.getAttribute('data-drop-zone') || '0')
      
      // Add haptic feedback for successful drop
      if ('vibrate' in navigator) {
        navigator.vibrate(100)
      }
      
      emit('placeTrack', props.currentTrack, dropPosition)
    }
  } catch (error) {
    console.warn('Touch end error:', error)
    cleanupTouchState()
  }
}

// Initialize drag over positions array
function initializeDragOverPositions() {
  dragOverPositions.value = new Array(props.player.timeline.length + 1).fill(false)
}

// Cleanup function for touch interactions
function cleanupTouchState() {
  isDragging.value = false
  dragOverFirst.value = false
  dragOverPositions.value.fill(false)
  
  if (dragClone.value && document.body.contains(dragClone.value)) {
    document.body.removeChild(dragClone.value)
    dragClone.value = null
  }
  
  // Remove dragging class from any elements
  const draggingElements = document.querySelectorAll('.dragging')
  draggingElements.forEach(el => el.classList.remove('dragging'))
}

// Clean up on component unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  cleanupTouchState()
})

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
