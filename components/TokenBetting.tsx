import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useState } from 'react';
import { Player, TokenBet } from '@/types/game';
import { Coins, X } from 'lucide-react-native';

interface TokenBettingProps {
  players: Player[];
  currentPlayer: Player;
  onBetsPlaced: (bets: TokenBet[]) => void;
  onClose: () => void;
}

export default function TokenBetting({ players, currentPlayer, onBetsPlaced, onClose }: TokenBettingProps) {
  const [bets, setBets] = useState<TokenBet[]>([]);

  const addBet = (playerId: string, playerName: string, betType: 'correct' | 'incorrect') => {
    const existingBet = bets.find(bet => bet.playerId === playerId);
    
    if (existingBet) {
      setBets(bets.map(bet => 
        bet.playerId === playerId 
          ? { ...bet, betType, betAmount: 1 }
          : bet
      ));
    } else {
      setBets([...bets, {
        playerId,
        playerName,
        betAmount: 1,
        betType,
      }]);
    }
  };

  const removeBet = (playerId: string) => {
    setBets(bets.filter(bet => bet.playerId !== playerId));
  };

  const confirmBets = () => {
    onBetsPlaced(bets);
  };

  return (
    <Modal visible={true} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Token Weddenschap</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#191414" />
            </TouchableOpacity>
          </View>

          <Text style={styles.instruction}>
            Andere spelers kunnen tokens inzetten of {currentPlayer.name} de kaart correct zal plaatsen
          </Text>

          <View style={styles.playersList}>
            {players.map((player) => {
              const playerBet = bets.find(bet => bet.playerId === player.id);
              
              return (
                <View key={player.id} style={styles.playerRow}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <View style={styles.tokensInfo}>
                      <Coins size={16} color="#1DB954" />
                      <Text style={styles.tokensText}>{player.tokens}</Text>
                    </View>
                  </View>

                  <View style={styles.betButtons}>
                    <TouchableOpacity
                      style={[
                        styles.betButton,
                        styles.correctButton,
                        playerBet?.betType === 'correct' && styles.selectedBet
                      ]}
                      onPress={() => addBet(player.id, player.name, 'correct')}
                      disabled={player.tokens === 0}
                    >
                      <Text style={[
                        styles.betButtonText,
                        playerBet?.betType === 'correct' && styles.selectedBetText
                      ]}>
                        Correct
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.betButton,
                        styles.incorrectButton,
                        playerBet?.betType === 'incorrect' && styles.selectedBet
                      ]}
                      onPress={() => addBet(player.id, player.name, 'incorrect')}
                      disabled={player.tokens === 0}
                    >
                      <Text style={[
                        styles.betButtonText,
                        playerBet?.betType === 'incorrect' && styles.selectedBetText
                      ]}>
                        Fout
                      </Text>
                    </TouchableOpacity>

                    {playerBet && (
                      <TouchableOpacity
                        style={styles.removeBetButton}
                        onPress={() => removeBet(player.id)}
                      >
                        <Text style={styles.removeBetText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Ingezette Tokens:</Text>
            {bets.map((bet) => (
              <Text key={bet.playerId} style={styles.summaryItem}>
                {bet.playerName}: {bet.betAmount} token op "{bet.betType === 'correct' ? 'Correct' : 'Fout'}"
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={confirmBets}>
            <Text style={styles.confirmButtonText}>Bevestig Weddenschappen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191414',
  },
  instruction: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  playersList: {
    marginBottom: 20,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191414',
  },
  tokensInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tokensText: {
    fontSize: 14,
    color: '#1DB954',
    marginLeft: 4,
  },
  betButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  betButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  correctButton: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  incorrectButton: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF6B35',
  },
  selectedBet: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  betButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#191414',
  },
  selectedBetText: {
    color: '#FFFFFF',
  },
  removeBetButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBetText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191414',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  confirmButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});