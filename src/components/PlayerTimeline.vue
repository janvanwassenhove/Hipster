<template>
  <div class="card relative overflow-hidden" :class="{ 'ring-2 ring-cyan-400 shadow-2xl shadow-cyan-400/20': isCurrent }">
    <!-- Animated background for current player -->
    <div v-if="isCurrent" class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
    
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold flex items-center space-x-3">
          <span :class="isCurrent ? 'bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent' : 'text-gray-200'">{{ player.name }}</span>
          <span v-if="isCurrent" class="text-2xl animate-bounce">👑</span>
        </h3>
        <div class="text-right">
          <p class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{{ player.score }}</p>
          <div class="flex items-center space-x-2 text-sm text-gray-300">
            <span class="text-lg">🎵</span>
            <span class="font-medium">{{ $t('game.score.tokens', { count: player.tokens }) }}</span>
          </div>
        </div>
      </div>

      <!-- Token Abilities (only show for current player) -->
      <div v-if="isCurrent && canPlace && player.tokens > 0" class="mb-6">
        <h4 class="text-sm font-medium text-gray-300 mb-3">{{ $t('game.tokenAbilities') }}</h4>
        <div class="flex space-x-3">
          <button 
            @click="useTokenAbility('skip')" 
            class="group relative px-4 py-2 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-orange-500/25"
            :title="$t('game.tokens.skip.description')"
          >
            <div class="flex items-center space-x-2">
              <span class="text-lg">⏭️</span>
              <span>{{ $t('game.tokens.skip.label') }}</span>
            </div>
          </button>
          <button 
            @click="useTokenAbility('hint')" 
            class="group relative px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
            :title="$t('game.tokens.hint.description')"
          >
            <div class="flex items-center space-x-2">
              <span class="text-lg">💡</span>
              <span>{{ $t('game.tokens.hint.label') }}</span>
            </div>
          </button>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-200 mb-4 flex items-center">
          <span class="mr-2">🎵</span>
          {{ $t('game.timeline.title') }}
        </h4>
      
        <!-- Empty Timeline Message -->
        <div v-if="(!player.timeline || player.timeline.length === 0)" class="text-center py-12 text-gray-400">
          <div class="mb-4">
            <div class="w-20 h-20 mx-auto bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-3xl">🎼</span>
            </div>
          </div>
          <p class="text-lg font-medium mb-2">{{ $t('game.timeline.empty') }}</p>
          
          <!-- Drop Zone for First Track -->
          <div
            v-if="canPlace"
            class="timeline-slot mt-6 group"
            :class="{ 
              'drag-over': dragOverFirst,
              'selected': selectedPosition === 0 && isMobileDevice
            }"
            @dragover.prevent="dragOverFirst = true"
            @dragleave.prevent="dragOverFirst = false"
            @drop.prevent="handleDrop(0)"
            @touchstart.prevent="isMobileDevice ? handleTimelineSlotTouch(0) : null"
            @click="isMobileDevice ? handleTimelineSlotTouch(0) : null"
            :data-drop-zone="0"
          >
            <div 
              class="p-8 border-2 border-dashed border-gray-500 rounded-2xl group-hover:border-purple-400 transition-colors duration-300 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm"
              :class="{ 
                'border-green-400 bg-green-500/20': selectedPosition === 0 && isMobileDevice 
              }"
            >
              <p class="text-center text-gray-300 font-medium">
                {{ isMobileDevice ? $t('game.timeline.tapToSelect') : $t('game.timeline.placeHere') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Timeline with Tracks -->
        <div v-else-if="player.timeline && player.timeline.length > 0" class="space-y-3">
          <!-- Before first track -->
          <div
            v-if="canPlace"
            class="timeline-slot h-20 group"
            :class="{ 
              'drag-over': dragOverPositions[0],
              'selected': selectedPosition === 0 && isMobileDevice
            }"
            @dragover.prevent="dragOverPositions[0] = true"
            @dragleave.prevent="dragOverPositions[0] = false"
            @drop.prevent="handleDrop(0)"
            @touchstart.prevent="isMobileDevice ? handleTimelineSlotTouch(0) : null"
            @click="isMobileDevice ? handleTimelineSlotTouch(0) : null"
            :data-drop-zone="0"
          >
            <div 
              class="h-full border-2 border-dashed border-gray-600 rounded-xl group-hover:border-cyan-400 transition-colors duration-300 bg-gradient-to-r from-gray-800/20 to-gray-700/20 backdrop-blur-sm flex items-center justify-center"
              :class="{ 
                'border-green-400 bg-green-500/20': selectedPosition === 0 && isMobileDevice 
              }"
            >
              <p class="text-center text-gray-400 text-sm font-medium">
                {{ isMobileDevice ? $t('game.timeline.tapToSelect') : $t('game.placeEarlier') }}
              </p>
            </div>
          </div>

          <!-- Track Cards -->
          <div
            v-for="(track, index) in (player.timeline || [])"
            :key="track.id"
            class="track-card group relative"
          >
            <div class="p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-600/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-center space-x-4">
                <!-- Album Cover (only shown if revealed) -->
                <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                  <img
                    v-if="track.revealed"
                    :src="getTrackImage(track)"
                    :alt="track.name"
                    class="w-16 h-16 object-cover"
                  />
                  <div
                    v-else
                    class="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center"
                  >
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-lg text-gray-100 truncate">{{ track.name }}</p>
                  <p class="text-sm text-gray-300 truncate font-medium">{{ getArtistNames(track) }}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="font-bold text-2xl bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{{ track.year }}</p>
                </div>
              </div>
            </div>

            <!-- Drop zone after this track -->
            <div
              v-if="canPlace && index < (player.timeline?.length || 0) - 1"
              class="timeline-slot h-20 mt-3 group"
              :class="{ 
                'drag-over': dragOverPositions[index + 1],
                'selected': selectedPosition === index + 1 && isMobileDevice
              }"
              @dragover.prevent="dragOverPositions[index + 1] = true"
              @dragleave.prevent="dragOverPositions[index + 1] = false"
              @drop.prevent="handleDrop(index + 1)"
              @touchstart.prevent="isMobileDevice ? handleTimelineSlotTouch(index + 1) : null"
              @click="isMobileDevice ? handleTimelineSlotTouch(index + 1) : null"
              :data-drop-zone="index + 1"
            >
              <div 
                class="h-full border-2 border-dashed border-gray-600 rounded-xl group-hover:border-purple-400 transition-colors duration-300 bg-gradient-to-r from-gray-800/20 to-gray-700/20 backdrop-blur-sm flex items-center justify-center"
                :class="{ 
                  'border-green-400 bg-green-500/20': selectedPosition === index + 1 && isMobileDevice 
                }"
              >
                <p class="text-center text-gray-400 text-sm font-medium">
                  {{ isMobileDevice ? $t('game.timeline.tapToSelect') : $t('game.placeBetween') }}
                </p>
              </div>
            </div>
          </div>

        <!-- After last track -->
        <div
          v-if="canPlace"
          class="timeline-slot h-20 group"
          :class="{ 
            'drag-over': dragOverPositions[player.timeline?.length || 0],
            'selected': selectedPosition === (player.timeline?.length || 0) && isMobileDevice
          }"
          @dragover.prevent="dragOverPositions[player.timeline?.length || 0] = true"
          @dragleave.prevent="dragOverPositions[player.timeline?.length || 0] = false"
          @drop.prevent="handleDrop(player.timeline?.length || 0)"
          @touchstart.prevent="isMobileDevice ? handleTimelineSlotTouch(player.timeline?.length || 0) : null"
          @click="isMobileDevice ? handleTimelineSlotTouch(player.timeline?.length || 0) : null"
          :data-drop-zone="player.timeline?.length || 0"
        >
          <div 
            class="h-full border-2 border-dashed border-gray-600 rounded-xl group-hover:border-cyan-400 transition-colors duration-300 bg-gradient-to-r from-gray-800/20 to-gray-700/20 backdrop-blur-sm flex items-center justify-center"
            :class="{ 
              'border-green-400 bg-green-500/20': selectedPosition === (player.timeline?.length || 0) && isMobileDevice 
            }"
          >
            <p class="text-center text-gray-400 text-sm font-medium">
              {{ isMobileDevice ? $t('game.timeline.tapToSelect') : $t('game.placeLater') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Track (draggable) -->
    <div
      v-if="canPlace && currentTrack"
      ref="scrollContainer"
      class="timeline-container p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-400/30 rounded-2xl cursor-move touch-manipulation select-none backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      :style="{ touchAction: 'none' }"
    >
      <div class="flex items-center space-x-4">
        <!-- Hidden Album Cover - show placeholder instead -->
        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-lg text-blue-200">{{ $t('game.newTrack') }}</p>
          <p class="text-sm text-blue-300 font-medium">{{ $t('game.dragToPlace') }}</p>
        </div>
        <div class="text-blue-300">
          <span class="text-3xl animate-pulse">🎵</span>
        </div>
      </div>
    </div>

    <!-- Timeline Stats -->
    <div v-if="player.timeline && player.timeline.length > 0" class="mt-6 pt-6 border-t border-gray-600/30">
      <div class="flex justify-between text-sm text-gray-300">
        <span class="font-medium">{{ $t('game.tracksInTimeline', { count: player.timeline.length }) }}</span>
        <span v-if="timelineSpan" class="font-mono">{{ timelineSpan }}</span>
      </div>
    </div>
    </div>

    <!-- Mobile Touch Confirmation Dialog -->
    <div v-if="showConfirmation && isMobileDevice" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="handleDialogBackgroundClick">
      <div class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/20 shadow-2xl shadow-purple-500/10 rounded-2xl p-6 max-w-sm w-full mx-auto relative overflow-hidden" @click.stop>
        <!-- Animated background patterns -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div class="relative z-10">
          <!-- Header -->
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-xl">📍</span>
            </div>
            <h3 class="text-xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
              {{ $t('game.timeline.selectedPosition') }}
            </h3>
          </div>
          
          <!-- Position description -->
          <div class="mb-6">
            <p class="text-gray-200 text-lg leading-relaxed">
              {{ getPositionDescription(selectedPosition) }}
            </p>
          </div>
          
          <!-- Action buttons -->
          <div class="flex space-x-3">
            <button 
              @click="handleCancelClick"
              @touchstart="handleCancelTouchStart"
              @touchend="handleCancelTouchEnd"
              @touchcancel="handleTouchCancel"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 active:from-gray-500 active:to-gray-600 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg select-none"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none;"
            >
              {{ $t('game.timeline.cancelSelection') }}
            </button>
            <button 
              @click="handleConfirmClick"
              @touchstart="handleConfirmTouchStart"
              @touchend="handleConfirmTouchEnd"
              @touchcancel="handleTouchCancel"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 active:from-green-500 active:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/25 select-none"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none;"
            >
              {{ $t('game.timeline.confirmPlacement') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
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

// Touch-to-select state for mobile
const selectedPosition = ref<number | null>(null)
const showConfirmation = ref(false)

// Touch state for mobile drag and drop
const isDragging = ref(false)
const touchStartPos = ref({ x: 0, y: 0 })
const currentTouchPos = ref({ x: 0, y: 0 })
const dragClone = ref<HTMLElement | null>(null)
const dragPosition = ref({ x: 0, y: 0 })
const scrollContainer = ref<HTMLElement | null>(null)
let autoScrollInterval: number | null = null

// Detect if user is on mobile/touch device
const isMobileDevice = computed(() => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

// Computed
const timelineSpan = computed(() => {
  const timeline = props.player?.timeline || []
  if (timeline.length < 2) return null
  const years = timeline.map(track => track.year).sort((a, b) => a - b)
  return `${years[0]} - ${years[years.length - 1]}`
})

// Methods
function getTrackImage(track: Track): string {
  // Check for direct track images first
  if (track.images && track.images.length > 0 && track.images[0]?.url) {
    return track.images[0].url
  }
  
  // Check for album images
  if (track.album && track.album.images && track.album.images.length > 0 && track.album.images[0]?.url) {
    return track.album.images[0].url
  }
  
  // Fallback to placeholder
  return '/placeholder-album.png'
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

// Touch-to-select methods for mobile
function handleTimelineSlotTouch(position: number) {
  if (!props.currentTrack || !props.canPlace) return
  
  // Select this position
  selectedPosition.value = position
  showConfirmation.value = true
  
  // Add haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
}

function getPositionDescription(position: number | null): string {
  if (position === null) return ''
  
  const timeline = props.player?.timeline || []
  const timelineLength = timeline.length
  
  if (position === 0) {
    if (timelineLength === 0) {
      return 'Place as your first track'
    } else {
      return `Place before ${timeline[0].name} (${timeline[0].year})`
    }
  } else if (position === timelineLength) {
    return `Place after ${timeline[timelineLength - 1].name} (${timeline[timelineLength - 1].year})`
  } else {
    return `Place between ${timeline[position - 1].name} (${timeline[position - 1].year}) and ${timeline[position].name} (${timeline[position].year})`
  }
}

function confirmPlacement() {
  if (selectedPosition.value !== null && props.currentTrack) {
    emit('placeTrack', props.currentTrack, selectedPosition.value)
    selectedPosition.value = null
    showConfirmation.value = false
  }
}

function cancelSelection() {
  selectedPosition.value = null
  showConfirmation.value = false
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
  if (!isDragging.value) return
  
  event.preventDefault()
  const touch = event.touches[0]
  
  // Start auto-scroll based on touch position
  startAutoScroll(touch.clientY)
  
  // Update drag position
  dragPosition.value = {
    x: touch.clientX,
    y: touch.clientY
  }
  
  // Move the clone with better offset
  const offsetX = 50
  const offsetY = 50
  if (dragClone.value) {
    dragClone.value.style.left = `${touch.clientX - offsetX}px`
    dragClone.value.style.top = `${touch.clientY - offsetY}px`
  }
  
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
}

function handleTouchEnd(event: TouchEvent) {
  // Stop auto-scroll
  stopAutoScroll()
  
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

// Mouse handlers for desktop
function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return
  
  // Start auto-scroll for mouse drag too
  startAutoScroll(event.clientY)
  
  // Update drag position
  dragPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
}

function handleMouseUp() {
  stopAutoScroll()
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
}

// Auto-scroll functionality
function startAutoScroll(clientY: number) {
  if (autoScrollInterval) return
  
  autoScrollInterval = setInterval(() => {
    const viewportHeight = window.innerHeight
    const scrollThreshold = 100 // pixels from edge to trigger scroll
    const scrollSpeed = 5 // pixels per interval
    
    if (clientY < scrollThreshold) {
      // Scroll up
      window.scrollBy(0, -scrollSpeed)
    } else if (clientY > viewportHeight - scrollThreshold) {
      // Scroll down
      window.scrollBy(0, scrollSpeed)
    }
  }, 16) // ~60fps
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

// Initialize drag over positions array
function initializeDragOverPositions() {
  const timeline = props.player?.timeline || []
  dragOverPositions.value = new Array(timeline.length + 1).fill(false)
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
onUnmounted(() => {
  stopAutoScroll()
  cleanupTouchState()
})

// Watch for timeline changes to update drag over positions
watch(
  () => (props.player?.timeline || []).length,
  () => {
    initializeDragOverPositions()
  },
  { immediate: true }
)

// Button event handlers for mobile confirmation dialog
function handleCancelClick() {
  cancelSelection()
}

function handleConfirmClick() {
  confirmPlacement()
}

function handleCancelTouchStart(event: TouchEvent) {
  event.stopPropagation()
  // Add visual feedback
  const target = event.target as HTMLElement
  target.style.transform = 'scale(0.95)'
}

function handleCancelTouchEnd(event: TouchEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  // Reset visual feedback
  const target = event.target as HTMLElement
  target.style.transform = ''
  
  // Add haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
  
  cancelSelection()
}

function handleConfirmTouchStart(event: TouchEvent) {
  event.stopPropagation()
  // Add visual feedback
  const target = event.target as HTMLElement
  target.style.transform = 'scale(0.95)'
}

function handleConfirmTouchEnd(event: TouchEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  // Reset visual feedback
  const target = event.target as HTMLElement
  target.style.transform = ''
  
  // Add haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
  
  confirmPlacement()
}

function handleDialogBackgroundClick() {
  // Optional: close dialog when clicking background
  // For better UX, we might want to keep this disabled to prevent accidental dismissal
  // cancelSelection()
}

function handleTouchCancel(event: TouchEvent) {
  // Reset visual feedback when touch is cancelled
  const target = event.target as HTMLElement
  target.style.transform = ''
}
</script>
