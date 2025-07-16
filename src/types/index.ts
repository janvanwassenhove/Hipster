export interface Player {
  id: string
  name: string
  score: number
  timeline: Track[]
  tokens: number
}

export interface Track {
  id: string
  name: string
  artists: Artist[]
  album: Album
  preview_url: string | null
  release_date: string
  year: number
  external_urls: {
    spotify: string
  }
  images: SpotifyImage[]
  revealed?: boolean // Whether album cover should be shown (after final placement)
  uri?: string // Spotify URI for Web Playback SDK
}

export interface Artist {
  id: string
  name: string
  external_urls: {
    spotify: string
  }
}

export interface Album {
  id: string
  name: string
  images: SpotifyImage[]
  release_date: string
  release_date_precision: string
}

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface GameSettings {
  targetSongs: number
  theme?: Theme
  maxRounds: number
  targetScore: number
}

export interface GameState {
  players: Player[]
  currentPlayerIndex: number
  currentTrack: Track | null
  isPlaying: boolean
  gamePhase: 'setup' | 'playing' | 'finished'
  round: number
  settings: GameSettings
}

export interface SpotifyAuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  isAuthenticated: boolean
}

export interface SpotifyRecommendationsResponse {
  tracks: Track[]
}

export interface SpotifySearchResponse {
  tracks: {
    items: Track[]
  }
}

export type Language = 'en' | 'nl' | 'fr' | 'de'

export type Theme = 
  | '90s'
  | 'guilty-pleasures'
  | 'schlager'
  | 'tiktok'
  | 'rock'
  | 'pop'
  | 'hip-hop'
  | 'electronic'
  | 'indie'
  | 'country'

export type TokenAbility = 'skip' | 'hint' | 'challenge' | 'swap' | 'peek'

export interface TokenAction {
  playerId: string
  ability: TokenAbility
  description: string
}
