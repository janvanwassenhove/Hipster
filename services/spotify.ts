import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpotifyTrack } from '@/types/game';

// TODO: Replace with your actual Spotify Client ID from https://developer.spotify.com/dashboard
const CLIENT_ID = '67125c0389b247c1b3b221ff4a5fb2ef'; 

// Generate redirect URI for web app
const getRedirectUri = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    
    // Always use the current origin for the redirect
    if (hostname === 'localhost') {
      return `${protocol}//${hostname}:${port}/spotify-auth`;
    }
    
    // For production deployment (GitHub Pages, Netlify, etc.)
    const basePath = window.location.pathname.replace(/\/$/, ''); // Remove trailing slash
    if (basePath && basePath !== '') {
      return `${protocol}//${hostname}${basePath}/spotify-auth`;
    } else {
      return `${protocol}//${hostname}/spotify-auth`;
    }
  }
  
  return 'https://janvanwassenhove.github.io/hipster/spotify-auth';
};

const SCOPES = ['user-read-private', 'user-read-email'];

// Log the redirect URI for debugging
console.log('Spotify Redirect URI:', getRedirectUri());

// PKCE helper functions for Authorization Code flow
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const spotifyAuth = {
  getAuthUrl: async () => {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];
    
    // Generate PKCE parameters
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(16);
    
    // Store PKCE parameters for later use
    localStorage.setItem('spotify_code_verifier', codeVerifier);
    localStorage.setItem('spotify_state', state);
    
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code', // Changed from 'token' to 'code'
      redirect_uri: getRedirectUri(),
      scope: scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: state,
      show_dialog: 'true'
    });
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  },
  
  handleCallback: async () => {
    // Handle the OAuth callback with authorization code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      console.error('Spotify authorization error:', error);
      return null;
    }
    
    if (!code || !state) {
      console.error('No authorization code or state received');
      return null;
    }
    
    // Verify state parameter
    const storedState = localStorage.getItem('spotify_state');
    if (state !== storedState) {
      console.error('State parameter mismatch');
      return null;
    }
    
    // Exchange authorization code for access token
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      console.error('No code verifier found');
      return null;
    }
    
    try {
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: getRedirectUri(),
          client_id: CLIENT_ID,
          code_verifier: codeVerifier,
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Token exchange failed:', errorData);
        return null;
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      if (accessToken) {
        localStorage.setItem('spotify_access_token', accessToken);
        // Clean up PKCE parameters
        localStorage.removeItem('spotify_code_verifier');
        localStorage.removeItem('spotify_state');
        // Clear the URL parameters
        window.history.replaceState(null, '', window.location.pathname);
        return accessToken;
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
    
    return null;
  }
};

class SpotifyService {
  private accessToken: string | null = null;

  async authenticate(): Promise<boolean> {
    try {
      // Check if we already have a token from OAuth callback
      const tokenFromCallback = await spotifyAuth.handleCallback();
      if (tokenFromCallback) {
        this.accessToken = tokenFromCallback;
        return true;
      }

      // Check for stored token
      const storedToken = await this.getStoredToken();
      if (storedToken) {
        return true;
      }

      // Redirect to Spotify authorization
      const authUrl = await spotifyAuth.getAuthUrl();
      window.location.href = authUrl;
      return false; // Will redirect, so this won't be reached
    } catch (error) {
      console.error('Spotify authentication error:', error);
      alert('Failed to authenticate with Spotify. Please try again.');
      return false;
    }
  }

  async getStoredToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    
    // Try localStorage first (web)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('spotify_access_token');
      if (stored) {
        this.accessToken = stored;
        return stored;
      }
    }
    
    // Fallback to AsyncStorage
    const stored = await AsyncStorage.getItem('spotify_token');
    if (stored) {
      this.accessToken = stored;
      return stored;
    }
    return null;
  }

  async searchTracks(query: string = '', limit: number = 50): Promise<SpotifyTrack[]> {
    const token = await this.getStoredToken();
    if (!token) throw new Error('No Spotify token available');

    const searchQuery = query || 'year:1960-2024';
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${limit}&market=US`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tracks from Spotify');
    }

    const data = await response.json();
    return data.tracks.items.filter((track: SpotifyTrack) => track.preview_url);
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const token = await this.getStoredToken();
    if (!token) throw new Error('No Spotify token available');

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch playlist tracks');
    }

    const data = await response.json();
    return data.items
      .map((item: any) => item.track)
      .filter((track: SpotifyTrack) => track.preview_url);
  }

  async getRandomTrack(theme: string = 'all'): Promise<SpotifyTrack | null> {
    try {
      let tracks: SpotifyTrack[] = [];
      
      switch (theme) {
        case '90s':
          tracks = await this.searchTracks('year:1990-1999');
          break;
        case '2000s':
          tracks = await this.searchTracks('year:2000-2009');
          break;
        case 'pop':
          tracks = await this.searchTracks('genre:pop');
          break;
        case 'rock':
          tracks = await this.searchTracks('genre:rock');
          break;
        default:
          tracks = await this.searchTracks('year:1960-2024');
      }

      if (tracks.length === 0) return null;
      return tracks[Math.floor(Math.random() * tracks.length)];
    } catch (error) {
      console.error('Error fetching random track:', error);
      return null;
    }
  }
}

export const spotifyService = new SpotifyService();