# Functional Use Cases

This document outlines the functional requirements and user stories for the Hipster music timeline game.

## Overview

Hipster is a music guessing game where players compete to correctly place songs on a chronological timeline. The game integrates with Spotify to provide real music previews and follows the official Hitster board game rules.

## Primary Actors

- **Player**: End user playing the game
- **Spotify**: External music service providing audio and metadata
- **System**: The Hipster application

## Use Case Categories

1. [Game Setup](#game-setup-use-cases)
2. [Authentication](#authentication-use-cases)
3. [Gameplay](#gameplay-use-cases)
4. [Token System](#token-system-use-cases)
5. [Settings & Configuration](#settings--configuration-use-cases)
6. [Progressive Web App](#progressive-web-app-use-cases)

---

## Game Setup Use Cases

### UC-01: Start New Game

**Actor**: Player  
**Goal**: Initialize a new game session  
**Preconditions**: Application is loaded  
**Postconditions**: Game is ready to play with configured settings  

**Main Success Scenario**:
1. Player navigates to home screen
2. Player enters names for 2-4 players
3. Player selects game settings:
   - Target number of songs (5, 8, 10)
   - Optional music theme (guilty pleasures, Belgian, classics, etc.)
4. Player clicks "Start Game"
5. System validates inputs
6. System initializes game state with players and settings
7. System navigates to game screen

**Alternative Flows**:
- **A1**: Player enters duplicate names
  - System shows error message
  - Player corrects names
- **A2**: Player enters less than 2 or more than 4 names
  - System shows validation error
  - Player adjusts number of players

**Extensions**:
- **E1**: Spotify not connected
  - System prompts for Spotify authentication
  - See UC-11: Connect to Spotify

### UC-02: Resume Saved Game

**Actor**: Player  
**Goal**: Continue a previously started game  
**Preconditions**: Saved game state exists in browser storage  
**Postconditions**: Game continues from last saved state  

**Main Success Scenario**:
1. Player opens application
2. System detects saved game state
3. System displays option to resume or start new game
4. Player chooses to resume
5. System loads saved state (players, scores, current turn)
6. System navigates to appropriate screen (home or game)

**Alternative Flows**:
- **A1**: Player chooses to start new game
  - System discards saved state
  - See UC-01: Start New Game

### UC-03: Configure Game Settings

**Actor**: Player  
**Goal**: Customize game parameters before starting  
**Preconditions**: On home screen  
**Postconditions**: Game settings are configured and saved  

**Main Success Scenario**:
1. Player accesses game settings section
2. Player selects target number of songs (5, 8, or 10)
3. Player optionally selects music theme:
   - All Music (default)
   - Guilty Pleasures
   - Belgian Music
   - Classics
   - Popular Music
   - Vlaams Music
   - Pop-Rock
4. System validates and saves settings
5. Settings are applied to new game

---

## Authentication Use Cases

### UC-11: Connect to Spotify

**Actor**: Player  
**Goal**: Authenticate with Spotify to access music  
**Preconditions**: Player has Spotify account  
**Postconditions**: Player is authenticated and can access Spotify features  

**Main Success Scenario**:
1. Player clicks "Connect to Spotify" button
2. System initiates OAuth 2.0 PKCE flow
3. System redirects to Spotify authorization page
4. Player grants permissions to Hipster application
5. Spotify redirects back to application with authorization code
6. System exchanges code for access and refresh tokens
7. System stores tokens securely
8. System initializes Web Playback SDK
9. Player sees authenticated state

**Alternative Flows**:
- **A1**: Player denies permissions
  - Spotify redirects back with error
  - System shows authentication failed message
  - Player remains unauthenticated
- **A2**: Network error during token exchange
  - System shows connection error
  - Player can retry authentication

### UC-12: Refresh Spotify Session

**Actor**: System  
**Goal**: Maintain valid Spotify session  
**Preconditions**: Player was previously authenticated  
**Postconditions**: Session is refreshed or re-authentication is required  

**Main Success Scenario**:
1. System detects token expiration (before or during API call)
2. System attempts to refresh using refresh token
3. Spotify provides new access token
4. System updates stored credentials
5. Original operation continues

**Alternative Flows**:
- **A1**: Refresh token is invalid/expired
  - System clears stored credentials
  - System prompts player to re-authenticate
  - See UC-11: Connect to Spotify

---

## Gameplay Use Cases

### UC-21: Play Track and Make Guess

**Actor**: Player  
**Goal**: Listen to track preview and place it on timeline  
**Preconditions**: Game is in progress, player's turn  
**Postconditions**: Track is placed and scored  

**Main Success Scenario**:
1. System displays current player indicator
2. System fetches random track based on theme settings
3. System shows track information (title, artist) without album cover
4. System plays 30-second preview automatically
5. Player listens to preview
6. Player drags track card to desired position on their timeline
7. System validates placement chronologically
8. If correct:
   - System awards token and points
   - System reveals album cover
   - System shows success feedback
   - System automatically advances to next player after 4 seconds
9. If incorrect:
   - System shows correct placement position
   - System reveals album cover
   - Player clicks "Continue" to proceed
   - System advances to next player

**Alternative Flows**:
- **A1**: Audio fails to play
  - System shows audio error message
  - Player can still make placement based on track information
- **A2**: Player requests to replay audio
  - System restarts 30-second preview
- **A3**: Network error fetching track
  - System retries request
  - If retry fails, system shows error and allows manual advance

### UC-22: Win Game

**Actor**: Player  
**Goal**: Achieve victory conditions  
**Preconditions**: Game is in progress  
**Postconditions**: Game ends with winner declared  

**Main Success Scenario**:
1. Player places track correctly
2. System checks win conditions:
   - Player reaches target number of correct songs (5, 8, or 10)
   - OR Maximum rounds completed
3. System determines winner based on:
   - Primary: Number of correct tracks (timeline length)
   - Tiebreaker 1: Number of tokens
   - Tiebreaker 2: Total score points
4. System displays game results screen
5. System shows winner and final statistics
6. System offers option to play again

**Alternative Flows**:
- **A1**: Multiple players reach target simultaneously
  - System applies tiebreaker rules
  - Winner is determined by tokens, then score

### UC-23: View Timeline

**Actor**: Player  
**Goal**: See current chronological arrangement of tracks  
**Preconditions**: Player has placed at least one track  
**Postconditions**: Timeline is displayed clearly  

**Main Success Scenario**:
1. Player views their timeline section
2. System displays tracks in chronological order
3. For each correctly placed track:
   - Album cover is visible
   - Track name and artist shown
   - Year is displayed
4. Timeline shows visual indicators for:
   - Correct placement (revealed album covers)
   - Chronological flow
   - Number of tracks

**Extensions**:
- **E1**: Player has no tracks yet
  - Timeline shows empty state with placement hints

---

## Token System Use Cases

### UC-31: Earn Bonus Token

**Actor**: Player  
**Goal**: Receive bonus token for special achievements  
**Preconditions**: Player makes correct placement  
**Postconditions**: Player receives additional token  

**Main Success Scenario**:
1. Player places track correctly
2. System awards standard token for correct placement
3. System checks for bonus token conditions:
   - **Exact Decade**: Track placement creates exact decade sequence
   - **Three in a Row**: Player gets three consecutive correct placements
   - **Timeline Milestone**: Reaches 3, 5, or 8 correct tracks
4. If bonus condition met:
   - System awards additional token
   - System shows bonus token notification
   - System updates player's token count

### UC-32: Use Token Ability

**Actor**: Player  
**Goal**: Spend token for special ability  
**Preconditions**: Player has at least one token, game in progress  
**Postconditions**: Token is consumed and ability is activated  

**Main Success Scenario**:
1. Player clicks token button during their turn
2. System shows available abilities:
   - **Skip**: Discard current track and get new one
   - **Hint**: See the year of the current track
   - **Challenge**: Swap positions of two tracks in timeline
   - **Swap**: Exchange a track with another player
   - **Peek**: Briefly see album cover before placing
3. Player selects desired ability
4. System validates player has sufficient tokens
5. System deducts one token
6. System executes ability:

**Ability Details**:
- **Skip**: System discards current track, fetches new random track
- **Hint**: System displays year in popup dialog
- **Challenge**: System allows player to reorder their timeline
- **Swap**: System shows interface to exchange tracks with opponents
- **Peek**: System briefly shows album cover (3 seconds)

**Alternative Flows**:
- **A1**: Player has no tokens
  - System shows "insufficient tokens" message
  - No ability is activated

### UC-33: Challenge Timeline Arrangement

**Actor**: Player  
**Goal**: Rearrange timeline using challenge token  
**Preconditions**: Player has tokens and at least 2 tracks in timeline  
**Postconditions**: Timeline is reordered correctly  

**Main Success Scenario**:
1. Player uses challenge token ability
2. System enables timeline editing mode
3. Player drags tracks to reorder positions
4. System validates new arrangement is chronologically correct
5. If valid:
   - System saves new timeline order
   - System updates display
6. If invalid:
   - System shows error message
   - Player can retry or cancel
7. System exits editing mode

---

## Settings & Configuration Use Cases

### UC-41: Change Language

**Actor**: Player  
**Goal**: Switch application language  
**Preconditions**: Application is running  
**Postconditions**: UI is displayed in selected language  

**Main Success Scenario**:
1. Player navigates to settings page
2. Player selects language from available options:
   - English
   - Nederlands (Dutch)
   - Français (French)
   - Deutsch (German)
3. System immediately updates all UI text
4. System saves language preference
5. Language persists across sessions

### UC-42: Manage Account

**Actor**: Player  
**Goal**: View and manage Spotify connection  
**Preconditions**: Application is running  
**Postconditions**: Account status is updated  

**Main Success Scenario**:
1. Player navigates to settings page
2. Player views current Spotify connection status
3. Player can perform actions:
   - **Disconnect**: Clear Spotify authentication
   - **Reconnect**: Initiate new authentication flow
   - **View Profile**: See connected Spotify account info
4. System updates authentication state accordingly

---

## Progressive Web App Use Cases

### UC-51: Install as App

**Actor**: Player  
**Goal**: Install Hipster as standalone app  
**Preconditions**: Browser supports PWA installation  
**Postconditions**: App is installed on device  

**Main Success Scenario**:
1. Browser detects PWA installability
2. Browser shows "Add to Home Screen" prompt
3. Player accepts installation
4. System registers service worker
5. System caches essential resources
6. App icon appears on device home screen
7. Player can launch as standalone app

### UC-52: Play Offline (Limited)

**Actor**: Player  
**Goal**: Access app without internet connection  
**Preconditions**: App was previously loaded and cached  
**Postconditions**: Limited functionality available offline  

**Main Success Scenario**:
1. Player opens app without internet connection
2. Service worker serves cached application shell
3. Player can access:
   - Saved game state
   - Settings and language preferences
   - Game rules and help information
4. System shows offline indicator
5. Spotify-dependent features are disabled

**Limitations**:
- Cannot fetch new tracks
- Cannot authenticate with Spotify
- Cannot play audio previews

### UC-53: Update App

**Actor**: Player  
**Goal**: Update to latest app version  
**Preconditions**: New version is available  
**Postconditions**: App is updated to latest version  

**Main Success Scenario**:
1. Service worker detects new version
2. System downloads updated resources in background
3. System shows update notification to player
4. Player accepts update
5. System applies new version
6. System refreshes app with latest features

---

## Non-Functional Requirements

### Performance Requirements
- **Game Load Time**: Application loads within 3 seconds on 3G connection
- **Track Fetch Time**: New tracks load within 2 seconds
- **Audio Start Time**: Preview playback begins within 1 second
- **UI Responsiveness**: All interactions respond within 200ms

### Usability Requirements
- **Accessibility**: WCAG 2.1 AA compliance for screen readers and keyboard navigation
- **Mobile First**: Optimized for mobile devices 320px and up
- **Touch Friendly**: Minimum 44px touch targets
- **Intuitive UI**: New players understand gameplay without tutorial

### Compatibility Requirements
- **Browsers**: Chrome 90+, Safari 14+, Firefox 90+, Edge 90+
- **Devices**: iOS 12+, Android 8+, Desktop browsers
- **Network**: Functional on 3G connections, enhanced on WiFi
- **Storage**: Maximum 50MB local storage usage

### Security Requirements
- **Data Privacy**: No personal data stored except Spotify tokens
- **Token Security**: Spotify tokens encrypted in local storage
- **HTTPS Only**: All external communications over secure connections
- **Input Validation**: All user inputs sanitized and validated

### Reliability Requirements
- **Uptime**: 99.5% availability (dependent on GitHub Pages)
- **Error Recovery**: Graceful degradation when Spotify unavailable
- **State Persistence**: Game state survives browser refresh/restart
- **Cross-Session**: Resume functionality across multiple sessions