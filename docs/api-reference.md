# API Reference

This document provides detailed reference for the APIs used in the Hipster application, including Spotify Web API integration and internal service APIs.

## Spotify Web API Integration

Hipster integrates with Spotify's Web API to access music data and provide audio playback functionality.

### Authentication

#### OAuth 2.0 with PKCE Flow

**Authorization Endpoint**:
```
GET https://accounts.spotify.com/authorize
```

**Parameters**:
- `response_type`: "code"
- `client_id`: Spotify application client ID
- `scope`: "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state"
- `redirect_uri`: Application callback URL
- `code_challenge_method`: "S256"
- `code_challenge`: Generated challenge
- `state`: Random state parameter

**Token Exchange**:
```
POST https://accounts.spotify.com/api/token
```

**Request Body**:
```typescript
{
  grant_type: "authorization_code",
  code: string,
  redirect_uri: string,
  client_id: string,
  code_verifier: string
}
```

**Response**:
```typescript
{
  access_token: string,
  token_type: "Bearer",
  scope: string,
  expires_in: number,
  refresh_token: string
}
```

### Track Search and Recommendations

#### Search Tracks
```
GET https://api.spotify.com/v1/search
```

**Parameters**:
- `q`: Search query string
- `type`: "track"
- `limit`: Number of results (1-50)
- `market`: ISO country code

**Response**:
```typescript
{
  tracks: {
    items: Track[]
  }
}
```

#### Get Recommendations
```
GET https://api.spotify.com/v1/recommendations
```

**Parameters**:
- `seed_genres`: Comma-separated genre list
- `limit`: Number of recommendations (1-100)
- `market`: ISO country code
- `min_year`: Minimum release year
- `max_year`: Maximum release year

### Web Playback SDK

#### Initialize Player
```typescript
const player = new Spotify.Player({
  name: 'Hipster Music Game',
  getOAuthToken: (cb) => cb(token),
  volume: 0.5
});
```

#### Player Events
```typescript
player.on('ready', ({ device_id }) => {
  console.log('Ready with Device ID', device_id);
});

player.on('not_ready', ({ device_id }) => {
  console.log('Device ID has gone offline', device_id);
});

player.on('player_state_changed', (state) => {
  // Handle playback state changes
});
```

#### Playback Control
```typescript
// Start playback
await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
  method: 'PUT',
  body: JSON.stringify({ uris: [trackUri] }),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  }
});

// Pause playback
await player.pause();

// Resume playback
await player.resume();
```

---

## Internal Service APIs

### SpotifyService Class

Main service class handling all Spotify integration.

#### Constructor
```typescript
class SpotifyService {
  private authState: SpotifyAuthState
  private player: Spotify.Player | null
  private isAuthenticating: boolean
}
```

#### Authentication Methods

##### `isAuthenticated(): boolean`
Checks if user has valid authentication tokens.

**Returns**: `boolean` - Authentication status

##### `async initiateLogin(): Promise<void>`
Initiates OAuth 2.0 PKCE authentication flow.

**Throws**: Authentication errors

##### `async handleCallback(): Promise<boolean>`
Handles OAuth callback and exchanges code for tokens.

**Returns**: `boolean` - Success status

##### `async refreshToken(): Promise<boolean>`
Refreshes expired access token using refresh token.

**Returns**: `boolean` - Refresh success status

#### Track Management Methods

##### `async getRandomTrack(theme?: Theme): Promise<Track | null>`
Fetches a random track based on optional theme.

**Parameters**:
- `theme` (optional): Music theme filter

**Returns**: `Promise<Track | null>` - Random track or null if error

**Implementation**:
```typescript
async getRandomTrack(theme?: Theme): Promise<Track | null> {
  try {
    const searchQuery = this.buildSearchQuery(theme);
    const response = await this.apiRequest(`/search?q=${searchQuery}&type=track&limit=50`);
    const tracks = response.tracks.items.filter(this.isValidTrack);
    return tracks[Math.floor(Math.random() * tracks.length)] || null;
  } catch (error) {
    console.error('Error fetching random track:', error);
    return null;
  }
}
```

##### `async searchTracks(query: string): Promise<Track[]>`
Searches for tracks matching query string.

