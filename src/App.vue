<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>
    
    <div class="relative z-10">
      <RouterView />
    </div>
    
    <!-- Global Loading Spinner -->
    <Teleport to="body">
      <div v-if="isLoading" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-2xl p-8 flex items-center space-x-4 shadow-2xl">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
          <span class="text-white font-medium text-lg">{{ $t('common.loading') }}</span>
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
  if (urlParams.has('code') && !sessionStorage.getItem('oauth_callback_processed')) {
    sessionStorage.setItem('oauth_callback_processed', 'true')
    isLoading.value = true
    try {
      await spotifyService.handleCallback()
    } catch (error) {
      console.error('OAuth callback error:', error)
    } finally {
      isLoading.value = false
      sessionStorage.removeItem('oauth_callback_processed')
    }
  }

  // Load saved game state
  gameStore.loadGameState()
})
</script>
