# Sequence Diagrams

This document contains sequence diagrams for the key user flows and system interactions in the Hipster application.

## 1. Application Startup Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant GameStore
    participant SpotifyService
    participant LocalStorage

    User->>App: Navigate to application
    App->>LocalStorage: Check for OAuth callback
    
    alt OAuth Callback Present
        App->>SpotifyService: handleCallback()
        SpotifyService->>Spotify: Exchange code for tokens
        Spotify-->>SpotifyService: Access & refresh tokens
        SpotifyService->>LocalStorage: Store auth state
        SpotifyService-->>App: Authentication success
        App->>App: Clear URL parameters
    end
    
    App->>GameStore: loadGameState()
    GameStore->>LocalStorage: Retrieve saved game data
    LocalStorage-->>GameStore: Game state (if exists)
    GameStore-->>App: Game state loaded
    
    App->>User: Display HomeView
```

## 2. Spotify Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant HomeView
    participant SpotifyService
    participant Spotify
    participant LocalStorage

    User->>HomeView: Click "Connect to Spotify"
    HomeView->>SpotifyService: initiateLogin()
    
    SpotifyService->>SpotifyService: Generate PKCE verifier & challenge
    SpotifyService->>LocalStorage: Store code verifier
    SpotifyService->>Spotify: Redirect to authorization endpoint
    
    Spotify->>User: Display authorization consent
    User->>Spotify: Grant permissions
    Spotify->>App: Redirect with authorization code
    
    App->>SpotifyService: handleCallback()
    SpotifyService->>LocalStorage: Retrieve code verifier
    SpotifyService->>Spotify: Exchange code for tokens (POST /api/token)
    Spotify-->>SpotifyService: Access & refresh tokens
    
    SpotifyService->>LocalStorage: Store auth state
    SpotifyService->>SpotifyService: initializePlayerAfterAuth()
    SpotifyService-->>HomeView: Authentication complete
    
    HomeView->>User: Show authenticated state
```

## 3. Game Setup Flow

```mermaid
sequenceDiagram
    participant User
    participant HomeView
    participant GameStore
    participant SpotifyService
    participant LocalStorage

    User->>HomeView: Enter player names (2-4 players)
    User->>HomeView: Select game settings (target songs, theme)
    User->>HomeView: Click "Start Game"
    
    HomeView->>SpotifyService: isAuthenticated()
    SpotifyService-->>HomeView: Authentication status
    
    alt Not Authenticated
        HomeView->>User: Show "Connect to Spotify" prompt
        User->>HomeView: Click connect
        HomeView->>SpotifyService: initiateLogin()
        Note over SpotifyService: See Authentication Flow
    else Authenticated
        HomeView->>GameStore: initializePlayers(playerNames)
        GameStore->>GameStore: Create player objects
        GameStore->>GameStore: Set current player index to 0
        GameStore->>GameStore: Set game phase to 'playing'
        
        HomeView->>GameStore: updateSettings(gameSettings)
        GameStore->>GameStore: Store game configuration
        
        GameStore->>LocalStorage: saveGameState()
        GameStore-->>HomeView: Game initialized
        
        HomeView->>Router: Navigate to /game
        Router->>GameView: Load game interface
    end
```

## 4. Main Gameplay Flow

```mermaid
sequenceDiagram
    participant User
    participant GameView
    participant GameStore
    participant SpotifyService
    participant TrackPlayer
    participant PlayerTimeline

    GameView->>GameStore: Get current player
    GameStore-->>GameView: Current player data
    
    GameView->>GameStore: getNextTrack()
    GameStore->>SpotifyService: getRandomTrack(theme)
    SpotifyService->>Spotify: Search/Recommendations API
    Spotify-->>SpotifyService: Track data
    SpotifyService-->>GameStore: Random track
    GameStore->>GameStore: Set current track
    GameStore-->>GameView: Track ready
    
    GameView->>TrackPlayer: Display track (hidden album cover)
    TrackPlayer->>SpotifyService: playTrack(trackUri)
    SpotifyService->>Spotify: Web Playback SDK
    Spotify-->>TrackPlayer: Audio stream
    TrackPlayer->>User: Play 30-second preview
    
    User->>PlayerTimeline: Drag track to position
    PlayerTimeline->>GameStore: placeTrackOnTimeline(track, position)
    
    GameStore->>GameStore: Insert track at position
    GameStore->>GameStore: Check timeline correctness
    
    alt Correct Placement
        GameStore->>GameStore: Mark track as revealed
        GameStore->>GameStore: Award token & points
        GameStore->>GameStore: checkForBonusTokens()
        GameStore-->>GameView: Placement result (correct)
        GameView->>User: Show success feedback + album cover
        
        GameView->>GameStore: nextPlayer()
        GameStore->>GameStore: Advance to next player
        GameStore->>LocalStorage: saveGameState()
        
    else Incorrect Placement
        GameStore->>GameStore: Remove track from timeline
        GameStore-->>GameView: Placement result (incorrect)
        GameView->>User: Show correct answer + album cover
        User->>GameView: Click "Continue"
        GameView->>GameStore: nextPlayer()
    end
    
    GameStore->>GameStore: Check win conditions
    
    alt Game Finished
        GameStore->>GameStore: Set game phase to 'finished'
        GameStore->>GameStore: Calculate winner
        GameView->>User: Show game results
    else Continue Playing
        Note over GameView: Loop back to next track
    end
```

## 5. Token Ability Usage Flow

