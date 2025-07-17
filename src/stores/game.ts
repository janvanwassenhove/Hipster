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
    targetSongs: 10,
    theme: undefined,
    maxRounds: 20,
    targetScore: 10
  })

  // Computed
  const currentPlayer = computed(() => players.value[currentPlayerIndex.value])
  const isGameFinished = computed(() => {
    // Game ends when someone reaches target songs correctly placed on timeline
    return players.value.some(player => player.timeline.length >= settings.value.targetSongs)
  })
  const winner = computed(() => {
    // Winner is determined by timeline length (songs correctly placed)
    return players.value.reduce((prev, current) => {
      if (current.timeline.length > prev.timeline.length) return current
      if (current.timeline.length === prev.timeline.length) {
        // In case of tie, use tokens as tiebreaker
        if (current.tokens > prev.tokens) return current
        if (current.tokens === prev.tokens) {
          // Final tiebreaker: score
          return current.score > prev.score ? current : prev
        }
        return prev
      }
      return prev
    })
  })

  // Actions
  function initializePlayers(playerNames: string[]) {
    players.value = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      score: 0,
      timeline: [],
      tokens: 0 // Start with 0 tokens, earn them by correct placements
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
      console.log('Getting next track for theme:', settings.value.theme)
      
      // Use spotify service to get tracks from the selected category
      const tracks = await spotifyService.getRecommendations(settings.value.theme, 50)
      console.log(`Got ${tracks?.length || 0} tracks from selected category: ${settings.value.theme || 'all categories'}`)
      
      // Add null/undefined check
      if (!tracks || tracks.length === 0) {
        console.error('No tracks available from spotify service')
        return null
      }

      // Filter out tracks already used by any player
      const usedTrackIds = new Set()
      players.value.forEach(player => {
        player.timeline.forEach(track => usedTrackIds.add(track.id))
      })
      
      const availableTracks = tracks.filter(track => !usedTrackIds.has(track.id))

      if (availableTracks.length === 0) {
        // If all tracks from current batch are used, get more tracks
        console.log('All tracks used, getting more from spotify service')
        const moreTracks = await spotifyService.getRecommendations(settings.value.theme, 100)
        
        // Add null/undefined check here too
        if (!moreTracks || moreTracks.length === 0) {
          console.error('No additional tracks available from spotify service')
          return null
        }
        
        const newAvailableTracks = moreTracks.filter(track => !usedTrackIds.has(track.id))
        
        if (newAvailableTracks.length === 0) {
          console.error('All available tracks have been used')
          return null
        }
        
        currentTrack.value = newAvailableTracks[Math.floor(Math.random() * newAvailableTracks.length)]
      } else {
        currentTrack.value = availableTracks[Math.floor(Math.random() * availableTracks.length)]
      }
      
      console.log(`Selected: "${currentTrack.value.name}" by ${currentTrack.value.artists[0].name} (${currentTrack.value.year})`)
      
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
      // Mark track as revealed (album cover can now be shown)
      track.revealed = true
      
      // Award Hitster token (main scoring mechanism in official game)
      player.tokens++
      
      // Award points for statistics/tiebreaker only
      let points = 1
      
      // Bonus points based on timeline length milestones
      if (player.timeline.length >= 5) points = 2
      if (player.timeline.length >= 8) points = 3
      
      player.score += points
      
      // Check for official Hitster bonus token rules
      checkForBonusTokens(player)
    } else {
      // Remove incorrectly placed track (official Hitster rule)
      const trackIndex = player.timeline.findIndex(t => t.id === track.id)
      if (trackIndex !== -1) {
        player.timeline.splice(trackIndex, 1)
      }
      
      // In official Hitster, no tokens are lost for wrong placement
      // The penalty is just not getting a token and losing the turn
    }

    // Official Hitster token earning rules
    checkForBonusTokens(player)

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
      targetSongs: 10,
      theme: undefined,
      maxRounds: 20,
      targetScore: 10 // Target tokens to win (official Hitster rule)
    }
    localStorage.removeItem('hitster-game-state')
  }

  function useToken(playerId: string, ability: 'skip' | 'hint' | 'challenge' | 'swap' | 'peek'): boolean {
    const player = players.value.find(p => p.id === playerId)
    if (player && player.tokens > 0) {
      player.tokens--
      saveGameState()
      
      switch (ability) {
        case 'skip':
          // Skip current track and get a new one (official Hitster rule)
          currentTrack.value = null
          break
        case 'hint':
          // Reveal decade information (official Hitster rule)
          break
        case 'challenge':
          // Challenge another player's timeline (official Hitster rule)
          break
        case 'swap':
          // Swap two cards in your timeline (official Hitster rule)
          break
        case 'peek':
          // Peek at next card before placing current one (official Hitster rule)
          break
      }
      
      return true
    }
    return false
  }

  function awardBonusToken(playerId: string, reason: string) {
    const player = players.value.find(p => p.id === playerId)
    if (player) {
      player.tokens++
      console.log(`Bonus token awarded to ${player.name} for: ${reason}`)
      saveGameState()
    }
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

  // Official Hitster token earning rules
  function checkForBonusTokens(player: Player): void {
    const timeline = player.timeline
    
    if (timeline.length < 2) return
    
    // Rule 1: Timeline length milestones (every 5 cards = bonus token)
    if (timeline.length % 5 === 0 && timeline.length > 0) {
      player.tokens++
      console.log(`Milestone bonus token awarded to ${player.name} for ${timeline.length} cards!`)
    }
    
    // Rule 2: Perfect decade spread (3+ different decades in a row)
    if (timeline.length >= 3) {
      const lastThree = timeline.slice(-3)
      const decades = lastThree.map(t => Math.floor(t.year / 10))
      const uniqueDecades = new Set(decades)
      
      if (uniqueDecades.size === 3) {
        player.tokens++
        console.log(`Decade diversity bonus token awarded to ${player.name}!`)
      }
    }
    
    // Rule 3: Consecutive years sequence (3+ consecutive years)
    if (timeline.length >= 3) {
      let consecutiveCount = 1
      for (let i = timeline.length - 1; i > 0; i--) {
        if (Math.abs(timeline[i].year - timeline[i-1].year) <= 1) {
          consecutiveCount++
        } else {
          break
        }
      }
      
      if (consecutiveCount >= 3) {
        player.tokens++
        console.log(`Consecutive years bonus token awarded to ${player.name} for ${consecutiveCount} consecutive cards!`)
      }
    }
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
    checkForBonusTokens,
    nextPlayer,
    resetGame,
    useToken,
    awardBonusToken,
    saveGameState,
    loadGameState
  }
})
