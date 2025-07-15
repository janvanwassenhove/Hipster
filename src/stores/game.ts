import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Player, Track, GameSettings, GameState, Theme } from '@/types'
import { spotifyService } from '@/services/spotify'

export const useGameStore = defineStore('game', () => {
  // State
  const players = ref<Player[]>([])
  const currentPlayerIndex = ref(0)
  const currentTrack = ref<Track | null>(null)
  const isPlaying = ref(false)
  const gamePhase = ref<GameState['gamePhase']>('setup')
  const round = ref(1)
  const settings = ref<GameSettings>({
    difficulty: 'original',
    theme: undefined,
    maxRounds: 20,
    targetScore: 10
  })

  // Computed
  const currentPlayer = computed(() => players.value[currentPlayerIndex.value])
  const isGameFinished = computed(() => {
    return players.value.some(player => player.timeline.length >= settings.value.targetScore) ||
           round.value > settings.value.maxRounds
  })
  const winner = computed(() => {
    return players.value.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    )
  })

  // Actions
  function initializePlayers(playerNames: string[]) {
    players.value = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      score: 0,
      timeline: [],
      tokens: 3
    }))
    currentPlayerIndex.value = 0
    round.value = 1
    gamePhase.value = 'playing'
    saveGameState()
  }

  function updateSettings(newSettings: Partial<GameSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    saveGameState()
  }

  async function getNextTrack(): Promise<Track | null> {
    try {
      const tracks = await spotifyService.getRecommendations(settings.value.theme, 50)
      
      if (tracks.length === 0) {
        return null
      }

      // Filter out tracks already used by any player
      const usedTrackIds = new Set()
      players.value.forEach(player => {
        player.timeline.forEach(track => usedTrackIds.add(track.id))
      })
      
      const availableTracks = tracks.filter(track => !usedTrackIds.has(track.id))
      
      if (availableTracks.length === 0) {
        // If all tracks are used, get more recommendations
        const moreTracks = await spotifyService.getRecommendations(settings.value.theme, 100)
        const newAvailableTracks = moreTracks.filter(track => !usedTrackIds.has(track.id))
        
        if (newAvailableTracks.length === 0) {
          return null
        }
        
        currentTrack.value = newAvailableTracks[Math.floor(Math.random() * newAvailableTracks.length)]
      } else {
        currentTrack.value = availableTracks[Math.floor(Math.random() * availableTracks.length)]
      }
      
      return currentTrack.value
    } catch (error) {
      console.error('Error getting next track:', error)
      return null
    }
  }

  function placeTrackOnTimeline(track: Track, position: number): boolean {
    const player = currentPlayer.value
    if (!player) return false

    // Insert track at the specified position
    player.timeline.splice(position, 0, track)
    
    // Check if placement is correct (timeline should be sorted by year)
    const isCorrect = isTimelineCorrect(player.timeline)
    
    if (isCorrect) {
      // Award points based on difficulty
      let points = 1
      if (settings.value.difficulty === 'pro') points = 2
      else if (settings.value.difficulty === 'expert') points = 3
      
      player.score += points
    } else {
      // Remove incorrectly placed track
      const trackIndex = player.timeline.findIndex(t => t.id === track.id)
      if (trackIndex !== -1) {
        player.timeline.splice(trackIndex, 1)
      }
    }

    saveGameState()
    return isCorrect
  }

  function isTimelineCorrect(timeline: Track[]): boolean {
    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].year < timeline[i - 1].year) {
        return false
      }
    }
    return true
  }

  function nextPlayer() {
    currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
    currentTrack.value = null
    
    // Check if round is complete (all players had a turn)
    if (currentPlayerIndex.value === 0) {
      round.value++
    }

    // Check if game should end
    if (isGameFinished.value) {
      gamePhase.value = 'finished'
    }
    
    saveGameState()
  }

  function resetGame() {
    players.value = []
    currentPlayerIndex.value = 0
    currentTrack.value = null
    isPlaying.value = false
    gamePhase.value = 'setup'
    round.value = 1
    settings.value = {
      difficulty: 'original',
      theme: undefined,
      maxRounds: 20,
      targetScore: 10
    }
    localStorage.removeItem('hitster-game-state')
  }

  function useToken(playerId: string) {
    const player = players.value.find(p => p.id === playerId)
    if (player && player.tokens > 0) {
      player.tokens--
      saveGameState()
      return true
    }
    return false
  }

  function saveGameState() {
    const gameState = {
      players: players.value,
      currentPlayerIndex: currentPlayerIndex.value,
      gamePhase: gamePhase.value,
      round: round.value,
      settings: settings.value
    }
    localStorage.setItem('hitster-game-state', JSON.stringify(gameState))
  }

  function loadGameState(): boolean {
    try {
      const saved = localStorage.getItem('hitster-game-state')
      if (saved) {
        const gameState = JSON.parse(saved)
        players.value = gameState.players || []
        currentPlayerIndex.value = gameState.currentPlayerIndex || 0
        gamePhase.value = gameState.gamePhase || 'setup'
        round.value = gameState.round || 1
        settings.value = { ...settings.value, ...gameState.settings }
        return true
      }
    } catch (error) {
      console.error('Error loading game state:', error)
    }
    return false
  }

  return {
    // State
    players,
    currentPlayerIndex,
    currentTrack,
    isPlaying,
    gamePhase,
    round,
    settings,
    
    // Computed
    currentPlayer,
    isGameFinished,
    winner,
    
    // Actions
    initializePlayers,
    updateSettings,
    getNextTrack,
    placeTrackOnTimeline,
    nextPlayer,
    resetGame,
    useToken,
    saveGameState,
    loadGameState
  }
})