```mermaid
sequenceDiagram
    participant User
    participant GameView
    participant GameStore
    participant SpotifyService

    User->>GameView: Click token ability button
    GameView->>GameView: Show token selection dialog
    User->>GameView: Select ability (skip/hint/challenge/etc.)
    
    GameView->>GameStore: useToken(playerId, ability)
    GameStore->>GameStore: Check player has tokens
    
    alt Has Tokens
        GameStore->>GameStore: Deduct token
        
        alt Skip Ability
            GameStore->>GameStore: Move to next track
            GameStore-->>GameView: Skip completed
        else Hint Ability
            GameView->>User: Show year hint dialog
        else Challenge Ability
            GameStore->>GameStore: Allow timeline position swap
            GameView->>User: Enable timeline editing
        else Swap Ability
            GameView->>User: Show swap interface
        else Peek Ability
            GameView->>User: Briefly show album cover
        end
        
        GameStore->>LocalStorage: saveGameState()
        GameStore-->>GameView: Ability executed
        
    else No Tokens
        GameStore-->>GameView: Insufficient tokens
        GameView->>User: Show error message
    end
```

## 6. Web Playback SDK Management Flow

```mermaid
sequenceDiagram
    participant GameView
    participant SpotifyService
    participant WebPlaybackSDK
    participant Spotify
    participant Browser

    GameView->>SpotifyService: playTrack(trackUri)
    SpotifyService->>SpotifyService: Check if player ready
    
    alt Player Not Ready
        SpotifyService->>WebPlaybackSDK: Initialize player
        WebPlaybackSDK->>Spotify: Connect to Spotify
        Spotify-->>WebPlaybackSDK: Device registered
        WebPlaybackSDK-->>SpotifyService: Player ready
    end
    
    SpotifyService->>WebPlaybackSDK: Start playback
    WebPlaybackSDK->>Spotify: Request track stream
    Spotify-->>WebPlaybackSDK: Audio stream
    
    alt Mobile Device
        SpotifyService->>Browser: Check visibility state
        Browser-->>SpotifyService: App active/inactive
        
        alt App Becomes Inactive
            SpotifyService->>WebPlaybackSDK: Pause playback
        else App Becomes Active
            SpotifyService->>WebPlaybackSDK: Resume playback
            SpotifyService->>SpotifyService: maintainActiveSession()
        end
    end
    
    SpotifyService->>SpotifyService: Set 30-second timeout
    Note over SpotifyService: Auto-pause after preview duration
    SpotifyService-->>GameView: Playback status
```

## 7. Game State Persistence Flow

```mermaid
sequenceDiagram
    participant GameStore
    participant LocalStorage
    participant Browser

    Note over GameStore: Any state change occurs
    GameStore->>GameStore: saveGameState()
    GameStore->>LocalStorage: Store serialized state
    
    alt Browser Refresh/Restart
        Browser->>App: Page load
        App->>GameStore: loadGameState()
        GameStore->>LocalStorage: Retrieve saved state
        LocalStorage-->>GameStore: Game data (if exists)
        
        alt Valid Game State
            GameStore->>GameStore: Restore players, settings, progress
            GameStore-->>App: State restored
        else No/Invalid State
            GameStore->>GameStore: Initialize default state
            GameStore-->>App: Fresh start
        end
    end
```

## 8. Progressive Web App Installation Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant PWA
    participant ServiceWorker

    Browser->>Browser: Check PWA installability
    Browser->>User: Show "Add to Home Screen" prompt
    
    User->>Browser: Accept installation
    Browser->>PWA: Install app
    PWA->>ServiceWorker: Register service worker
    ServiceWorker->>ServiceWorker: Cache static assets
    ServiceWorker-->>PWA: Cache ready
    
    PWA->>Browser: Update manifest
    Browser->>User: App installed (home screen icon)
    
    User->>PWA: Launch installed app
    PWA->>ServiceWorker: Check for updates
    ServiceWorker->>ServiceWorker: Compare cache versions
    
    alt Updates Available
        ServiceWorker->>User: Show update notification
        User->>ServiceWorker: Accept update
        ServiceWorker->>ServiceWorker: Update cache
        ServiceWorker->>PWA: Reload app
    else No Updates
        ServiceWorker->>PWA: Load from cache
    end
```

## 9. Error Handling Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Service
    participant ExternalAPI

    Component->>Service: API request
    Service->>ExternalAPI: External call
    
    alt Network Error
        ExternalAPI-->>Service: Network failure
        Service->>Service: Retry logic (if applicable)
        Service-->>Component: Error response
        Component->>User: Show error message
    else Rate Limit Error
        ExternalAPI-->>Service: 429 Too Many Requests
        Service->>Service: Implement backoff
        Service-->>Component: Temporary error
        Component->>User: Show "try again later"
    else Authentication Error
        ExternalAPI-->>Service: 401 Unauthorized
        Service->>Service: Attempt token refresh
        
        alt Refresh Successful
            Service->>ExternalAPI: Retry original request
        else Refresh Failed
            Service-->>Component: Auth required
            Component->>User: Redirect to login
        end
    end
```

## Notes on Sequence Diagrams

### Diagram Conventions
- **Participants**: Represent the main actors/components in each flow
- **Arrows**: Solid arrows for calls, dashed arrows for responses
- **Alt/Else**: Alternative flows based on conditions
- **Notes**: Additional context or explanations

### Implementation Details
- All sequences use async/await patterns for API calls
- Error handling is implemented at each service boundary
- State changes trigger automatic persistence to localStorage
- Mobile-specific optimizations are included where relevant

### Future Enhancements
- Real-time multiplayer sequences (WebSocket integration)
- Backend API integration sequences
- Advanced analytics and tracking sequences