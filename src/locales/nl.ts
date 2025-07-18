export default {
  common: {
    next: 'Volgende',
    back: 'Terug',
    cancel: 'Annuleren',
    confirm: 'Bevestigen',
    start: 'Start',
    finish: 'Afronden',
    continue: 'Doorgaan',
    loading: 'Laden...',
    error: 'Fout',
    retry: 'Opnieuw proberen',
    close: 'Sluiten'
  },
  game: {
    title: 'Hipster',
    subtitle: 'Jouw muzikale party game!',
    newGame: 'Nieuw Spel',
    continue: 'Spel Voortzetten',
    players: 'Spelers',
    round: 'Ronde',
    playerCount: 'Aantal spelers (2-4)',
    playerNames: 'Spelersnamen',
    playerName: 'Speler {number} naam',
    allMusic: 'Alle Muziek',
    targetSongs: 'Nummers om te Winnen',
    songs: 'nummers',
    default: 'standaard',
    theme: 'Thema (Optioneel)',
    themes: {
      'guilty-pleasures': 'Guilty Pleasures',
      'belgian': 'Belgische Muziek',
      'classics': 'Klassiekers',
      'popular': 'Populaire Hits',
      'vlaams': 'Vlaamse Muziek',
      'pop-rock': 'Pop & Rock'
    },
    setupRequired: 'Spel Instellen Vereist',
    setupMessage: 'Ga terug om een nieuw spel in te stellen',
    backToSetup: 'Terug naar Instelling',
    backToHome: 'Terug naar Home',
    getTrack: 'Volgende Nummer',
    points: 'punten',
    audioNotSupported: 'Audio niet ondersteund',
    demoMode: 'Demo Modus',
    needSpotifyForAudio: 'Verbind met Spotify om muziek te horen!',
    demoModeInstructions: 'In demo modus kun je nog steeds spelen door te raden op basis van track informatie.',
    demoModeActive: 'Speelt in demo modus - geen audio beschikbaar.',
    mobileListening: 'Luister & Raad',
    mobileGameMode: 'Op mobiel, luister goed naar de achtergrondmuziek en raad wanneer dit nummer uitkwam!',
    listenCarefully: 'Gebruik je muziekkennis en intuïtie om dit nummer op je tijdlijn te plaatsen',
    playInSpotify: 'Afspelen in Spotify',
    play: 'Afspelen',
    pause: 'Pauzeren',
    restart: 'Opnieuw',
    mute: 'Dempen',
    unmute: 'Dempen Uitschakelen',
    volume: 'Volume',
    openInSpotify: 'Openen in Spotify',
    dragToTimeline: 'Sleep de kaart naar je tijdlijn (of tik en houd vast op mobiel)',
    newTrack: 'Nieuw Nummer',
    dragToPlace: 'Sleep om op tijdlijn te plaatsen (of tik en houd vast)',
    placeEarlier: 'Plaats voor dit nummer',
    placeBetween: 'Plaats tussen nummers',
    placeLater: 'Plaats na dit nummer',
    tracksInTimeline: '{count} nummers in tijdlijn',
    tokenAbilities: 'Token Vaardigheden',
    tokens: {
      skip: {
        label: 'Overslaan',
        description: 'Sla dit nummer over en krijg een nieuwe'
      },
      hint: {
        label: 'Hint',
        description: 'Krijg een hint over het decennium'
      },
      challenge: {
        label: 'Uitdaging',
        description: 'Daag een andere speler uit'
      }
    },
    spotify: {
      login: 'Inloggen met Spotify',
      required: 'Spotify inloggen vereist om te spelen',
      loginRequired: 'We hebben toegang tot Spotify nodig om muziekfragmenten af te spelen',
      loginSuccess: 'Succesvol ingelogd!',
      loginError: 'Kon niet inloggen bij Spotify',
      connected: 'Verbonden met Spotify',
      notConnected: 'Niet verbonden met Spotify',
      logout: 'Uitloggen'
    },
    turn: {
      currentPlayer: "Het is {player}'s beurt!",
      passDevice: 'Geef het apparaat door aan {player}',
      ready: 'Klaar om te spelen?',
      listening: 'Luister naar het nummer en plaats het op je tijdlijn',
      placeOnTimeline: 'Luister goed en plaats het correct op je tijdlijn',
      placing: 'Sleep de kaart naar de juiste positie',
      correct: 'Correct! Uitgebracht in {year}',
      incorrect: 'Fout! Dit werd uitgebracht in {year}',
      wrongPlacement: 'Verkeerd geplaatst!',
      releasedIn: 'Uitgebracht in {year}',
      points: '+{points} punten!',
      correctPlacement: 'Kijk waar dit nummer had moeten worden geplaatst:',
      studyTimeline: 'Bestudeer de tijdlijn om de juiste chronologische volgorde te leren.',
      continue: 'Doorgaan'
    },
    timeline: {
      title: 'Tijdlijn',
      empty: 'Nog geen nummers',
      placeHere: 'Plaats hier',
      tapToSelect: 'Tik om deze positie te selecteren',
      selectedPosition: 'Geselecteerde positie',
      confirmPlacement: 'Plaats nummer hier',
      cancelSelection: 'Annuleren',
      mobileInstructions: 'Tik op een tijdlijnpositie hieronder om dit nummer te plaatsen'
    },
    score: {
      title: 'Hipster Tokens',
      tokens: 'Tokens: {count}',
      total: 'Bonus punten: {score}'
    },
    end: {
      title: 'Spel Afgelopen!',
      winner: '{player} wint met {score} correct geplaatste nummers!',
      finalScores: 'Eindresultaten',
      playAgain: 'Opnieuw Spelen'
    }
  },
  settings: {
    title: 'Instellingen',
    language: 'Taal',
    changeLanguage: 'Taal Wijzigen',
    about: 'Over',
    aboutText: 'Een muziek tijdlijn raadspel.',
    madeWith: 'Gemaakt veel plezier en liefde voor muziek en spelletjes!'
  }
}
