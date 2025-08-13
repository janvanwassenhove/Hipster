# Architecture Documentation

## System Overview

Hipster is a client-side Progressive Web Application that implements a music timeline guessing game. The architecture follows a layered approach with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Vue.js 3 Components (Views & Components)                  │
│  ├── HomeView.vue      (Game setup and menu)               │
│  ├── GameView.vue      (Main gameplay interface)           │
│  ├── SettingsView.vue  (Language and preferences)          │
│  ├── PlayerTimeline.vue (Timeline component)               │
│  └── TrackPlayer.vue   (Music player component)            │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     State Management                        │
├─────────────────────────────────────────────────────────────┤
│  Pinia Stores                                              │
│  ├── game.ts          (Game state, players, scoring)       │
│  └── (Other stores as needed)                              │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Services                                   │
│  ├── spotify.ts       (Spotify API integration)            │
│  └── (Future services)                                     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
├─────────────────────────────────────────────────────────────┤
│  ├── Spotify Web API   (Music data and playback)           │
│  ├── Spotify Web Playback SDK (Audio streaming)            │
│  └── Browser APIs      (LocalStorage, PWA features)        │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### View Components

#### HomeView.vue
- **Purpose**: Main landing page and game setup
- **Responsibilities**:
  - Player name input (2-4 players)
  - Game settings configuration (target songs, theme)
  - Spotify authentication initiation
  - Game rules display
- **Key Dependencies**: GameStore, SpotifyService, i18n

#### GameView.vue
- **Purpose**: Main gameplay interface
- **Responsibilities**:
  - Display current track and player
  - Handle track placement on timeline
  - Show scoring and feedback
  - Manage game flow and turns
  - Handle special token abilities
- **Key Dependencies**: GameStore, SpotifyService, PlayerTimeline, TrackPlayer

#### SettingsView.vue
- **Purpose**: Application preferences
- **Responsibilities**:
  - Language selection
  - Theme preferences
  - Account management
- **Key Dependencies**: i18n, GameStore

### Reusable Components

#### PlayerTimeline.vue
- **Purpose**: Visual representation of player's chronological timeline
- **Responsibilities**:
  - Display tracks in chronological order
  - Handle drag-and-drop placement
  - Show placement feedback
  - Display album covers for placed tracks
- **Props**: `player: Player`, `isActive: boolean`, `allowDrop: boolean`

#### TrackPlayer.vue
- **Purpose**: Music playback interface
- **Responsibilities**:
  - Audio preview playback
  - Track information display
  - Playback controls (play/pause)
  - Visual feedback for playing state
- **Props**: `track: Track`, `autoPlay: boolean`

## State Management Architecture

### Game Store (Pinia)

The game store manages all game-related state using Pinia's composition API:

```typescript
interface GameState {
  // Player Management
  players: Player[]
  currentPlayerIndex: number
  
  // Game Flow
  currentTrack: Track | null
  gamePhase: 'setup' | 'playing' | 'finished'
  round: number
  
  // Configuration
  settings: GameSettings
  
  // Audio State
  isPlaying: boolean
}
```

**Key Methods**:
- `initializePlayers(names: string[])` - Setup game with player names
- `getNextTrack(): Promise<Track>` - Fetch random track from Spotify
- `placeTrackOnTimeline(track: Track, position: number)` - Validate and place track
- `nextPlayer()` - Advance to next player's turn
- `checkForBonusTokens(player: Player)` - Award bonus tokens per Hitster rules

### State Persistence

Game state is automatically persisted to localStorage:
- **Save Triggers**: After each significant state change
- **Load**: On application startup
- **Data**: Players, scores, current game phase, settings

## Service Layer Architecture

### SpotifyService

Handles all Spotify Web API integration with OAuth 2.0 PKCE flow:

```typescript
class SpotifyService {
  // Authentication
  async initiateLogin(): Promise<void>
  async handleCallback(): Promise<boolean>
  
  // Track Management
  async getRandomTrack(theme?: Theme): Promise<Track>
  async searchTracks(query: string): Promise<Track[]>
  
  // Playback (Web Playback SDK)
  async playTrack(trackUri: string): Promise<boolean>
  async pausePlayback(): Promise<boolean>
  
  // Session Management
  isAuthenticated(): boolean
  async refreshToken(): Promise<boolean>
}
```

**OAuth Flow**:
1. Generate PKCE code verifier and challenge
2. Redirect to Spotify authorization endpoint
3. Handle callback with authorization code
4. Exchange code for access/refresh tokens
5. Store tokens securely in localStorage

**Web Playback SDK Integration**:
- Initialize SDK after successful authentication
- Handle device activation and session management
- Mobile-specific optimizations for iOS/Android
- Fallback to preview URLs when SDK unavailable

## Data Models

### Core Entities

```typescript
interface Player {
  id: string
  name: string
  score: number
  timeline: Track[]
  tokens: number
}

interface Track {
  id: string
  name: string
  artists: Artist[]
  album: Album
  release_date: string
  year: number
  external_urls: { spotify: string }
  images: SpotifyImage[]
  revealed?: boolean
  uri?: string
}

interface GameSettings {
  targetSongs: number
  theme?: Theme
  maxRounds: number
  targetScore: number
}
```

## Security Architecture

### Authentication Security
- **OAuth 2.0 with PKCE**: Prevents authorization code interception
- **Token Storage**: Access tokens in localStorage (temporary)
- **Token Refresh**: Automatic refresh before expiration
- **Scope Limitation**: Minimal required Spotify permissions

### Client-Side Security
- **Input Validation**: Player names, game settings
- **XSS Prevention**: Vue.js automatic escaping
- **HTTPS Only**: All API calls over secure connections

## PWA Architecture

### Service Worker
- **Caching Strategy**: Cache-first for static assets, network-first for API calls
- **Offline Support**: Limited to cached content and saved game state
- **Update Strategy**: Prompt user for app updates

### Manifest Configuration
- **Installability**: Meets PWA installation criteria
- **Icons**: Multiple sizes for different devices
- **Display Mode**: Standalone app experience
- **Orientation**: Portrait preferred for mobile

## Performance Considerations

### Code Splitting
- **Route-based**: Lazy loading of view components
- **Dynamic Imports**: Conditional loading of heavy dependencies

### Bundle Optimization
- **Tree Shaking**: Remove unused code via Vite
- **Asset Optimization**: Image compression and format selection
- **CSS Purging**: Remove unused Tailwind classes

### Runtime Performance
- **Virtual Scrolling**: For large timeline displays (future enhancement)
- **Audio Preloading**: Smart preloading of track previews
- **State Normalization**: Efficient data structures for game state

## Deployment Architecture

### Build Process
```bash
npm run build  # Vite production build
# ↓
# dist/ folder with optimized assets
# ↓ 
# GitHub Pages deployment via GitHub Actions
```

### GitHub Pages Configuration
- **Base URL**: `/Hipster/` for repository deployment
- **Hash Router**: Client-side routing without server configuration
- **Asset Paths**: Relative paths for proper loading

### CI/CD Pipeline
- **Trigger**: Push to main branch
- **Steps**: Install dependencies → Build → Deploy to gh-pages branch
- **Environment**: Node.js 18+ with npm cache

## Scalability Considerations

### Current Limitations
- **Client-side Only**: No server-side persistence
- **Spotify API Limits**: Rate limiting for track requests
- **Browser Storage**: LocalStorage size limitations

### Future Enhancements
- **Backend Integration**: User accounts and game history
- **Real-time Multiplayer**: WebSocket support for remote play
- **Advanced Analytics**: Game statistics and player insights
- **Content Expansion**: Integration with additional music services