**Parameters**:
- `query`: Search term

**Returns**: `Promise<Track[]>` - Array of matching tracks

#### Playback Methods

##### `async playTrack(trackUri: string): Promise<boolean>`
Starts playback of specified track.

**Parameters**:
- `trackUri`: Spotify track URI (spotify:track:id)

**Returns**: `Promise<boolean>` - Playback start success

##### `async pausePlayback(): Promise<boolean>`
Pauses current playback.

**Returns**: `Promise<boolean>` - Pause success

##### `async resumePlayback(): Promise<boolean>`
Resumes paused playback.

**Returns**: `Promise<boolean>` - Resume success

##### `async stopPlayback(): Promise<boolean>`
Stops current playback completely.

**Returns**: `Promise<boolean>` - Stop success

#### Utility Methods

##### `private async apiRequest(endpoint: string): Promise<any>`
Makes authenticated API request to Spotify.

**Parameters**:
- `endpoint`: API endpoint path

**Returns**: `Promise<any>` - API response data

**Implementation**:
```typescript
private async apiRequest(endpoint: string): Promise<any> {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${this.authState.accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    // Try to refresh token
    if (await this.refreshToken()) {
      // Retry request with new token
      return this.apiRequest(endpoint);
    }
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
```

---

### GameStore (Pinia)

Manages all game state and logic.

#### State Interface
```typescript
interface GameState {
  players: Player[]
  currentPlayerIndex: number
  currentTrack: Track | null
  isPlaying: boolean
  gamePhase: 'setup' | 'playing' | 'finished'
  round: number
  settings: GameSettings
}
```

#### Game Management Actions

##### `initializePlayers(playerNames: string[]): void`
Sets up new game with player names.

**Parameters**:
- `playerNames`: Array of 2-4 player names

**Side Effects**:
- Creates player objects with initial state
- Sets current player to first player
- Saves game state to localStorage

##### `updateSettings(newSettings: Partial<GameSettings>): void`
Updates game configuration.

**Parameters**:
- `newSettings`: Partial settings object

##### `async getNextTrack(): Promise<Track | null>`
Fetches next track for current player.

**Returns**: `Promise<Track | null>` - Next track or null

**Implementation**:
```typescript
async getNextTrack(): Promise<Track | null> {
  try {
    const track = await spotifyService.getRandomTrack(this.settings.theme);
    if (track) {
      this.currentTrack = track;
      this.saveGameState();
    }
    return track;
  } catch (error) {
    console.error('Error getting next track:', error);
    return null;
  }
}
```

#### Gameplay Actions

##### `placeTrackOnTimeline(track: Track, position: number): boolean`
Places track at specified position and validates correctness.

**Parameters**:
- `track`: Track to place
- `position`: Timeline position (0-based index)

**Returns**: `boolean` - Whether placement was correct

**Implementation**:
```typescript
placeTrackOnTimeline(track: Track, position: number): boolean {
  const player = this.currentPlayer;
  if (!player) return false;

  // Insert track at position
  player.timeline.splice(position, 0, track);
  
  // Check if timeline is chronologically correct
  const isCorrect = this.isTimelineCorrect(player.timeline);
  
  if (isCorrect) {
    // Award points and tokens
    track.revealed = true;
    player.tokens++;
    player.score += this.calculatePoints(player.timeline.length);
    this.checkForBonusTokens(player);
  } else {
    // Remove incorrectly placed track
    player.timeline.splice(position, 1);
  }
  
  this.saveGameState();
  return isCorrect;
}
```

##### `nextPlayer(): void`
Advances to next player's turn.

**Side Effects**:
- Increments current player index
- Increments round if back to first player
- Checks for game end conditions

##### `useToken(playerId: string, ability: TokenAbility): boolean`
Consumes player token for special ability.

**Parameters**:
- `playerId`: Player identifier
- `ability`: Token ability type

**Returns**: `boolean` - Whether token was successfully used

#### Utility Methods

##### `private isTimelineCorrect(timeline: Track[]): boolean`
Validates that timeline is in chronological order.

**Parameters**:
- `timeline`: Array of tracks to validate

**Returns**: `boolean` - Whether timeline is chronologically correct

