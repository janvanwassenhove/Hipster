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
    retry: 'Réessayer',
    close: 'Fermer'
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
      'guilty-pleasures': 'Guilty Pleasures',
      'belgian': 'Musique Belge',
      'classics': 'Classiques',
      'popular': 'Hits Populaires',
      'vlaams': 'Musique Flamande',
      'pop-rock': 'Pop & Rock'
    },
    setupRequired: 'Configuration du Jeu Requise',
    setupMessage: 'Veuillez revenir en arrière pour configurer un nouveau jeu',
    backToSetup: 'Retour à la Configuration',
    backToHome: 'Retour à l\'Accueil',
    getTrack: 'Obtenir la Piste Suivante',
    points: 'points',
    audioNotSupported: 'Audio non supporté',
    demoMode: 'Mode Démo',
    premiumRequired: 'Premium Requis',
    needsPremium: 'Spotify Premium est requis pour jouer des pistes complètes',
    needSpotifyForAudio: 'Connectez-vous à Spotify pour entendre la musique!',
    premiumNeededForFullPlay: 'Passez à Spotify Premium pour jouer des pistes complètes!',
    demoModeInstructions: 'En mode démo, vous pouvez toujours jouer en devinant basé sur les informations de la piste.',
    demoModeActive: 'Jouer en mode démo - aucun audio disponible.',
    mobileListening: 'Écouter & Deviner',
    mobileGameMode: 'Sur mobile, écoutez attentivement la musique d\'ambiance et devinez quand cette piste est sortie!',
    listenCarefully: 'Utilisez vos connaissances musicales et votre intuition pour placer cette piste sur votre chronologie',
    playInSpotify: 'Jouer dans Spotify',
    openInSpotify: 'Ouvrir dans Spotify',
    dragToTimeline: 'Glissez la carte sur votre chronologie (ou appuyez longuement sur mobile)',
    newTrack: 'Nouvelle Piste',
    dragToPlace: 'Glisser pour placer sur la chronologie (ou appuyer longuement)',
    placeEarlier: 'Placer avant cette piste',
    placeBetween: 'Placer entre les pistes',
    placeLater: 'Placer après cette piste',
    tracksInTimeline: '{count} pistes dans la chronologie',
    tokenAbilities: 'Capacités de Jetons',
    tokens: {
      skip: {
        label: 'Passer',
        description: 'Passer cette piste et en obtenir une nouvelle'
      },
      hint: {
        label: 'Indice',
        description: 'Obtenir un indice sur la décennie'
      },
      challenge: {
        label: 'Défi',
        description: 'Défier le placement d\'un autre joueur'
      },
      swap: {
        label: 'Échanger',
        description: 'Échanger deux cartes dans votre chronologie'
      },
      peek: {
        label: 'Aperçu',
        description: 'Aperçu de la prochaine piste avant placement'
      }
    },
    spotify: {
      login: 'Se connecter avec Spotify',
      required: 'Connexion Spotify requise pour jouer',
      loginRequired: 'Nous avons besoin d\'accès à Spotify pour jouer des aperçus musicaux',
      loginSuccess: 'Connexion réussie!',
      loginError: 'Échec de la connexion à Spotify',
      connected: 'Connecté à Spotify',
      notConnected: 'Non connecté à Spotify',
      logout: 'Déconnexion'
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
      wrongPlacement: 'Mauvais placement!',
      releasedIn: 'Sorti en {year}',
      points: '+{points} points!',
      correctPlacement: 'Regardez où cette piste aurait dû être placée:',
      studyTimeline: 'Étudiez la chronologie pour apprendre l\'ordre chronologique correct.',
      continue: 'Continuer'
    },
    timeline: {
      title: 'Chronologie',
      empty: 'Aucune piste encore',
      placeHere: 'Placer ici',
      tapToSelect: 'Touchez pour sélectionner cette position',
      selectedPosition: 'Position sélectionnée',
      confirmPlacement: 'Placer la piste ici',
      cancelSelection: 'Annuler',
      mobileInstructions: 'Touchez une position de chronologie ci-dessous pour placer cette piste'
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
