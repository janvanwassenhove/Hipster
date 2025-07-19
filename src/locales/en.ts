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
    retry: 'Retry',
    close: 'Close'
  },
  game: {
    title: 'Hipster',
    subtitle: 'Music Timeline Game',
    newGame: 'New Game',
    introduction: 'The Ultimate Music Timeline Challenge',
    howToPlay: 'How to Play',
    rules: {
      step1: 'Listen to a mystery track from the past decades',
      step2: 'Guess when it was released and place it on your timeline',
      step3: 'Build your timeline in chronological order',
      step4: 'First player to correctly place {target} songs wins!'
    },
    players: 'Players',
    round: 'Round',
    playerCount: 'Number of players (2-4)',
    playerNames: 'Player Names',
    playerName: 'Player {number} name',
    allMusic: 'All Music',
    targetSongs: 'Songs to Win',
    songs: 'songs',
    default: 'default',
    theme: 'Theme (Optional)',
    themes: {
      'guilty-pleasures': 'Guilty Pleasures',
      'belgian': 'Belgian Music',
      'classics': 'Classics',
      'popular': 'Popular Hits',
      'vlaams': 'Flemish Music',
      'pop-rock': 'Pop & Rock'
    },
    setupRequired: 'Game Setup Required',
    setupMessage: 'Please go back to set up a new game',
    backToSetup: 'Back to Setup',
    backToHome: 'Back to Home',
    getTrack: 'Get Next Track',
    points: 'points',
    audioNotSupported: 'Audio not supported',
    demoMode: 'Demo Mode',
    premiumRequired: 'Premium Required',
    needsPremium: 'Spotify Premium is required to play full tracks',
    needSpotifyForAudio: 'Connect to Spotify to hear music!',
    premiumNeededForFullPlay: 'Upgrade to Spotify Premium to play full tracks!',
    demoModeInstructions: 'In demo mode, you can still play the game by guessing based on track information.',
    demoModeActive: 'Playing in demo mode - no audio previews available.',
    mobileListening: 'Listen & Guess',
    mobileGameMode: 'On mobile, listen carefully to the background music and guess when this track was released!',
    listenCarefully: 'Use your musical knowledge and intuition to place this track on your timeline',
    playInSpotify: 'Play in Spotify',
    play: 'Play',
    pause: 'Pause',
    restart: 'Restart',
    mute: 'Mute',
    unmute: 'Unmute',
    volume: 'Volume',
    openInSpotify: 'Open in Spotify',
    dragToTimeline: 'Drag the card to your timeline (or tap and hold to drag on mobile)',
    newTrack: 'New Track',
    dragToPlace: 'Drag to place on timeline (or tap and hold)',
    tapToPlace: 'Tap to place',
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
    spotifyConnect: {
      title: 'Spotify Connect',
      description: 'Music will play through your Spotify app'
    },
    deviceHelp: {
      noDevices: {
        title: 'No Spotify App Found',
        message: 'No Spotify devices detected.'
      },
      inactive: {
        title: 'Spotify App Inactive',
        message: 'Your Spotify app became inactive after being idle.'
      },
      activationFailed: {
        title: 'Device Activation Failed',
        message: 'Could not activate your Spotify device.'
      },
      generic: {
        title: 'Playback Issue',
        message: 'There was a problem with playback.'
      },
      steps: {
        title: 'Quick Fix:',
        step1: 'Open the Spotify app on your device',
        step2: 'Play any song (you can pause it right away)',
        step3: 'Come back to this game and try again'
      },
      retry: 'Try Again',
      retrying: 'Retrying...',
      dismiss: 'Dismiss'
    },
    turn: {
      currentPlayer: "It's {player}'s turn!",
      passDevice: 'Pass the device to {player}',
      ready: 'Ready to play?',
      listening: 'Listen to the track and place it on your timeline',
      placeOnTimeline: 'Listen carefully and place it correctly on your timeline',
      placing: 'Drag the card to the correct position',
      correct: 'Correct! Released in {year}',
      incorrect: 'Incorrect! This was released in {year}',
      wrongPlacement: 'Wrong placement!',
      releasedIn: 'Released in {year}',
      points: '+{points} points!',
      correctPlacement: 'Look at where this track should have been placed:',
      studyTimeline: 'Study the timeline to learn the correct chronological order.',
      continue: 'Continue'
    },
    timeline: {
      title: 'Timeline',
      empty: 'No tracks yet',
      placeHere: 'Place here',
      tapToSelect: 'Tap to select this position',
      selectedPosition: 'Selected position',
      confirmPlacement: 'Place track here',
      cancelSelection: 'Cancel',
      mobileInstructions: 'Tap a timeline slot below to place this track'
    },
    score: {
      title: 'Hipster Tokens',
      tokens: 'Tokens: {count}',
      total: 'Bonus points: {score}'
    },
    end: {
      title: 'Game Over!',
      winner: '{player} wins with {score} songs correctly placed!',
      finalScores: 'Final Results',
      playAgain: 'Play Again'
    }
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    changeLanguage: 'Change Language',
    about: 'About',
    aboutText: 'A music timeline guessing game.',
    madeWith: 'Made with lots of fun and love for music and games!'
  }
}
