<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600">
    <RouterView />
    
    <!-- Global Loading Spinner -->
    <Teleport to="body">
      <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <span class="text-gray-700">{{ $t('common.loading') }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { spotifyService } from '@/services/spotify'
import { useGameStore } from '@/stores/game'

const isLoading = ref(false)
const gameStore = useGameStore()

onMounted(async () => {
  // Check for Spotify OAuth callback
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('code')) {
    isLoading.value = true
    try {
      await spotifyService.handleCallback()
    } catch (error) {
      console.error('OAuth callback error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Load saved game state
  gameStore.loadGameState()
})
</script>
