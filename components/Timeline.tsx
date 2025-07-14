import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TrackCard } from '@/types/game';
import { Plus } from 'lucide-react-native';

interface TimelineProps {
  timeline: TrackCard[];
  onCardPlaced: (position: number) => void;
  currentTrack: TrackCard | null;
}

export default function Timeline({ timeline, onCardPlaced, currentTrack }: TimelineProps) {
  const handlePositionPress = (position: number) => {
    if (!currentTrack) return;
    
    Alert.alert(
      'Kaart plaatsen',
      `Wil je deze kaart hier plaatsen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Plaatsen', onPress: () => onCardPlaced(position) }
      ]
    );
  };

  const renderCard = (card: TrackCard) => (
    <View style={[
      styles.card,
      { backgroundColor: card.placed_correctly ? '#E8F5E8' : '#FFF3E0' }
    ]}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {card.name}
      </Text>
      <Text style={styles.cardArtist} numberOfLines={1}>
        {card.artist}
      </Text>
      <Text style={styles.cardYear}>{card.year}</Text>
    </View>
  );

  const renderPlaceholder = (position: number) => (
    <TouchableOpacity
      style={styles.placeholder}
      onPress={() => handlePositionPress(position)}
    >
      <Plus size={24} color="#1DB954" />
      <Text style={styles.placeholderText}>Plaats hier</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jouw Tijdlijn</Text>
      
      <View style={styles.timeline}>
        {timeline.length === 0 ? (
          <View style={styles.emptyTimeline}>
            <Text style={styles.emptyText}>Nog geen kaarten geplaatst</Text>
            {renderPlaceholder(0)}
          </View>
        ) : (
          <View style={styles.timelineContent}>
            {renderPlaceholder(0)}
            
            {timeline.map((card, index) => (
              <View key={`${card.id}-${index}`} style={styles.cardContainer}>
                {renderCard(card)}
                {renderPlaceholder(index + 1)}
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E8F5E8' }]} />
          <Text style={styles.legendText}>Correct geplaatst</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFF3E0' }]} />
          <Text style={styles.legendText}>Fout geplaatst</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191414',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeline: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  emptyTimeline: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  timelineContent: {
    flexDirection: 'column',
  },
  cardContainer: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    width: '100%',
    maxWidth: 250,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191414',
    textAlign: 'center',
  },
  cardArtist: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    textAlign: 'center',
  },
  cardYear: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1DB954',
    marginTop: 4,
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1DB954',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    maxWidth: 250,
  },
  placeholderText: {
    color: '#1DB954',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
});