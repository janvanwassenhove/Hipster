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
              'drag-over': !isMobileDevice && dragOverFirst,
              'selected': selectedPosition === 0 && isMobileDevice
            }"
            @dragover.prevent="!isMobileDevice ? (dragOverFirst = true) : null"
            @dragleave.prevent="!isMobileDevice ? (dragOverFirst = false) : null"
            @drop.prevent="!isMobileDevice ? handleDrop(0) : null"
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
              'drag-over': !isMobileDevice && dragOverPositions[0],
              'selected': selectedPosition === 0 && isMobileDevice
            }"
            @dragover.prevent="!isMobileDevice ? (dragOverPositions[0] = true) : null"
            @dragleave.prevent="!isMobileDevice ? (dragOverPositions[0] = false) : null"
            @drop.prevent="!isMobileDevice ? handleDrop(0) : null"
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
              'drag-over': !isMobileDevice && dragOverPositions[player.timeline?.length || 0],
              'selected': selectedPosition === (player.timeline?.length || 0) && isMobileDevice
            }"
            @dragover.prevent="!isMobileDevice ? (dragOverPositions[player.timeline?.length || 0] = true) : null"
            @dragleave.prevent="!isMobileDevice ? (dragOverPositions[player.timeline?.length || 0] = false) : null"
            @drop.prevent="!isMobileDevice ? handleDrop(player.timeline?.length || 0) : null"
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
    </div>

    <!-- Current Track (draggable for desktop, tap-to-place for mobile) -->
    <div
      v-if="canPlace && currentTrack"
      class="timeline-container p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-blue-400/30 rounded-2xl select-none backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      :class="isMobileDevice ? 'cursor-pointer' : 'cursor-move'"
      :draggable="!isMobileDevice"
      @dragstart="!isMobileDevice ? handleDragStart : null"
      @dragend="!isMobileDevice ? handleDragEnd : null"
      @click="isMobileDevice ? showMobilePlacementInstructions : null"
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
          <p class="text-sm text-blue-300 font-medium">{{ isMobileDevice ? $t('game.tapToPlace') : $t('game.dragToPlace') }}</p>
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

    <!-- Mobile Touch Confirmation Dialog -->
    <Teleport to="body" v-if="showConfirmation && isMobileDevice">
      <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4" style="z-index: 99999;" @click="handleDialogBackgroundClick">
        <div class="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl" style="z-index: 100000;" @click.stop>
          
          <!-- EMERGENCY DEBUG MESSAGE -->
          <div class="bg-red-600 text-white p-3 mb-4 text-center font-bold rounded cursor-pointer" @click="testEmergencyClick">
            🚨 TOUCH TO TEST: JavaScript Working!
          </div>
          
          <!-- Debug Info -->
          <div v-if="showDebugInfo" class="bg-yellow-900/50 text-yellow-200 p-3 mb-4 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Mobile: {{ isMobileDevice }}</p>
            <p>Position: {{ selectedPosition }}</p>
            <p>Show Dialog: {{ showConfirmation }}</p>
            <p>Current Track: {{ !!currentTrack }}</p>
            <p>Touch Support: {{ touchSupported }}</p>
            <p>User Agent: {{ userAgent.substring(0, 50) }}...</p>
            
            <!-- Test Buttons -->
            <div class="mt-2 flex space-x-2">
              <button @click="ultraBasicTest" class="bg-blue-600 text-white px-2 py-1 rounded">Vue Test</button>
              <button onclick="alert('Raw JS works!')" class="bg-green-600 text-white px-2 py-1 rounded">Raw Test</button>
            </div>
          </div>
          
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
            <!-- Cancel Button -->
            <button 
              @click="handleCancelButton"
              @touchstart="handleCancelTouch"
              @touchend="handleCancelTouchEnd"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl text-center font-bold transition-colors text-lg shadow-lg"
              style="min-height: 60px; touch-action: manipulation;"
            >
              ❌ Cancel
            </button>
            
            <!-- Confirm Button -->
            <button 
              @click="handleConfirmButton"
              @touchstart="handleConfirmTouch"
              @touchend="handleConfirmTouchEnd"
              class="flex-1 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl text-center font-bold transition-colors text-lg shadow-lg"
              style="min-height: 60px; touch-action: manipulation;"
            >
              ✅ Confirm
            </button>
          </div>
          
          <!-- Debug Toggle -->
          <div class="mt-4 text-center">
            <button 
              @click="toggleDebugInfo" 
              class="text-xs text-gray-400 hover:text-gray-200 underline p-2"
            >
              {{ showDebugInfo ? 'Hide Debug' : 'Show Debug' }}
            </button>
          </div>
          
          <!-- Event Log -->
          <div v-if="showDebugInfo && debugEvents.length > 0" class="mt-4 p-3 bg-black/30 rounded max-h-32 overflow-y-auto">
            <p class="font-bold mb-1 text-xs">Recent Events:</p>
            <div v-for="(event, index) in debugEvents.slice(0, 8)" :key="index" class="text-xs mb-1">
              {{ event }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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

// Reactive state - only for desktop drag and drop
const dragOverFirst = ref(false)
const dragOverPositions = ref<boolean[]>([])

// Touch-to-select state for mobile
const selectedPosition = ref<number | null>(null)
const showConfirmation = ref(false)
const buttonTouchState = ref({ isPressed: false, action: '' })

// Debug state for mobile troubleshooting
const showDebugInfo = ref(true) // Enable by default for testing
const debugEvents = ref<string[]>([])
const debugMessage = ref('')
const touchEventCounter = ref(0)

// Debug helper functions
function addDebugEvent(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  const logMessage = `[${timestamp}] ${message}`
  debugEvents.value.unshift(logMessage)
  debugMessage.value = logMessage
  console.log('MOBILE_DEBUG:', logMessage)
  
  // Keep only last 10 events
  if (debugEvents.value.length > 10) {
    debugEvents.value = debugEvents.value.slice(0, 10)
  }
}

// Enhanced debug logging
function logEvent(message: string, data?: any) {
  const timestamp = new Date().toLocaleTimeString()
  const fullMessage = `[${timestamp}] ${message}`
  
  console.log('🎵 TIMELINE_DEBUG:', fullMessage, data || '')
  addDebugEvent(fullMessage)
}

// Detect if user is on mobile/touch device
const isMobileDevice = computed(() => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

// Debug computed properties for template access
const touchSupported = computed(() => 'ontouchstart' in window)
const maxTouchPoints = computed(() => navigator.maxTouchPoints || 0)
const userAgent = computed(() => navigator.userAgent)
const windowSize = computed(() => `${window.innerWidth}x${window.innerHeight}`)

// Initialize logging
logEvent('PlayerTimeline component initialized', { 
  isMobile: isMobileDevice.value, 
  touchSupport: touchSupported.value 
})

// IMMEDIATE BASIC TEST - Run as soon as component loads
console.log('COMPONENT MOUNTED - JS DEFINITELY WORKING')
if (isMobileDevice.value) {
  console.log('MOBILE DEVICE DETECTED - Touch events should work')
}

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

// Touch-to-select methods for mobile (consolidated single version)
function handleTimelineSlotTouch(position: number) {
  logEvent(`Timeline slot touched: position ${position}`)
  
  if (!props.currentTrack || !props.canPlace) {
    logEvent(`Cannot place track`, { 
      hasCurrentTrack: !!props.currentTrack, 
      canPlace: props.canPlace 
    })
    return
  }
  
  // Select this position and show dialog
  selectedPosition.value = position
  showConfirmation.value = true
  
  logEvent(`Dialog should open`, { 
    position: selectedPosition.value, 
    showConfirmation: showConfirmation.value 
  })
  
  // Add haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
    logEvent('Haptic feedback triggered')
  }
  
  // Force a DOM update check
  setTimeout(() => {
    const dialog = document.querySelector('[style*="z-index: 99999"]')
    logEvent('Dialog element check', { 
      found: !!dialog, 
      visible: dialog ? getComputedStyle(dialog).display : 'not found' 
    })
  }, 100)
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

// Mobile placement instructions
function showMobilePlacementInstructions() {
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
}

// Button handlers with extensive logging
function handleCancelButton(event: Event) {
  logEvent('Cancel button clicked (main handler)', { 
    eventType: event.type, 
    target: (event.target as HTMLElement)?.tagName 
  })
  
  event.preventDefault()
  event.stopPropagation()
  
  performCancel()
}

function handleConfirmButton(event: Event) {
  logEvent('Confirm button clicked (main handler)', { 
    eventType: event.type, 
    target: (event.target as HTMLElement)?.tagName 
  })
  
  event.preventDefault()
  event.stopPropagation()
  
  performConfirm()
}

function handleCancelTouch(event: TouchEvent) {
  logEvent('Cancel touch start', { 
    touches: event.touches.length, 
    target: (event.target as HTMLElement)?.tagName 
  })
  
  event.preventDefault()
  
  // Visual feedback
  const target = event.target as HTMLElement
  target.style.transform = 'scale(0.95)'
  target.style.opacity = '0.8'
  
  logEvent('Cancel touch visual feedback applied')
}

function handleCancelTouchEnd(event: TouchEvent) {
  logEvent('Cancel touch end')
  
  event.preventDefault()
  
  // Reset visual feedback
  const target = event.target as HTMLElement
  target.style.transform = ''
  target.style.opacity = ''
  
  // Execute cancel
  setTimeout(() => performCancel(), 50)
}

function handleConfirmTouch(event: TouchEvent) {
  logEvent('Confirm touch start', { 
    touches: event.touches.length, 
    target: (event.target as HTMLElement)?.tagName 
  })
  
  event.preventDefault()
  
  // Visual feedback
  const target = event.target as HTMLElement
  target.style.transform = 'scale(0.95)'
  target.style.opacity = '0.8'
  
  logEvent('Confirm touch visual feedback applied')
}

function handleConfirmTouchEnd(event: TouchEvent) {
  logEvent('Confirm touch end')
  
  event.preventDefault()
  
  // Reset visual feedback
  const target = event.target as HTMLElement
  target.style.transform = ''
  target.style.opacity = ''
  
  // Execute confirm
  setTimeout(() => performConfirm(), 50)
}

// Simplified core actions
function performCancel() {
  logEvent('Performing cancel action', { 
    currentPosition: selectedPosition.value, 
    dialogShown: showConfirmation.value 
  })
  
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
  
  selectedPosition.value = null
  showConfirmation.value = false
  
  logEvent('Cancel completed', { 
    position: selectedPosition.value, 
    dialogShown: showConfirmation.value 
  })
}

function performConfirm() {
  logEvent('Performing confirm action', { 
    position: selectedPosition.value, 
    hasTrack: !!props.currentTrack, 
    trackName: props.currentTrack?.name 
  })
  
  if ('vibrate' in navigator) {
    navigator.vibrate(100)
  }
  
  if (selectedPosition.value !== null && props.currentTrack) {
    logEvent('Emitting placeTrack event', { 
      position: selectedPosition.value, 
      trackName: props.currentTrack.name 
    })
    
    emit('placeTrack', props.currentTrack, selectedPosition.value)
    
    selectedPosition.value = null
    showConfirmation.value = false
    
    logEvent('Confirm completed successfully')
  } else {
    logEvent('Confirm failed - missing data', { 
      position: selectedPosition.value, 
      hasTrack: !!props.currentTrack 
    })
  }
}

function handleDialogBackgroundClick() {
  logEvent('Dialog background clicked - ignoring to prevent accidental dismissal')
  // Don't close on background click to prevent accidents
}

// Test functions
function ultraBasicTest() {
  logEvent('Ultra basic test clicked')
  alert('Vue click handler works!')
}

function testEmergencyClick() {
  logEvent('Emergency test clicked')
  alert('Emergency click worked! JS is functional!')
}

// Enhanced toggle function
function toggleDebugInfo() {
  showDebugInfo.value = !showDebugInfo.value
  logEvent(`Debug info ${showDebugInfo.value ? 'enabled' : 'disabled'}`)
}

// Initialize drag over positions array
function initializeDragOverPositions() {
  const timeline = props.player?.timeline || []
  dragOverPositions.value = new Array(timeline.length + 1).fill(false)
}

// Clean up on component unmount
onUnmounted(() => {
  // Cleanup for desktop drag and drop only
})

// Watch for timeline changes to update drag over positions
watch(
  () => (props.player?.timeline || []).length,
  () => {
    initializeDragOverPositions()
  },
  { immediate: true }
)

// Watch for dialog state changes with logging
watch(showConfirmation, (newValue, oldValue) => {
  logEvent(`Dialog state changed: ${oldValue} → ${newValue}`, {
    position: selectedPosition.value,
    mobile: isMobileDevice.value,
    timestamp: Date.now()
  })
  
  if (newValue) {
    // Check if dialog is actually rendered
    setTimeout(() => {
      const dialogs = document.querySelectorAll('[style*="z-index: 99999"]')
      logEvent('Dialog render check', { 
        dialogCount: dialogs.length,
        bodyChildren: document.body.children.length
      })
    }, 50)
  }
})
</script>
