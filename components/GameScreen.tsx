import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { GameState, TrackCard, TokenBet } from '@/types/game';
import { spotifyService } from '@/services/spotify';
import { Play, Pause, SkipForward, Coins } from 'lucide-react-native';
import Timeline from './Timeline';
import TokenBetting from './TokenBetting';

interface GameScreenProps {
  gameState: GameState;
  onUpdateGameState: (newState: GameState) => void;
  onEndGame: () => void;
}

export default function GameScreen({ gameState, onUpdateGameState, onEndGame }: GameScreenProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenBetting, setShowTokenBetting] = useState(false);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  useEffect(() => {
    if (gameState.gamePhase === 'playing' && !gameState.currentTrack) {
      loadNewTrack();
    }
  }, [gameState.gamePhase, gameState.currentTrack]);

  const loadNewTrack = async () => {
    setIsLoading(true);
    try {
      const track = await spotifyService.getRandomTrack(gameState.theme);
      if (track) {
        const trackCard: TrackCard = {
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          year: parseInt(track.album.release_date.split('-')[0]),
          preview_url: track.preview_url,
          album_image: track.album.images[0]?.url,
          placed_correctly: false,
        };
        
        onUpdateGameState({
          ...gameState,
          currentTrack: trackCard,
        });
      }
    } catch (error) {
      Alert.alert('Fout', 'Kon geen nieuw nummer laden');
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = async () => {
    if (!gameState.currentTrack?.preview_url) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: gameState.currentTrack.preview_url },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      Alert.alert('Fout', 'Kon het nummer niet afspelen');
    }
  };

  const stopTrack = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const onCardPlaced = (position: number) => {
    if (!gameState.currentTrack) return;

    const player = gameState.players[gameState.currentPlayerIndex];
    const newTimeline = [...player.timeline];
    const actualYear = gameState.currentTrack.year;
    
    // Check if placement is correct
    let correctPlacement = true;
    
    if (position > 0 && newTimeline[position - 1].year > actualYear) {
      correctPlacement = false;
    }
    if (position < newTimeline.length && newTimeline[position].year < actualYear) {
      correctPlacement = false;
    }

    // Insert the card at the correct position
    newTimeline.splice(position, 0, {
      ...gameState.currentTrack,
      placed_correctly: correctPlacement,
    });

    // Update player
    const updatedPlayer = {
      ...player,
      timeline: newTimeline,
      score: correctPlacement ? player.score + 1 : player.score,
    };

    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = updatedPlayer;

    onUpdateGameState({
      ...gameState,
      players: updatedPlayers,
      gamePhase: 'results',
    });

    // Stop the music
    if (sound) {
      sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const showResults = () => {
    if (!gameState.currentTrack) return;

    const isCorrect = gameState.currentTrack.placed_correctly;
    const message = isCorrect 
      ? `Correct! ${gameState.currentTrack.name} door ${gameState.currentTrack.artist} is uit ${gameState.currentTrack.year}`
      : `Fout! ${gameState.currentTrack.name} door ${gameState.currentTrack.artist} is uit ${gameState.currentTrack.year}`;

    Alert.alert('Resultaat', message, [
      { text: 'OK', onPress: nextPlayer }
    ]);
  };

  const nextPlayer = () => {
    const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const nextRound = nextIndex === 0 ? gameState.round + 1 : gameState.round;

    if (nextRound > gameState.maxRounds) {
      onEndGame();
      return;
    }

    onUpdateGameState({
      ...gameState,
      currentPlayerIndex: nextIndex,
      round: nextRound,
      currentTrack: null,
      gamePhase: 'playing',
      tokenBets: [],
    });
  };

  const handleTokenBet = (bets: TokenBet[]) => {
    onUpdateGameState({
      ...gameState,
      tokenBets: bets,
    });
    setShowTokenBetting(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Nieuw nummer laden...</Text>
      </View>
    );
  }

  if (gameState.gamePhase === 'results') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Resultaat</Text>
        </View>
        
        {gameState.currentTrack && (
          <View style={styles.resultCard}>
            {gameState.currentTrack.album_image && (
              <Image 
                source={{ uri: gameState.currentTrack.album_image }} 
                style={styles.albumImage}
              />
            )}
            <Text style={styles.trackName}>{gameState.currentTrack.name}</Text>
            <Text style={styles.artistName}>{gameState.currentTrack.artist}</Text>
            <Text style={styles.yearText}>Jaar: {gameState.currentTrack.year}</Text>
            
            <View style={[
              styles.resultBadge,
              { backgroundColor: gameState.currentTrack.placed_correctly ? '#4CAF50' : '#FF6B35' }
            ]}>
              <Text style={styles.resultText}>
                {gameState.currentTrack.placed_correctly ? 'Correct!' : 'Fout!'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={nextPlayer}>
          <Text style={styles.nextButtonText}>Volgende speler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ronde {gameState.round}</Text>
        <Text style={styles.currentPlayer}>
          {currentPlayer.name} is aan de beurt
        </Text>
      </View>

      <View style={styles.scoreBoard}>
        {gameState.players.map((player, index) => (
          <View key={player.id} style={[
            styles.playerScore,
            index === gameState.currentPlayerIndex && styles.activePlayer
          ]}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.score}>{player.score}</Text>
          </View>
        ))}
      </View>

      {gameState.currentTrack && (
        <View style={styles.trackSection}>
          <View style={styles.trackInfo}>
            {gameState.currentTrack.album_image && (
              <Image 
                source={{ uri: gameState.currentTrack.album_image }} 
                style={styles.albumCover}
              />
            )}
            <Text style={styles.instruction}>
              Luister naar het fragment en plaats het op je tijdlijn
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={isPlaying ? stopTrack : playTrack}
            >
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tokenButton}
              onPress={() => setShowTokenBetting(true)}
            >
              <Coins size={20} color="#1DB954" />
              <Text style={styles.tokenButtonText}>Tokens</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Timeline 
        timeline={currentPlayer.timeline}
        onCardPlaced={onCardPlaced}
        currentTrack={gameState.currentTrack}
      />

      {showTokenBetting && (
        <TokenBetting
          players={gameState.players.filter((_, index) => index !== gameState.currentPlayerIndex)}
          currentPlayer={currentPlayer}
          onBetsPlaced={handleTokenBet}
          onClose={() => setShowTokenBetting(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191414',
  },
  currentPlayer: {
    fontSize: 18,
    color: '#1DB954',
    marginTop: 4,
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  playerScore: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  activePlayer: {
    backgroundColor: '#1DB954',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191414',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#191414',
    marginTop: 4,
  },
  trackSection: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  albumCover: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  tokenButtonText: {
    color: '#1DB954',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  albumImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 16,
  },
  trackName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#191414',
    textAlign: 'center',
  },
  artistName: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  yearText: {
    fontSize: 18,
    color: '#1DB954',
    marginTop: 8,
    fontWeight: '600',
  },
  resultBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});