import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music } from 'lucide-react-native';
import { useState } from 'react';
import { spotifyService } from '@/services/spotify';

interface SpotifyLoginProps {
  onLoginSuccess: () => void;
}

export default function SpotifyLogin({ onLoginSuccess }: SpotifyLoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const success = await spotifyService.authenticate();
    setIsLoading(false);
    
    if (success) {
      onLoginSuccess();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1DB954', '#191414']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Music size={80} color="#FFFFFF" />
          <Text style={styles.title}>Hitster Quiz</Text>
          <Text style={styles.subtitle}>Muziek Trivia Game</Text>
          
          <Text style={styles.description}>
            Verbind met Spotify om muziekfragmenten te kunnen afspelen
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#191414" />
            ) : (
              <Text style={styles.loginButtonText}>
                Inloggen met Spotify
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            Je hebt een Spotify account nodig om het spel te kunnen spelen
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#B3B3B3',
    marginTop: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 40,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#191414',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
});