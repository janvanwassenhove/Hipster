import { View, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { GameState, Player } from '@/types/game';
import { spotifyService } from '@/services/spotify';
import SpotifyLogin from '@/components/SpotifyLogin';
import PlayerSetup from '@/components/PlayerSetup';
import GameScreen from '@/components/GameScreen';
import GameResults from '@/components/GameResults';

export default function GameTab() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    currentTrack: null,
    gameMode: 'original',
    theme: 'all',
    round: 1,
    maxRounds: 10,
    gamePhase: 'setup',
    tokenBets: [],
  });

  useEffect(() => {
    checkSpotifyLogin();
    checkForAuthError();
  }, []);

  const checkSpotifyLogin = async () => {
    const token = await spotifyService.getStoredToken();
    setIsLoggedIn(!!token);
  };

  const checkForAuthError = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      
      if (error === 'auth_failed') {
        Alert.alert('Authentication Failed', 'Spotify login was cancelled or failed. Please try again.');
        // Clear the error from URL
        window.history.replaceState(null, '', window.location.pathname);
      } else if (error === 'no_token') {
        Alert.alert('Authentication Error', 'No access token received from Spotify. Please try again.');
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleStartGame = (players: Player[], gameMode: string, theme: string) => {
    setGameState({
      ...gameState,
      players,
      gameMode: gameMode as any,
      theme,
      gamePhase: 'playing',
    });
  };

  const handleUpdateGameState = (newState: GameState) => {
    setGameState(newState);
  };

  const handleEndGame = () => {
    setGameState({
      ...gameState,
      gamePhase: 'finished',
    });
  };

  const handleResetGame = () => {
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      currentTrack: null,
      gameMode: 'original',
      theme: 'all',
      round: 1,
      maxRounds: 10,
      gamePhase: 'setup',
      tokenBets: [],
    });
  };

  if (!isLoggedIn) {
    return <SpotifyLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (gameState.gamePhase === 'setup') {
    return <PlayerSetup onStartGame={handleStartGame} />;
  }

  if (gameState.gamePhase === 'finished') {
    return (
      <GameResults
        players={gameState.players}
        onPlayAgain={handleResetGame}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GameScreen
        gameState={gameState}
        onUpdateGameState={handleUpdateGameState}
        onEndGame={handleEndGame}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});