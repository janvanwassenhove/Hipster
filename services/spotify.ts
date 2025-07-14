import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpotifyTrack } from '@/types/game';

// TODO: Replace with your actual Spotify Client ID from https://developer.spotify.com/dashboard
const CLIENT_ID = 'your_spotify_client_id'; 

// Generate redirect URI for your app
const REDIRECT_URI = AuthSession.makeRedirectUri({ 
  scheme: 'myapp', // This should match the scheme in your app.json
  path: 'spotify-auth'
});

const SCOPES = ['user-read-private', 'user-read-email'];

// Log the redirect URI for debugging
console.log('Spotify Redirect URI:', REDIRECT_URI);

class SpotifyService {
  private accessToken: string | null = null;

  async authenticate(): Promise<boolean> {
    try {
      // Check if CLIENT_ID is still the placeholder
      if (CLIENT_ID === 'your_spotify_client_id') {
        console.error('Spotify CLIENT_ID not configured. Please set your actual Spotify Client ID.');
        alert('Spotify configuration error: Client ID not set. Check the console for details.');
        return false;
      }

      const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        scopes: SCOPES,
        usePKCE: false,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Token,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      });

      if (result.type === 'success') {
        this.accessToken = result.params.access_token;
        await AsyncStorage.setItem('spotify_token', this.accessToken);
        return true;
      } else if (result.type === 'error') {
        console.error('Spotify authentication error:', result.error);
        alert(`Spotify login failed: ${result.error?.message || 'Unknown error'}`);
      }
      return false;
    } catch (error) {
      console.error('Spotify authentication error:', error);
      alert('Failed to authenticate with Spotify. Please try again.');
      return false;
    }
  }

  async getStoredToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    
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