export default {
  common: {
    next: 'Weiter',
    back: 'Zurück',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    start: 'Start',
    finish: 'Beenden',
    continue: 'Weiter',
    loading: 'Laden...',
    error: 'Fehler',
    retry: 'Wiederholen',
    close: 'Schließen'
  },
  game: {
    title: 'Hipster',
    subtitle: 'Musik-Zeitstrahl-Spiel',
    newGame: 'Neues Spiel',
    continue: 'Spiel Fortsetzen',
    players: 'Spieler',
    round: 'Runde',
    playerCount: 'Anzahl Spieler (2-4)',
    playerNames: 'Spielernamen',
    playerName: 'Spieler {number} Name',
    allMusic: 'Alle Musik',
    targetSongs: 'Lieder zum Gewinnen',
    songs: 'Lieder',
    default: 'Standard',
    theme: 'Thema (Optional)',
    themes: {
      'guilty-pleasures': 'Guilty Pleasures',
      'belgian': 'Belgische Musik',
      'classics': 'Klassiker',
      'popular': 'Beliebte Hits',
      'vlaams': 'Flämische Musik',
      'pop-rock': 'Pop & Rock'
    },
    setupRequired: 'Spieleinrichtung Erforderlich',
    setupMessage: 'Bitte kehren Sie zurück, um ein neues Spiel einzurichten',
    backToSetup: 'Zurück zur Einrichtung',
    backToHome: 'Zurück zur Startseite',
    getTrack: 'Nächsten Track Holen',
    points: 'Punkte',
    audioNotSupported: 'Audio nicht unterstützt',
    demoMode: 'Demo-Modus',
    premiumRequired: 'Premium Erforderlich',
    needsPremium: 'Spotify Premium ist erforderlich, um vollständige Tracks zu spielen',
    needSpotifyForAudio: 'Mit Spotify verbinden, um Musik zu hören!',
    premiumNeededForFullPlay: 'Upgrade auf Spotify Premium, um vollständige Tracks zu spielen!',
    demoModeInstructions: 'Im Demo-Modus können Sie immer noch spielen, indem Sie basierend auf Track-Informationen raten.',
    demoModeActive: 'Im Demo-Modus spielen - keine Audio-Vorschauen verfügbar.',
    mobileListening: 'Hören & Raten',
    mobileGameMode: 'Auf dem Handy hören Sie aufmerksam die Hintergrundmusik und raten, wann dieser Track erschien!',
    listenCarefully: 'Nutzen Sie Ihr Musikwissen und Ihre Intuition, um diesen Track auf Ihrer Zeitlinie zu platzieren',
    playInSpotify: 'In Spotify abspielen',
    play: 'Abspielen',
    pause: 'Pausieren',
    restart: 'Neustart',
    mute: 'Stumm',
    unmute: 'Ton an',
    volume: 'Lautstärke',
    openInSpotify: 'In Spotify öffnen',
    dragToTimeline: 'Ziehen Sie die Karte auf Ihre Zeitlinie (oder tippen und halten auf dem Handy)',
    newTrack: 'Neuer Track',
    dragToPlace: 'Zum Platzieren auf Zeitlinie ziehen (oder tippen und halten)',
    placeEarlier: 'Vor diesem Track platzieren',
    placeBetween: 'Zwischen Tracks platzieren',
    placeLater: 'Nach diesem Track platzieren',
    tracksInTimeline: '{count} Tracks in der Zeitlinie',
    tokenAbilities: 'Token-Fähigkeiten',
    tokens: {
      skip: {
        label: 'Überspringen',
        description: 'Diesen Track überspringen und einen neuen bekommen'
      },
      hint: {
        label: 'Hinweis',
        description: 'Einen Hinweis über das Jahrzehnt bekommen'
      },
      challenge: {
        label: 'Herausforderung',
        description: 'Die Platzierung eines anderen Spielers herausfordern'
      },
      swap: {
        label: 'Tauschen',
        description: 'Zwei Karten in Ihrer Zeitlinie tauschen'
      },
      peek: {
        label: 'Spähen',
        description: 'Den nächsten Track vor der Platzierung ansehen'
      }
    },
    spotify: {
      login: 'Mit Spotify anmelden',
      required: 'Spotify-Anmeldung erforderlich',
      loginRequired: 'Wir benötigen Zugang zu Spotify, um Musikvorschauen abzuspielen',
      loginSuccess: 'Erfolgreich angemeldet!',
      loginError: 'Anmeldung bei Spotify fehlgeschlagen',
      connected: 'Mit Spotify verbunden',
      notConnected: 'Nicht mit Spotify verbunden',
      logout: 'Abmelden'
    },
    turn: {
      currentPlayer: "{player} ist dran!",
      passDevice: 'Gerät an {player} weitergeben',
      ready: 'Bereit zu spielen?',
      listening: 'Höre den Track und platziere ihn auf deiner Zeitlinie',
      placeOnTimeline: 'Höre genau zu und platziere richtig auf deiner Zeitlinie',
      placing: 'Ziehe die Karte an die richtige Position',
      correct: 'Richtig! Veröffentlicht in {year}',
      incorrect: 'Falsch! Dies wurde in {year} veröffentlicht',
      points: '+{points} Punkte!'
    },
    timeline: {
      title: 'Zeitlinie',
      empty: 'Noch keine Tracks',
      placeHere: 'Hier platzieren',
      tapToSelect: 'Tippen um diese Position zu wählen',
      selectedPosition: 'Ausgewählte Position',
      confirmPlacement: 'Track hier platzieren',
      cancelSelection: 'Abbrechen',
      mobileInstructions: 'Tippen Sie auf einen Zeitlinie-Slot unten, um diesen Track zu platzieren'
    },
    score: {
      title: 'Hipster Token',
      tokens: 'Token: {count}',
      total: 'Bonus Punkte: {score}'
    },
    end: {
      title: 'Spiel Beendet!',
      winner: '{player} gewinnt mit {score} richtig platzierten Liedern!',
      finalScores: 'Endergebnisse',
      playAgain: 'Nochmal Spielen'
    }
  },
  settings: {
    title: 'Einstellungen',
    language: 'Sprache',
    changeLanguage: 'Sprache Ändern',
    about: 'Über',
    aboutText: 'Ein Musik-Zeitstrahl-Ratespiel.',
    madeWith: 'Mit viel Freude und Liebe zur Musik und zu Spielen gemacht!'
  }
}
