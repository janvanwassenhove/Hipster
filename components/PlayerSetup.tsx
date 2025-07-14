import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { Player } from '@/types/game';
import { Trash2, Plus } from 'lucide-react-native';

interface PlayerSetupProps {
  onStartGame: (players: Player[], gameMode: string, theme: string) => void;
}

export default function PlayerSetup({ onStartGame }: PlayerSetupProps) {
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [gameMode, setGameMode] = useState<'original' | 'pro' | 'expert'>('original');
  const [theme, setTheme] = useState('all');

  const addPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const startGame = () => {
    const validNames = playerNames.filter(name => name.trim() !== '');
    
    if (validNames.length < 2) {
      Alert.alert('Fout', 'Er moeten minimaal 2 spelers zijn');
      return;
    }

    const players: Player[] = validNames.map((name, index) => ({
      id: `player-${index}`,
      name: name.trim(),
      score: 0,
      timeline: [],
      tokens: 3,
    }));

    onStartGame(players, gameMode, theme);
  };

  const gameModes = [
    { id: 'original', name: 'Original', description: 'Alleen juiste positie op tijdlijn' },
    { id: 'pro', name: 'Pro', description: 'Ook artiest en titel raden' },
    { id: 'expert', name: 'Expert', description: 'Exact jaartal ingeven' },
  ];

  const themes = [
    { id: 'all', name: 'Alle muziek' },
    { id: '90s', name: "90's Hits" },
    { id: '2000s', name: "2000's Hits" },
    { id: 'pop', name: 'Pop' },
    { id: 'rock', name: 'Rock' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spelers Setup</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spelers (2-4)</Text>
        {playerNames.map((name, index) => (
          <View key={index} style={styles.playerInputContainer}>
            <TextInput
              style={styles.playerInput}
              placeholder={`Speler ${index + 1} naam`}
              value={name}
              onChangeText={(text) => updatePlayerName(index, text)}
              maxLength={20}
            />
            {playerNames.length > 2 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePlayer(index)}
              >
                <Trash2 size={20} color="#FF6B35" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {playerNames.length < 4 && (
          <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
            <Plus size={20} color="#1DB954" />
            <Text style={styles.addButtonText}>Speler toevoegen</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moeilijkheidsgraad</Text>
        {gameModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.optionButton,
              gameMode === mode.id && styles.selectedOption,
            ]}
            onPress={() => setGameMode(mode.id as any)}
          >
            <Text style={[
              styles.optionTitle,
              gameMode === mode.id && styles.selectedOptionText,
            ]}>
              {mode.name}
            </Text>
            <Text style={[
              styles.optionDescription,
              gameMode === mode.id && styles.selectedOptionText,
            ]}>
              {mode.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thema</Text>
        <View style={styles.themeGrid}>
          {themes.map((themeOption) => (
            <TouchableOpacity
              key={themeOption.id}
              style={[
                styles.themeButton,
                theme === themeOption.id && styles.selectedTheme,
              ]}
              onPress={() => setTheme(themeOption.id)}
            >
              <Text style={[
                styles.themeButtonText,
                theme === themeOption.id && styles.selectedThemeText,
              ]}>
                {themeOption.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>Start Spel</Text>
      </TouchableOpacity>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#191414',
    marginBottom: 15,
  },
  playerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  removeButton: {
    marginLeft: 12,
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1DB954',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  addButtonText: {
    color: '#1DB954',
    fontSize: 16,
    marginLeft: 8,
  },
  optionButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191414',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  selectedTheme: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  themeButtonText: {
    fontSize: 14,
    color: '#191414',
    fontWeight: '500',
  },
  selectedThemeText: {
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});