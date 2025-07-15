import CryptoJS from 'crypto-js'
import type { Track, SpotifyAuthState, SpotifyRecommendationsResponse, SpotifySearchResponse, Theme } from '@/types'

// Spotify API configuration
const SPOTIFY_CLIENT_ID = '67125c0389b247c1b3b221ff4a5fb2ef' // Replace with your Spotify Client ID
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/Hipster/`
const SPOTIFY_SCOPES = 'user-read-private user-read-email'

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

    if (error) {
      console.error('Spotify auth error:', error)
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

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.authState.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token invalid, try refresh
        if (await this.refreshAccessToken()) {
          return this.apiRequest(endpoint)
        }
      }
      throw new Error(`Spotify API error: ${response.status}`)
    }

    return response.json()
  }

  // Get recommendations based on theme
  async getRecommendations(theme?: Theme, limit: number = 50): Promise<Track[]> {
    try {
      let endpoint = '/recommendations?limit=' + limit
      
      if (theme) {
        const genreMap: Record<Theme, string[]> = {
          '90s': ['pop', 'rock', 'hip-hop'],
          'guilty-pleasures': ['pop', 'dance'],
          'schlager': ['pop', 'country'],
          'tiktok': ['pop', 'hip-hop', 'electronic'],
          'rock': ['rock', 'alternative', 'metal'],
          'pop': ['pop'],
          'hip-hop': ['hip-hop', 'rap'],
          'electronic': ['electronic', 'techno', 'house'],
          'indie': ['indie', 'alternative'],
          'country': ['country']
        }
        
        const genres = genreMap[theme] || ['pop']
        endpoint += '&seed_genres=' + genres.join(',')
        
        // Add year filters for specific themes
        if (theme === '90s') {
          endpoint += '&target_year=1995&min_year=1990&max_year=1999'
        }
      } else {
        // Default seeds
        endpoint += '&seed_genres=pop,rock,hip-hop'
      }

      const data: SpotifyRecommendationsResponse = await this.apiRequest(endpoint)
      
      // Filter tracks with preview URLs and add year information
      return data.tracks
        .filter(track => track.preview_url)
        .map(track => ({
          ...track,
          year: new Date(track.album.release_date).getFullYear(),
          images: track.album.images
        }))
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return []
    }
  }

  // Search for tracks
  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    try {
      const encodedQuery = encodeURIComponent(query)
      const endpoint = `/search?q=${encodedQuery}&type=track&limit=${limit}`
      
      const data: SpotifySearchResponse = await this.apiRequest(endpoint)
      
      return data.tracks.items
        .filter(track => track.preview_url)
        .map(track => ({
          ...track,
          year: new Date(track.album.release_date).getFullYear(),
          images: track.album.images
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
