import CryptoJS from 'crypto-js'
import type { Track, SpotifyAuthState, SpotifyRecommendationsResponse, SpotifySearchResponse, Theme } from '@/types'

// Spotify API configuration
const SPOTIFY_CLIENT_ID = '67125c0389b247c1b3b221ff4a5fb2ef' // Replace with your Spotify Client ID
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/Hipster/`
const SPOTIFY_SCOPES = 'user-read-private user-read-email user-top-read user-library-read'

class SpotifyService {
  private authState: SpotifyAuthState = {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false
  }

  constructor() {
    this.loadAuthState()
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

    return response.json()
  }

  // Get recommendations based on theme
  async getRecommendations(theme?: Theme, limit: number = 50): Promise<Track[]> {
    try {
      // First, try to get available genres
      const availableGenres = await this.getAvailableGenres()
      
      let endpoint = '/recommendations?limit=' + Math.min(limit, 100) // Spotify max is 100
      
      if (theme && availableGenres.length > 0) {
        const genreMap: Record<Theme, string[]> = {
          '90s': ['pop', 'rock', 'dance', 'disco'],
          'guilty-pleasures': ['pop', 'dance', 'disco'],
          'schlager': ['pop', 'country', 'folk'],
          'tiktok': ['pop', 'hip-hop', 'electronic', 'dance'],
          'rock': ['rock', 'alternative', 'metal', 'indie'],
          'pop': ['pop', 'dance'],
          'hip-hop': ['hip-hop', 'rap'],
          'electronic': ['electronic', 'techno', 'house', 'dance'],
          'indie': ['indie', 'alternative', 'rock'],
          'country': ['country', 'folk']
        }
        
        const preferredGenres = genreMap[theme] || ['pop']
        // Filter to only use available genres
        const validGenres = preferredGenres.filter(genre => availableGenres.includes(genre))
        
        if (validGenres.length > 0) {
          // Use up to 3 genres for seed (Spotify limit is 5 total seeds)
          const seedGenres = validGenres.slice(0, 3)
          endpoint += '&seed_genres=' + seedGenres.join(',')
          
          // Add year filters for specific themes
          if (theme === '90s') {
            endpoint += '&min_year=1990&max_year=1999'
          }
        } else {
          // Fallback to basic genres
          endpoint += '&seed_genres=pop'
        }
      } else {
        // Default fallback - use simple approach
        endpoint += '&seed_genres=pop'
      }

      console.log('Recommendations endpoint:', endpoint)
      const data: SpotifyRecommendationsResponse = await this.apiRequest(endpoint)
      
      if (!data.tracks || data.tracks.length === 0) {
        console.warn('No tracks returned from recommendations, trying fallback')
        return await this.getFallbackTracks(limit)
      }
      
      // Filter tracks with preview URLs and add year information
      const tracksWithPreviews = data.tracks
        .filter(track => track.preview_url)
        .map(track => ({
          ...track,
          year: new Date(track.album.release_date).getFullYear(),
          images: track.album.images || track.images || []
        }))

      if (tracksWithPreviews.length === 0) {
        console.warn('No tracks with previews found, trying fallback')
        return await this.getFallbackTracks(limit)
      }

      return tracksWithPreviews
    } catch (error) {
      console.error('Error getting recommendations:', error)
      
      // Try fallback approach
      try {
        return await this.getFallbackTracks(limit)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        return []
      }
    }
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

  // Fallback method using search instead of recommendations
  private async getFallbackTracks(limit: number = 20): Promise<Track[]> {
    try {
      console.log('Trying fallback: search queries')
      
      // Use popular search terms to get tracks
      const searchQueries = [
        'year:2020-2024',
        'year:2015-2019', 
        'year:2010-2014',
        'year:2000-2009',
        'year:1990-1999'
      ]
      
      const allTracks: Track[] = []
      
      for (const query of searchQueries) {
        if (allTracks.length >= limit) break
        
        try {
          const tracks = await this.searchTracks(query, Math.min(10, limit - allTracks.length))
          allTracks.push(...tracks)
        } catch (error) {
          console.warn('Search query failed:', query, error)
        }
      }
      
      // If search didn't work, try featured playlists
      if (allTracks.length === 0) {
        console.log('Trying fallback: featured playlists')
        const playlistTracks = await this.getTracksFromFeaturedPlaylists(limit)
        allTracks.push(...playlistTracks)
      }
      
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
    try {
      const encodedQuery = encodeURIComponent(query)
      const endpoint = `/search?q=${encodedQuery}&type=track&limit=${Math.min(limit, 50)}&market=US`
      
      console.log('Search endpoint:', endpoint)
      const data: SpotifySearchResponse = await this.apiRequest(endpoint)
      
      if (!data.tracks || !data.tracks.items) {
        console.warn('No tracks found in search response')
        return []
      }
      
      return data.tracks.items
        .filter(track => track.preview_url && track.album && track.album.release_date)
        .map(track => ({
          ...track,
          year: new Date(track.album.release_date).getFullYear(),
          images: track.album.images || track.images || []
        }))
    } catch (error) {
      console.error('Error searching tracks:', error)
      return []
    }
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

  logout(): void {
    this.authState = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false
    }
    this.saveAuthState()
    localStorage.removeItem('spotify_code_verifier')
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
}

export const spotifyService = new SpotifyService()
