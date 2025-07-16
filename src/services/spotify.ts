import CryptoJS from 'crypto-js'
import type { Track, SpotifyAuthState, SpotifyRecommendationsResponse, SpotifySearchResponse, Theme } from '@/types'
import songsData from '@/data/songs_by_category.json'

// Spotify API configuration
const SPOTIFY_CLIENT_ID = '67125c0389b247c1b3b221ff4a5fb2ef' // Replace with your Spotify Client ID
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/Hipster/`
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-top-read user-library-read streaming user-read-playback-state user-modify-playback-state'

interface SongData {
  jaar: number
  uitvoerder: string
  titel: string
}

interface SpotifyPlayer {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(event: string, callback: (...args: any[]) => void): void
  removeListener(event: string, callback?: (...args: any[]) => void): void
  getCurrentState(): Promise<any>
  setName(name: string): Promise<void>
  getVolume(): Promise<number>
  setVolume(volume: number): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  togglePlay(): Promise<void>
  seek(position: number): Promise<void>
  previousTrack(): Promise<void>
  nextTrack(): Promise<void>
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (callback: (token: string) => void) => void
        volume?: number
      }) => SpotifyPlayer
    }
  }
}

class SpotifyService {
  private authState: SpotifyAuthState = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false
  }
  
  private player: SpotifyPlayer | null = null
  private deviceId: string | null = null
  private isSDKReady = false
  private currentTrackUri: string | null = null

  constructor() {
    this.loadAuthState()
    this.initializeWebPlaybackSDK()
  }

  // Generate PKCE code verifier and challenge
  private generateCodeVerifier(): string {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64url)
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  // Start Spotify OAuth flow with PKCE
  async initiateLogin(): Promise<void> {
    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(codeVerifier)
    
    // Store code verifier in localStorage for later use
    localStorage.setItem('spotify_code_verifier', codeVerifier)

    console.log('Spotify redirect URI:', SPOTIFY_REDIRECT_URI)

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: SPOTIFY_SCOPES,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: Math.random().toString(36).substring(7)
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }

  // Handle OAuth callback
  async handleCallback(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')

    if (error) {
      console.error('Spotify auth error:', error, errorDescription)
      
      // Show user-friendly error message
      if (error === 'invalid_client') {
        alert(`Spotify configuration error: Invalid redirect URI. 
