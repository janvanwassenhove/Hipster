export default {
  common: {
    next: 'Suivant',
    back: 'Retour',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    start: 'Commencer',
    finish: 'Terminer',
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer'
  },
  game: {
    title: 'Hipster',
    subtitle: 'Jeu de Chronologie Musicale',
    playerCount: 'Nombre de joueurs (2-4)',
    playerNames: 'Noms des Joueurs',
    playerName: 'Nom du joueur {number}',
    allMusic: 'Toute la Musique',
    targetSongs: 'Chansons pour Gagner',
    songs: 'chansons',
    default: 'défaut',
    theme: 'Thème (Optionnel)',
    themes: {
      '90s': 'Hits des Années 90',
      'guilty-pleasures': 'Guilty Pleasures',
      'schlager': 'Schlager',
      'tiktok': 'Hits TikTok',
      'rock': 'Rock',
      'pop': 'Pop',
      'hip-hop': 'Hip-Hop',
      'electronic': 'Électronique',
      'indie': 'Indie',
      'country': 'Country'
    },
    spotify: {
      login: 'Se connecter avec Spotify',
      required: 'Connexion Spotify requise pour jouer',
      loginSuccess: 'Connexion réussie!',
      loginError: 'Échec de la connexion à Spotify'
    },
    turn: {
      currentPlayer: "C'est le tour de {player}!",
      passDevice: 'Passez l\'appareil à {player}',
      ready: 'Prêt à jouer?',
      listening: 'Écoutez la piste et placez-la sur votre chronologie',
      placeOnTimeline: 'Écoutez attentivement et placez correctement sur votre chronologie',
      placing: 'Glissez la carte à la bonne position',
      correct: 'Correct! Sorti en {year}',
      incorrect: 'Incorrect! Ceci est sorti en {year}',
      points: '+{points} points!'
    },
    timeline: {
      title: 'Chronologie',
      empty: 'Aucune piste encore',
      placeHere: 'Placer ici'
    },
    score: {
      title: 'Jetons Hipster',
      tokens: 'Jetons: {count}',
      total: 'Points bonus: {score}'
    },
    end: {
      title: 'Jeu Terminé!',
      winner: '{player} gagne avec {score} chansons correctement placées!',
      finalScores: 'Résultats Finaux',
      playAgain: 'Rejouer'
    }
  },
  settings: {
    language: 'Langue',
    changeLanguage: 'Changer de Langue',
    aboutText: 'Un jeu de devinette de chronologie musicale.',
    madeWith: 'Fait avec beaucoup de plaisir et d\'amour pour la musique et les jeux!'
  }
}
