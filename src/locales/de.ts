export default {
  common: {
    next: 'Weiter',
    back: 'Zurück',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    start: 'Start',
    finish: 'Beenden',
    loading: 'Laden...',
    error: 'Fehler',
    retry: 'Wiederholen'
  },
  game: {
    title: 'Hitster',
    subtitle: 'Musik-Zeitstrahl-Spiel',
    playerCount: 'Anzahl Spieler (2-4)',
    playerName: 'Spieler {number} Name',
    difficulty: 'Schwierigkeit',
    difficulties: {
      original: 'Original (Zeitstrahl)',
      pro: 'Pro (Titel + Künstler)',
      expert: 'Expert (Exaktes Jahr)'
    },
    theme: 'Thema (Optional)',
    themes: {
      '90s': '90er Hits',
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
    spotify: {
      login: 'Mit Spotify anmelden',
      required: 'Spotify-Anmeldung erforderlich',
      loginSuccess: 'Erfolgreich angemeldet!',
      loginError: 'Anmeldung bei Spotify fehlgeschlagen'
    },
    turn: {
      currentPlayer: "{player} ist dran!",
      passDevice: 'Gerät an {player} weitergeben',
      ready: 'Bereit zu spielen?',
      listening: 'Höre den Track und platziere ihn auf deiner Zeitlinie',
      placing: 'Ziehe die Karte an die richtige Position',
      correct: 'Richtig! Veröffentlicht in {year}',
      incorrect: 'Falsch! Dies wurde in {year} veröffentlicht',
      points: '+{points} Punkte!'
    },
    timeline: {
      title: 'Zeitlinie',
      empty: 'Noch keine Tracks',
      placeHere: 'Hier platzieren'
    },
    score: {
      title: 'Hitster Token',
      tokens: 'Token: {count}',
      total: 'Bonus Punkte: {score}'
    },
    end: {
      title: 'Spiel Beendet!',
      winner: '{player} gewinnt mit {score} Token!',
      finalScores: 'Endstand Token',
      playAgain: 'Nochmal Spielen'
    }
  },
  settings: {
    language: 'Sprache',
    changeLanguage: 'Sprache Ändern',
    aboutText: 'Ein Musik-Zeitstrahl-Ratespiel.',
    madeWith: 'Mit viel Freude und Liebe zur Musik und zu Spielen gemacht!'
  }
}