Please make sure ${SPOTIFY_REDIRECT_URI} is added to your Spotify app settings.`)
      } else {
        alert(`Spotify login failed: ${errorDescription || error}`)
      }
      
      return false
    }

    if (!code) {
      return false
    }

    const codeVerifier = localStorage.getItem('spotify_code_verifier')
    if (!codeVerifier) {
      console.error('No code verifier found')
      return false
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          code_verifier: codeVerifier,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const data = await response.json()
      
      this.authState = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        isAuthenticated: true
      }

      this.saveAuthState()
      localStorage.removeItem('spotify_code_verifier')

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      
      return true
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return false
    }
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      return false
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.authState.refreshToken,
          client_id: SPOTIFY_CLIENT_ID,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      
      this.authState.accessToken = data.access_token
      this.authState.expiresAt = Date.now() + (data.expires_in * 1000)
      
      if (data.refresh_token) {
        this.authState.refreshToken = data.refresh_token
      }

      this.saveAuthState()
      return true
    } catch (error) {
      console.error('Error refreshing token:', error)
      this.logout()
      return false
    }
  }

  // Check if token is valid and refresh if needed
  private async ensureValidToken(): Promise<boolean> {
    if (!this.authState.accessToken) {
      return false
    }

    // Check if token expires in the next 5 minutes
    if (this.authState.expiresAt && Date.now() >= this.authState.expiresAt - 300000) {
      return await this.refreshAccessToken()
    }

    return true
  }

  // Make authenticated API request
  private async apiRequest(endpoint: string): Promise<any> {
    if (!await this.ensureValidToken()) {
      throw new Error('No valid access token')
    }

    console.log('Making Spotify API request to:', endpoint)

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.authState.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify API error:', response.status, errorText)
      
      if (response.status === 401) {
        // Token invalid, try refresh
        if (await this.refreshAccessToken()) {
          return this.apiRequest(endpoint)
        }
      }
      throw new Error(`Spotify API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Spotify API response successful, data keys:', Object.keys(data))
    return data
  }

  // Convert SongData to Track format
  private convertSongToTrack(song: SongData): Track {
    const artistColors = [
      '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#F97316', '#EC4899', '#6366F1', '#84CC16', '#06B6D4'
    ]
    const colorIndex = song.uitvoerder.length % artistColors.length
    const color = artistColors[colorIndex]

    return {
      id: `song-${song.jaar}-${song.uitvoerder.replace(/\s+/g, '-')}-${song.titel.replace(/\s+/g, '-')}`,
      name: song.titel,
      artists: [{
        id: `artist-${song.uitvoerder.replace(/\s+/g, '-')}`,
        name: song.uitvoerder,
        external_urls: { spotify: '' }
      }],
      album: {
        id: `album-${song.jaar}-${song.titel.replace(/\s+/g, '-')}`,
        name: song.titel,
        release_date: `${song.jaar}-01-01`,
        release_date_precision: 'year',
        images: [
          { url: `https://via.placeholder.com/300x300/${color.slice(1)}/FFFFFF?text=${encodeURIComponent(song.uitvoerder)}`, height: 300, width: 300 },
          { url: `https://via.placeholder.com/64x64/${color.slice(1)}/FFFFFF?text=${encodeURIComponent(song.uitvoerder)}`, height: 64, width: 64 }
        ]
      },
      preview_url: null, // Will be filled if we can get real Spotify data
      external_urls: { spotify: '' },
      release_date: `${song.jaar}-01-01`,
      year: song.jaar,
      revealed: false, // Album cover hidden until final placement
      images: [
        { url: `https://via.placeholder.com/300x300/${color.slice(1)}/FFFFFF?text=${encodeURIComponent(song.uitvoerder)}`, height: 300, width: 300 },
        { url: `https://via.placeholder.com/64x64/${color.slice(1)}/FFFFFF?text=${encodeURIComponent(song.uitvoerder)}`, height: 64, width: 64 }
      ]
    }
  }

  // Get tracks from JSON data based on theme
  private getTracksFromJson(theme?: Theme, limit: number = 50): Track[] {
    console.log('Getting tracks from JSON for theme:', theme)
    
    let categoryData: SongData[] = []
    
    // Map themes to JSON categories
    const themeMapping: Record<Theme, keyof typeof songsData> = {
      '90s': 'classics', // Use classics for 90s as closest match
      'guilty-pleasures': 'guilty-pleasures',
      'schlager': 'vlaams', // Use vlaams for schlager
      'tiktok': 'popular', // Use popular for tiktok
      'rock': 'pop-rock',
      'pop': 'popular',
      'hip-hop': 'popular', // Use popular for hip-hop
      'electronic': 'popular', // Use popular for electronic
      'indie': 'pop-rock', // Use pop-rock for indie
      'country': 'classics' // Use classics for country
    }
    
    if (theme && themeMapping[theme]) {
      const category = themeMapping[theme]
      categoryData = songsData[category] || []
      console.log(`Found ${categoryData.length} songs in category: ${category}`)
    } else {
      // Mix from all categories
      const allCategories = Object.values(songsData).flat()
      categoryData = allCategories
      console.log(`Using all categories, found ${categoryData.length} total songs`)
    }
    
    if (categoryData.length === 0) {
      console.warn('No songs found for theme, falling back to popular')
      categoryData = songsData.popular || []
    }
    
    // Shuffle and limit
    const shuffled = [...categoryData].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, limit)
    
    console.log(`Selected ${selected.length} songs for theme: ${theme}`)
    
    return selected.map(song => this.convertSongToTrack(song))
  }

  // Enhanced search function to try to get real Spotify data
  private async tryGetSpotifyPreview(track: Track): Promise<Track> {
    console.log(`Trying to get Spotify preview for: ${track.name} by ${track.artists[0].name}`)
    
    if (!this.isAuthenticated()) {
      console.log('Not authenticated, returning original track')
      return track
    }

    try {
      // Search for the track on Spotify to get preview URL
      const query = `track:"${track.name}" artist:"${track.artists[0].name}"`
      const encodedQuery = encodeURIComponent(query)
      console.log(`Spotify search query: ${query}`)
      
      const searchResponse = await this.apiRequest(`/search?q=${encodedQuery}&type=track&limit=1`)
      console.log(`Search response for "${track.name}":`, searchResponse?.tracks?.items?.length || 0, 'results')
      
      if (searchResponse.tracks?.items?.length > 0) {
        const spotifyTrack = searchResponse.tracks.items[0]
        console.log(`Found track "${spotifyTrack.name}" by ${spotifyTrack.artists[0]?.name}`)
        console.log(`Preview URL available:`, !!spotifyTrack.preview_url)
        
        if (spotifyTrack.preview_url || spotifyTrack.uri) {
          console.log(`✅ Found Spotify data for: ${track.name} by ${track.artists[0].name}`)
          return {
            ...track,
            preview_url: spotifyTrack.preview_url,
            external_urls: spotifyTrack.external_urls,
            images: spotifyTrack.album?.images || track.images,
            uri: spotifyTrack.uri // Add Spotify URI
          }
        } else {
          console.log(`❌ No preview URL for: ${track.name} by ${track.artists[0].name}`)
        }
      } else {
        console.log(`❌ No search results for: ${track.name} by ${track.artists[0].name}`)
      }
    } catch (error) {
      console.warn(`Could not get Spotify data for: ${track.name}`, error)
    }
    
    return track
  }

  // Get recommendations based on theme
  async getRecommendations(theme?: Theme, limit: number = 50): Promise<Track[]> {
    console.log('Getting recommendations for theme:', theme, 'limit:', limit)
    console.log('Authentication state:', this.isAuthenticated())
    console.log('Access token exists:', !!this.authState.accessToken)
    
    // If user is authenticated, try to get tracks directly from Spotify first
    if (this.isAuthenticated()) {
      console.log('User authenticated, trying to get tracks directly from Spotify')
      
      try {
        const spotifyTracks = await this.getTracksFromSpotify(Math.min(limit, 30))
        
        if (spotifyTracks.length > 0) {
          console.log(`✅ Got ${spotifyTracks.length} tracks with preview URLs from Spotify`)
          
          // If we have enough Spotify tracks, return them
          if (spotifyTracks.length >= limit * 0.5) { // At least 50% of requested
            return spotifyTracks.slice(0, limit)
          }
          
          // Otherwise, supplement with JSON tracks
          const jsonTracks = this.getTracksFromJson(theme, limit - spotifyTracks.length)
          console.log(`Supplementing with ${jsonTracks.length} tracks from JSON`)
          return [...spotifyTracks, ...jsonTracks]
        }
      } catch (error) {
        console.warn('Failed to get tracks from Spotify, falling back to JSON + enhancement', error)
      }
      
      // Fallback: Try to enhance JSON tracks with Spotify data
      console.log('Falling back to JSON tracks with Spotify enhancement')
      const jsonTracks = this.getTracksFromJson(theme, limit)
      console.log(`Got ${jsonTracks.length} tracks from JSON`)
      
      console.log(`First track to enhance: ${jsonTracks[0]?.name} by ${jsonTracks[0]?.artists[0]?.name}`)
      
      // Enhance first 10 tracks with Spotify data (to avoid too many API calls)
      const enhancedTracks = await Promise.allSettled(
        jsonTracks.slice(0, 10).map(track => this.tryGetSpotifyPreview(track))
      )
      
      const enhancedResults = enhancedTracks.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          console.warn(`Failed to enhance track ${index}:`, result.reason)
          return jsonTracks[index]
        }
      })
      
      // Combine enhanced tracks with remaining unenhanced tracks
      return [...enhancedResults, ...jsonTracks.slice(10)]
    }
    
    // Always use JSON data as primary source
    const jsonTracks = this.getTracksFromJson(theme, limit)
    console.log(`Returning ${jsonTracks.length} tracks from JSON data`)
    return jsonTracks
  }

  // Get available genres from Spotify
  private async getAvailableGenres(): Promise<string[]> {
    try {
      const data = await this.apiRequest('/recommendations/available-genre-seeds')
      return data.genres || []
    } catch (error) {
      console.error('Error getting available genres:', error)
      // Return common genres as fallback
      return ['pop', 'rock', 'hip-hop', 'electronic', 'country', 'jazz', 'classical', 'alternative', 'indie', 'dance']
    }
  }

  // Fallback method using simple search queries
  private async getFallbackTracks(limit: number = 20): Promise<Track[]> {
    try {
      console.log('Trying fallback: simple search queries')
      
      // Use simple, popular search terms that should always return results
      const searchQueries = [
        'the',
        'love',
        'time',
        'song',
        'night',
        'day',
        'you',
        'me',
        'one',
        'way'
      ]
      
      const allTracks: Track[] = []
      
      for (const query of searchQueries) {
        if (allTracks.length >= limit) break
        
        try {
          const tracks = await this.searchTracks(query, Math.min(5, limit - allTracks.length))
          if (tracks.length > 0) {
            allTracks.push(...tracks)
            console.log(`Found ${tracks.length} tracks for query: ${query}`)
          }
        } catch (error) {
          console.warn('Search query failed:', query, error)
        }
      }
      
      // If still no tracks, try very basic queries
      if (allTracks.length === 0) {
        console.log('Trying even simpler queries')
        const basicQueries = ['a', 'e', 'i', 'o', 'u']
        
        for (const query of basicQueries) {
          if (allTracks.length >= limit) break
          
          try {
            const tracks = await this.searchTracks(query, 5)
            if (tracks.length > 0) {
              allTracks.push(...tracks)
              console.log(`Found ${tracks.length} tracks for basic query: ${query}`)
              break // Stop after first successful query
            }
          } catch (error) {
            console.warn('Basic search query failed:', query, error)
          }
        }
      }
      
      // If still no tracks, return empty array
      if (allTracks.length === 0) {
        console.warn('All Spotify API calls failed, no tracks available')
        return []
      }
      
      console.log(`Total tracks found in fallback: ${allTracks.length}`)
      
      // Shuffle and return requested amount
      const shuffled = allTracks.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, limit)
    } catch (error) {
      console.error('All fallback methods failed:', error)
      return []
    }
  }

  // Get tracks from featured playlists as another fallback
  private async getTracksFromFeaturedPlaylists(limit: number = 20): Promise<Track[]> {
    try {
      // Get featured playlists
      const playlistsData = await this.apiRequest('/browse/featured-playlists?limit=10')
      
      if (!playlistsData.playlists || !playlistsData.playlists.items) {
        return []
      }
      
      const allTracks: Track[] = []
      
      // Get tracks from first few playlists
      for (const playlist of playlistsData.playlists.items.slice(0, 3)) {
        if (allTracks.length >= limit) break
        
        try {
          const tracksData = await this.apiRequest(`/playlists/${playlist.id}/tracks?limit=20&market=US`)
          
          if (tracksData.items) {
            const playlistTracks = tracksData.items
              .filter((item: any) => item.track && item.track.preview_url && item.track.album)
              .map((item: any) => ({
                ...item.track,
                year: new Date(item.track.album.release_date).getFullYear(),
                revealed: false, // Album cover hidden until final placement
                images: item.track.album.images || []
              }))
            
            allTracks.push(...playlistTracks)
          }
        } catch (error) {
          console.warn('Error getting playlist tracks:', error)
        }
      }
      
      // Shuffle and return requested amount
      const shuffled = allTracks.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, limit)
    } catch (error) {
      console.error('Error getting featured playlist tracks:', error)
      return []
    }
  }

  // Search for tracks
  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    console.log('Searching tracks with query:', query)
    
    // Search in JSON data first
    const allSongs = Object.values(songsData).flat()
    const matchingSongs = allSongs.filter(song => 
      song.titel.toLowerCase().includes(query.toLowerCase()) ||
      song.uitvoerder.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit)
    
    const jsonResults = matchingSongs.map(song => this.convertSongToTrack(song))
    
    console.log(`Found ${jsonResults.length} matching tracks in JSON data`)
    
    // If authenticated and want more results, try Spotify API
    if (this.isAuthenticated() && jsonResults.length < limit) {
      try {
        const remainingLimit = limit - jsonResults.length
        const encodedQuery = encodeURIComponent(query)
        const searchResponse = await this.apiRequest(`/search?q=${encodedQuery}&type=track&limit=${remainingLimit}`)
        
        if (searchResponse.tracks?.items) {
          const spotifyTracks = searchResponse.tracks.items
            .filter((track: any) => track && track.name && track.artists)
            .map((track: any) => ({
              ...track,
              year: track.album?.release_date ? new Date(track.album.release_date).getFullYear() : new Date().getFullYear(),
              revealed: false, // Album cover hidden until final placement
              images: track.album?.images || []
            }))
          
          console.log(`Found ${spotifyTracks.length} additional tracks from Spotify API`)
          return [...jsonResults, ...spotifyTracks]
        }
      } catch (error) {
        console.warn('Spotify search failed, using only JSON results:', error)
      }
    }
    
    return jsonResults
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    try {
      return await this.apiRequest('/me')
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Auth state management
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.accessToken
  }

  // Force logout and clear authentication
  logout(): void {
    console.log('Logging out and clearing Spotify authentication')
    
    // Disconnect the player if it exists
    if (this.player) {
      this.player.disconnect()
      this.player = null
    }
    
    // Clear auth state
    this.authState = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false
    }
    
    // Clear stored data
    localStorage.removeItem('spotify_auth')
    localStorage.removeItem('spotify_code_verifier')
    
    this.deviceId = null
    this.currentTrackUri = null
    
    console.log('✅ Successfully logged out')
  }

  // Check if current token has required scopes for playback
  hasPlaybackPermissions(): boolean {
    // Since we can't directly check scopes from the token,
    // we'll try a simple API call to see if we have permissions
    return this.isAuthenticated()
  }

  // Force re-authentication with updated scopes
  async forceReauth(): Promise<void> {
    console.log('🔄 Forcing re-authentication with updated scopes')
    this.logout()
    await this.initiateLogin()
  }

  private saveAuthState(): void {
    localStorage.setItem('spotify_auth', JSON.stringify(this.authState))
  }

  private loadAuthState(): void {
    const saved = localStorage.getItem('spotify_auth')
    if (saved) {
      try {
        this.authState = JSON.parse(saved)
        
        // Check if token has expired
        if (this.authState.expiresAt && Date.now() >= this.authState.expiresAt) {
          this.logout()
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        this.logout()
      }
    }
  }

  // Get tracks directly from Spotify when authenticated (better for audio previews)
  private async getTracksFromSpotify(limit: number = 20): Promise<Track[]> {
    if (!this.isAuthenticated()) {
      return []
    }

    try {
      console.log('Getting tracks directly from Spotify search')
      
      // Use popular search terms to get tracks with preview URLs
      const searchTerms = [
        'year:2000-2020 genre:pop',
        'year:1990-2010 genre:rock', 
        'year:1980-2000 genre:dance',
        'year:2010-2024 genre:hip-hop',
        'year:1970-1990 genre:pop'
      ]
      
      const allTracks: Track[] = []
      
      for (const term of searchTerms) {
        try {
          const searchResponse = await this.apiRequest(`/search?q=${encodeURIComponent(term)}&type=track&limit=${Math.ceil(limit / searchTerms.length)}`)
          
          if (searchResponse.tracks?.items) {
            const tracks = searchResponse.tracks.items
              .filter((item: any) => item.uri && item.album) // Only tracks with URIs (for full playback)
              .map((item: any) => this.convertSpotifyTrackToTrack(item))
            
            allTracks.push(...tracks)
            console.log(`Got ${tracks.length} tracks from Spotify for term: ${term}`)
          }
        } catch (error) {
          console.warn(`Failed to search for term: ${term}`, error)
        }
      }
      
      // Shuffle and limit results
      const shuffled = allTracks.sort(() => Math.random() - 0.5)
      const limited = shuffled.slice(0, limit)
      
      console.log(`Returning ${limited.length} tracks from Spotify with preview URLs`)
      return limited
      
    } catch (error) {
      console.error('Error getting tracks from Spotify:', error)
      return []
    }
  }

  // Convert Spotify API track to our Track format
  private convertSpotifyTrackToTrack(spotifyTrack: any): Track {
    const releaseYear = spotifyTrack.album.release_date 
      ? parseInt(spotifyTrack.album.release_date.split('-')[0]) 
      : new Date().getFullYear()

    return {
      id: spotifyTrack.id,
      name: spotifyTrack.name,
      artists: spotifyTrack.artists.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        external_urls: artist.external_urls
      })),
      album: {
        id: spotifyTrack.album.id,
        name: spotifyTrack.album.name,
        release_date: spotifyTrack.album.release_date,
        release_date_precision: spotifyTrack.album.release_date_precision,
        images: spotifyTrack.album.images || []
      },
      preview_url: spotifyTrack.preview_url, // Keep for fallback
      external_urls: spotifyTrack.external_urls,
      release_date: spotifyTrack.album.release_date,
      year: releaseYear,
      revealed: false,
      images: spotifyTrack.album.images || [],
      uri: spotifyTrack.uri // Add Spotify URI for Web Playback
    }
  }

  // Initialize Spotify Web Playback SDK
  private initializeWebPlaybackSDK() {
    // Load the SDK script if not already loaded
    if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      document.body.appendChild(script)
    }

    // Set up the ready callback
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.isSDKReady = true
      console.log('Spotify Web Playback SDK ready')
      
      if (this.isAuthenticated()) {
        this.initializePlayer()
      }
    }
  }

  // Initialize the Spotify player
  private async initializePlayer() {
    if (!this.isSDKReady || !this.isAuthenticated() || this.player) {
      return
    }

    try {
      this.player = new window.Spotify.Player({
        name: 'Hitster Music Game',
        getOAuthToken: (callback) => {
          callback(this.authState.accessToken!)
        },
        volume: 0.7
      })

      // Error handling
      this.player.addListener('initialization_error', ({ message }) => {
        console.error('Spotify Player initialization error:', message)
      })

      this.player.addListener('authentication_error', ({ message }) => {
        console.error('Spotify Player authentication error:', message)
      })

      this.player.addListener('account_error', ({ message }) => {
        console.error('Spotify Player account error (Premium required):', message)
      })

      this.player.addListener('playback_error', ({ message }) => {
        console.error('Spotify Player playback error:', message)
      })

      // Ready event
      this.player.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player ready with Device ID:', device_id)
        this.deviceId = device_id
        
        // Automatically set this device as the active device
        this.setActiveDevice(device_id)
      })

      // Not ready event
      this.player.addListener('not_ready', ({ device_id }) => {
        console.log('Spotify Player device has gone offline:', device_id)
        this.deviceId = null
      })

      // Player state changed
      this.player.addListener('player_state_changed', (state) => {
        if (!state) return
        
        console.log('Player state changed:', {
          paused: state.paused,
          position: state.position,
          duration: state.duration,
          track: state.track_window.current_track?.name
        })
      })

      // Connect to the player
      const connected = await this.player.connect()
      if (connected) {
        console.log('✅ Successfully connected to Spotify Player')
      } else {
        console.error('❌ Failed to connect to Spotify Player')
      }

    } catch (error) {
      console.error('Error initializing Spotify Player:', error)
    }
  }

  // Public method to initialize player when component is ready
  async initializePlayerIfReady(): Promise<void> {
    if (this.isAuthenticated()) {
      await this.initializePlayer()
    }
  }

  // Play a track using Spotify Web API
  async playTrack(trackUri: string): Promise<boolean> {
    if (!this.isAuthenticated() || !this.deviceId) {
      console.warn('Cannot play track: not authenticated or no device available')
      console.log('Authenticated:', this.isAuthenticated())
      console.log('Device ID:', this.deviceId)
      console.log('Player ready:', this.isPlayerReady())
      return false
    }

    try {
      console.log('Playing track:', trackUri, 'on device:', this.deviceId)
      
      // Ensure we have a valid token before making the request
      if (!await this.ensureValidToken()) {
        console.error('Failed to ensure valid token')
        return false
      }

      // First, ensure this device is the active device
      console.log('Setting device as active...')
      const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authState.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [this.deviceId],
          play: false // Don't start playing yet
        })
      })

      if (!transferResponse.ok && transferResponse.status !== 204) {
        const transferError = await transferResponse.text()
        console.warn('Failed to set active device:', transferResponse.status, transferError)
        // Continue anyway - might still work
      } else {
        console.log('✅ Device set as active')
        // Wait a moment for the device transfer to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Now try to play the track
      console.log('Starting playback...')
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authState.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri]
          // Don't specify device_id here since we just set it as active
        })
      })

      console.log('Play request response status:', response.status)

      if (response.ok || response.status === 204) {
        this.currentTrackUri = trackUri
        console.log('✅ Successfully started playing track')
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to play track:', response.status, errorText)
        
        if (response.status === 401) {
          console.error('❌ Token appears to be invalid or missing permissions')
          console.error('❌ Current scopes may be insufficient - need to re-authenticate')
        }
        
        if (response.status === 403) {
          console.error('❌ Premium subscription required to play full tracks')
        }

        if (response.status === 404) {
          console.error('❌ No active device found - trying to activate Web Playback SDK device')
          // The device might not be properly activated, try alternative approach
          return await this.playTrackDirectly(trackUri)
        }
        
        return false
      }
    } catch (error) {
      console.error('Error playing track:', error)
      return false
    }
  }

  // Alternative method to play track directly through the Web Playback SDK
  private async playTrackDirectly(trackUri: string): Promise<boolean> {
    if (!this.player) {
      console.error('No player available for direct playback')
      return false
    }

    try {
      console.log('Trying direct playback through Web Playback SDK...')
      
      // Use the Web API to start playback on our specific device
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authState.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: this.deviceId,
          uris: [trackUri]
        })
      })

      if (response.ok || response.status === 204) {
        this.currentTrackUri = trackUri
        console.log('✅ Direct playback successful')
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ Direct playback failed:', response.status, errorText)
        return false
      }
    } catch (error) {
      console.error('Error in direct playback:', error)
      return false
    }
  }

  // Pause playback
  async pausePlayback(): Promise<boolean> {
    if (!this.player) return false

    try {
      await this.player.pause()
      return true
    } catch (error) {
      console.error('Error pausing playback:', error)
      return false
    }
  }

  // Resume playback
  async resumePlayback(): Promise<boolean> {
    if (!this.player) return false

    try {
      await this.player.resume()
      return true
    } catch (error) {
      console.error('Error resuming playback:', error)
      return false
    }
  }

  // Stop playback
  async stopPlayback(): Promise<boolean> {
    if (!this.isAuthenticated()) return false

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authState.accessToken}`,
        }
      })

      this.currentTrackUri = null
      return response.ok || response.status === 204
    } catch (error) {
      console.error('Error stopping playback:', error)
      return false
    }
  }

  // Get current playback state
  async getPlaybackState(): Promise<any> {
    if (!this.player) return null

    try {
      return await this.player.getCurrentState()
    } catch (error) {
      console.error('Error getting playback state:', error)
      return null
    }
  }

  // Check if player is ready
  isPlayerReady(): boolean {
    return this.isSDKReady && !!this.player && !!this.deviceId
  }

  // Get the current playing track URI
  getCurrentTrackUri(): string | null {
    return this.currentTrackUri
  }

  // Set device as active
  private async setActiveDevice(deviceId: string): Promise<boolean> {
    if (!this.isAuthenticated()) return false

    try {
      console.log('Setting device as active:', deviceId)
      
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authState.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      })

      if (response.ok || response.status === 204) {
        console.log('✅ Device set as active successfully')
        return true
      } else {
        const errorText = await response.text()
        console.warn('Failed to set active device:', response.status, errorText)
        return false
      }
    } catch (error) {
      console.error('Error setting active device:', error)
      return false
    }
  }

  // Get available devices for debugging
  async getAvailableDevices(): Promise<any> {
    if (!this.isAuthenticated()) return null

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          'Authorization': `Bearer ${this.authState.accessToken}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Available Spotify devices:', data.devices)
        return data
      } else {
        console.error('Failed to get devices:', response.status)
        return null
      }
    } catch (error) {
      console.error('Error getting devices:', error)
      return null
    }
  }
}

export const spotifyService = new SpotifyService()
