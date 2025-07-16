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
    retry: 'Opnieuw proberen'
  },
  game: {
    title: 'Hitster',
    subtitle: 'Muziek Tijdlijn Spel',
    newGame: 'Nieuw Spel',
    continue: 'Spel Voortzetten',
    players: 'Spelers',
    round: 'Ronde',
    playerCount: 'Aantal spelers (2-4)',
    playerNames: 'Spelersnamen',
    playerName: 'Speler {number} naam',
    allMusic: 'Alle Muziek',
    difficulty: 'Moeilijkheidsgraad',
    difficulties: {
      original: 'Original (Tijdlijn)',
      pro: 'Pro (Titel + Artiest)',
      expert: 'Expert (Exact Jaar)',
      originalHint: 'Plaats dit nummer op je tijdlijn',
      proHint: 'Je kent de titel en artiest, wanneer werd het uitgebracht?',
      expertHint: 'Je hebt alle info, welk jaar precies?'
    },
    theme: 'Thema (Optioneel)',
    themes: {
      '90s': 'Jaren 90 Hits',
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
    setupRequired: 'Spel Instellen Vereist',
    setupMessage: 'Ga terug om een nieuw spel in te stellen',
    backToSetup: 'Terug naar Instelling',
    backToHome: 'Terug naar Home',
    getTrack: 'Volgende Nummer',
    points: 'punten',
    audioNotSupported: 'Audio niet ondersteund',
    demoMode: 'Demo Modus',
    noPreview: 'Geen audio voorvertoning beschikbaar voor dit nummer',
    play: 'Afspelen',
    pause: 'Pauzeren',
    restart: 'Opnieuw',
    mute: 'Dempen',
    unmute: 'Dempen Uitschakelen',
    volume: 'Volume',
    openInSpotify: 'Openen in Spotify',
    dragToTimeline: 'Sleep de kaart naar je tijdlijn',
    newTrack: 'Nieuw Nummer',
    dragToPlace: 'Sleep om op tijdlijn te plaatsen',
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
      placing: 'Sleep de kaart naar de juiste positie',
      correct: 'Correct! Uitgebracht in {year}',
      incorrect: 'Fout! Dit werd uitgebracht in {year}',
      points: '+{points} punten!'
    },
    timeline: {
      title: 'Tijdlijn',
      empty: 'Nog geen nummers',
      placeHere: 'Plaats hier'
    },
    score: {
      title: 'Hitster Tokens',
      tokens: 'Tokens: {count}',
      total: 'Bonus punten: {score}'
    },
    end: {
      title: 'Spel Afgelopen!',
      winner: '{player} wint met {score} tokens!',
      finalScores: 'Eindstand Tokens',
      playAgain: 'Opnieuw Spelen'
    }
  },
  settings: {
    title: 'Instellingen',
    language: 'Taal',
    changeLanguage: 'Taal Wijzigen',
    about: 'Over',
    aboutText: 'Een muziek tijdlijn raadspel geïnspireerd op het partyspel Hitster.',
    madeWith: 'Gemaakt met Vue.js en Spotify API'
  }
}
