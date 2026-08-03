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
    introduction: 'De Ultieme Muziek Tijdlijn Uitdaging',
    howToPlay: 'Hoe Te Spelen',
    rules: {
      step1: 'Luister naar een mysterieus nummer uit voorbije decennia',
      step2: 'Raad wanneer het uitkwam en plaats het op je tijdlijn',
      step3: 'Bouw je tijdlijn in chronologische volgorde',
      step4: 'Eerste speler die {target} nummers correct plaatst wint!'
    },
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
    tapToPlace: 'Tik om te plaatsen',
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
    deviceHelp: {
      wakeTimeout: {
        title: 'Spotify viel weer in slaap',
        message: 'Je telefoon verdwijnt binnen enkele seconden uit Spotify Connect zolang er niets speelt.',
        action: 'Spotify wakker houden:',
        step1: 'Open Spotify en druk op play bij een eigen nummer',
        step2: 'Kom terug - het spel neemt het over en speelt de ronde'
      },
      wakeSpotify: {
        title: 'Maak Spotify wakker:',
        button: 'Spotify openen',
        hint: 'Kom meteen terug - het spel start het nummer zelf, dus je ziet niets wat je moet raden.'
      },
      sessionExpired: {
        title: 'Spotify-sessie verlopen',
        message: 'Spotify heeft de verbinding geweigerd. Verbind je account opnieuw.',
        action: 'Opnieuw verbinden om verder te spelen:'
      },
      noDevices: {
        title: 'Geen Spotify-app gevonden',
        message: 'Geen Spotify-apparaten gevonden.'
      },
      inactive: {
        title: 'Spotify-app inactief',
        message: 'Je Spotify-app is inactief geworden.'
      },
      activationFailed: {
        title: 'Apparaat activeren mislukt',
        message: 'Je Spotify-apparaat kon niet geactiveerd worden.'
      },
      generic: {
        title: 'Afspeelprobleem',
        message: 'Er was een probleem met het afspelen.'
      },
      steps: {
        title: 'Snelle oplossing:',
        step1: 'Open de Spotify-app op je toestel',
        step2: 'Speel een nummer af (je mag het meteen pauzeren)',
        step3: 'Kom terug naar dit spel en probeer opnieuw'
      },
      retry: 'Opnieuw proberen',
      retrying: 'Bezig...',
      dismiss: 'Sluiten'
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
    madeWith: 'Gemaakt veel plezier en liefde voor muziek en spelletjes!',
    diagnostics: {
      title: 'Spotify-sessiediagnose',
      hint: 'Als Spotify opnieuw om een login vraagt, zie je hier waarom.',
      empty: 'Geen sessieproblemen geregistreerd.',
      lastEnd: 'Laatste sessie beëindigd',
      recentEvents: 'Recente gebeurtenissen',
      copy: 'Kopiëren',
      copied: 'Gekopieerd!',
      clear: 'Wissen'
    }
  }
}
