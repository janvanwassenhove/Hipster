export default {
  common: {
    next: 'Next',
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    start: 'Start',
    finish: 'Finish',
    continue: 'Continue',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry'
  },
  game: {
    title: 'Hitster',
    subtitle: 'Music Timeline Game',
    newGame: 'New Game',
    continue: 'Continue Game',
    players: 'Players',
    round: 'Round',
    playerCount: 'Number of players (2-4)',
    playerNames: 'Player Names',
    playerName: 'Player {number} name',
    allMusic: 'All Music',
    difficulty: 'Difficulty',
    difficulties: {
      original: 'Original (Timeline)',
      pro: 'Pro (Title + Artist)',
      expert: 'Expert (Exact Year)',
      originalHint: 'Place this track on your timeline',
      proHint: 'You know the title and artist, when was it released?',
      expertHint: 'You have all the info, what year exactly?'
    },
    theme: 'Theme (Optional)',
    themes: {
      '90s': '90s Hits',
      'guilty-pleasures': 'Guilty Pleasures',
      'schlager': 'Schlager',
      'tiktok': 'TikTok Hits',
      'rock': 'Rock',
      'pop': 'Pop',
      'hip-hop': 'Hip-Hop',
      'electronic': 'Electronic',
      'indie': 'Indie',
      'country': 'Country'
    },
    setupRequired: 'Game Setup Required',
    setupMessage: 'Please go back to set up a new game',
    backToSetup: 'Back to Setup',
    backToHome: 'Back to Home',
    getTrack: 'Get Next Track',
    points: 'points',
    audioNotSupported: 'Audio not supported',
    demoMode: 'Demo Mode',
    noPreview: 'No audio preview available for this track',
    needSpotifyForAudio: 'Connect to Spotify to hear music previews!',
    demoModeInstructions: 'In demo mode, you can still play the game by guessing based on track information.',
    demoModeActive: 'Playing in demo mode - no audio previews available.',
    play: 'Play',
    pause: 'Pause',
    restart: 'Restart',
    mute: 'Mute',
    unmute: 'Unmute',
    volume: 'Volume',
    openInSpotify: 'Open in Spotify',
    dragToTimeline: 'Drag the card to your timeline',
    newTrack: 'New Track',
    dragToPlace: 'Drag to place on timeline',
    placeEarlier: 'Place before this track',
    placeBetween: 'Place between tracks',
    placeLater: 'Place after this track',
    tracksInTimeline: '{count} tracks in timeline',
    tokenAbilities: 'Token Abilities',
    tokens: {
      skip: {
        label: 'Skip',
        description: 'Skip this track and get a new one'
      },
      hint: {
        label: 'Hint',
        description: 'Get a hint about the decade'
      },
      challenge: {
        label: 'Challenge',
        description: 'Challenge another player\'s placement'
      },
      swap: {
        label: 'Swap',
        description: 'Swap two cards in your timeline'
      },
      peek: {
        label: 'Peek',
        description: 'Peek at the next track before placing'
      }
    },
    spotify: {
      login: 'Login with Spotify',
      required: 'Spotify login required to play',
      loginRequired: 'We need access to Spotify to play music previews',
      loginSuccess: 'Successfully logged in!',
      loginError: 'Failed to login to Spotify',
      connected: 'Connected to Spotify',
      notConnected: 'Not connected to Spotify',
      logout: 'Logout'
    },
    turn: {
      currentPlayer: "It's {player}'s turn!",
      passDevice: 'Pass the device to {player}',
      ready: 'Ready to play?',
      listening: 'Listen to the track and place it on your timeline',
      placing: 'Drag the card to the correct position',
      correct: 'Correct! Released in {year}',
      incorrect: 'Incorrect! This was released in {year}',
      points: '+{points} points!'
    },
    timeline: {
      title: 'Timeline',
      empty: 'No tracks yet',
      placeHere: 'Place here'
    },
    score: {
      title: 'Hitster Tokens',
      tokens: 'Tokens: {count}',
      total: 'Bonus points: {score}'
    },
    end: {
      title: 'Game Over!',
      winner: '{player} wins with {score} tokens!',
      finalScores: 'Final Token Count',
      playAgain: 'Play Again'
    }
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    changeLanguage: 'Change Language',
    about: 'About',
    aboutText: 'A music timeline guessing game inspired by the party game Hitster.',
    madeWith: 'Made with Vue.js and Spotify API'
  }
}
