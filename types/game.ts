export interface Player {
  id: string;
  name: string;
  score: number;
  timeline: TrackCard[];
  tokens: number;
}

export interface TrackCard {
  id: string;
  name: string;
  artist: string;
  year: number;
  preview_url: string;
  album_image?: string;
  placed_correctly: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentTrack: TrackCard | null;
  gameMode: 'original' | 'pro' | 'expert';
  theme: string;
  round: number;
  maxRounds: number;
  gamePhase: 'setup' | 'playing' | 'guessing' | 'results' | 'finished';
  tokenBets: TokenBet[];
}

export interface TokenBet {
  playerId: string;
  playerName: string;
  betAmount: number;
  betType: 'correct' | 'incorrect';
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
    release_date: string;
  };
  preview_url: string;
}