##### `private calculatePoints(timelineLength: number): number`
Calculates points based on timeline length.

**Parameters**:
- `timelineLength`: Number of tracks in timeline

**Returns**: `number` - Points to award

**Implementation**:
```typescript
private calculatePoints(timelineLength: number): number {
  if (timelineLength >= 8) return 3;
  if (timelineLength >= 5) return 2;
  return 1;
}
```

##### `private checkForBonusTokens(player: Player): void`
Checks and awards bonus tokens based on Hitster rules.

**Parameters**:
- `player`: Player to check for bonus eligibility

**Side Effects**:
- May award additional tokens
- Updates player token count

---

## Data Models

### Core Interfaces

#### Player
```typescript
interface Player {
  id: string;          // Unique identifier
  name: string;        // Display name
  score: number;       // Total points earned
  timeline: Track[];   // Chronologically ordered tracks
  tokens: number;      // Available ability tokens
}
```

#### Track
```typescript
interface Track {
  id: string;                    // Spotify track ID
  name: string;                  // Track title
  artists: Artist[];             // Track artists
  album: Album;                  // Album information
  release_date: string;          // ISO date string
  year: number;                  // Release year
  external_urls: {               // External links
    spotify: string;
  };
  images: SpotifyImage[];        // Album artwork
  revealed?: boolean;            // Whether album cover is shown
  uri?: string;                  // Spotify URI for playback
}
```

#### GameSettings
```typescript
interface GameSettings {
  targetSongs: number;    // Win condition (5, 8, or 10)
  theme?: Theme;          // Optional music theme
  maxRounds: number;      // Maximum rounds before tie
  targetScore: number;    // Alternative win condition
}
```

#### SpotifyAuthState
```typescript
interface SpotifyAuthState {
  accessToken: string | null;   // OAuth access token
  refreshToken: string | null;  // OAuth refresh token
  expiresAt: number | null;     // Token expiration timestamp
  isAuthenticated: boolean;     // Current auth status
}
```

### Type Definitions

#### Theme
```typescript
type Theme = 
  | 'guilty-pleasures'
  | 'belgian'
  | 'classics'
  | 'popular'
  | 'vlaams'
  | 'pop-rock';
```

#### TokenAbility
```typescript
type TokenAbility = 
  | 'skip'      // Skip current track
  | 'hint'      // Show year hint
  | 'challenge' // Rearrange timeline
  | 'swap'      // Exchange track with opponent
  | 'peek';     // Briefly show album cover
```

#### Language
```typescript
type Language = 'en' | 'nl' | 'fr' | 'de';
```

---

## Error Handling

### API Error Types

#### Authentication Errors
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid OAuth parameters

#### Rate Limiting
- `429 Too Many Requests`: API rate limit exceeded
- Retry with exponential backoff

#### Network Errors
- Connection timeout
- DNS resolution failure
- Service unavailable

### Error Response Format

```typescript
interface APIError {
  status: number;
  message: string;
  details?: any;
}
```

### Error Handling Strategy

```typescript
async function handleAPIError(error: any): Promise<void> {
  switch (error.status) {
    case 401:
      // Attempt token refresh
      await refreshToken();
      break;
    case 429:
      // Implement backoff
      await delay(error.retryAfter * 1000);
      break;
    case 503:
      // Service unavailable - show user message
      showErrorMessage('Service temporarily unavailable');
      break;
    default:
      console.error('Unexpected error:', error);
  }
}
```

---

## Configuration

### Environment Variables

```typescript
// Spotify Configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/Hipster/`;

// Spotify API Scopes
const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
].join(' ');
```

### Default Settings

```typescript
const DEFAULT_GAME_SETTINGS: GameSettings = {
  targetSongs: 10,
  theme: undefined,
  maxRounds: 50,
  targetScore: 100
};
```

### Theme Configuration

```typescript
const THEME_SEARCH_QUERIES = {
  'guilty-pleasures': 'guilty pleasure songs',
  'belgian': 'belgian music',
  'classics': 'classic rock oldies',
  'popular': 'popular hits top 40',
  'vlaams': 'vlaamse muziek',
  'pop-rock': 'pop rock music'
};
```