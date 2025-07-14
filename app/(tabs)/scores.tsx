import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Trophy, Star, Target } from 'lucide-react-native';

export default function ScoresTab() {
  const sampleStats = [
    { label: 'Totaal gespeelde spellen', value: '12', icon: <Trophy size={24} color="#1DB954" /> },
    { label: 'Gemiddelde score', value: '7.3', icon: <Star size={24} color="#1DB954" /> },
    { label: 'Beste score', value: '15', icon: <Target size={24} color="#1DB954" /> },
  ];

  const recentGames = [
    { date: '2024-01-15', players: ['Jan', 'Marie', 'Tom'], winner: 'Marie', score: 12 },
    { date: '2024-01-14', players: ['Anna', 'Bob', 'Lisa'], winner: 'Bob', score: 10 },
    { date: '2024-01-13', players: ['Tom', 'Jan'], winner: 'Tom', score: 8 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistieken</Text>
      
      <View style={styles.statsContainer}>
        {sampleStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIcon}>
              {stat.icon}
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recente Spellen</Text>
      
      <ScrollView style={styles.gamesContainer}>
        {recentGames.map((game, index) => (
          <View key={index} style={styles.gameCard}>
            <View style={styles.gameHeader}>
              <Text style={styles.gameDate}>{game.date}</Text>
              <Text style={styles.gameWinner}>🏆 {game.winner}</Text>
            </View>
            <Text style={styles.gamePlayers}>
              Spelers: {game.players.join(', ')}
            </Text>
            <Text style={styles.gameScore}>
              Winnende score: {game.score}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>
          Meer gedetailleerde statistieken komen binnenkort!
        </Text>
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
  statsContainer: {
    marginBottom: 30,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statIcon: {
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191414',
  },
  statLabel: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191414',
    marginBottom: 16,
  },
  gamesContainer: {
    flex: 1,
  },
  gameCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameDate: {
    fontSize: 14,
    color: '#666666',
  },
  gameWinner: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1DB954',
  },
  gamePlayers: {
    fontSize: 14,
    color: '#191414',
    marginBottom: 4,
  },
  gameScore: {
    fontSize: 14,
    color: '#666666',
  },
  comingSoon: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});