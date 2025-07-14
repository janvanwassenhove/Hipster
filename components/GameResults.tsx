import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Player } from '@/types/game';
import { Trophy, Medal, Award } from 'lucide-react-native';

interface GameResultsProps {
  players: Player[];
  onPlayAgain: () => void;
}

export default function GameResults({ players, onPlayAgain }: GameResultsProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy size={32} color="#FFD700" />;
      case 1:
        return <Medal size={32} color="#C0C0C0" />;
      case 2:
        return <Award size={32} color="#CD7F32" />;
      default:
        return <Text style={styles.positionNumber}>{position + 1}</Text>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 0:
        return '#FFD700';
      case 1:
        return '#C0C0C0';
      case 2:
        return '#CD7F32';
      default:
        return '#1DB954';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eindresultaten</Text>
      
      <ScrollView style={styles.resultsContainer}>
        {sortedPlayers.map((player, index) => (
          <View
            key={player.id}
            style={[
              styles.playerResult,
              { borderLeftColor: getPositionColor(index) }
            ]}
          >
            <View style={styles.positionContainer}>
              {getPositionIcon(index)}
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerScore}>{player.score} punten</Text>
              <Text style={styles.playerTimeline}>
                {player.timeline.length} kaarten geplaatst
              </Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {player.timeline.filter(card => card.placed_correctly).length}
                </Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {player.timeline.filter(card => !card.placed_correctly).length}
                </Text>
                <Text style={styles.statLabel}>Fout</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
          <Text style={styles.playAgainButtonText}>Opnieuw Spelen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#191414',
    textAlign: 'center',
    marginBottom: 30,
  },
  resultsContainer: {
    flex: 1,
  },
  playerResult: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  positionContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 16,
  },
  positionNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#191414',
  },
  playerScore: {
    fontSize: 16,
    color: '#1DB954',
    marginTop: 4,
    fontWeight: '600',
  },
  playerTimeline: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#191414',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  buttonContainer: {
    paddingTop: 20,
  },
  playAgainButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});