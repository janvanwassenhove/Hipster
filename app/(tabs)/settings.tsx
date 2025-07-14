import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { Volume2, VolumeX, Info, LogOut, Settings as SettingsIcon } from 'lucide-react-native';
import { spotifyService } from '@/services/spotify';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsTab() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAnimations, setShowAnimations] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen van Spotify?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Uitloggen', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('spotify_token');
            Alert.alert('Uitgelogd', 'Je bent uitgelogd van Spotify');
          }
        }
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'Over Hitster Quiz',
      'Hitster Quiz v1.0\n\nEen muziek trivia spel geïnspireerd op het populaire bordspel Hitster.\n\nOntwikkeld met Expo en React Native.',
      [{ text: 'OK' }]
    );
  };

  const settingsItems = [
    {
      icon: <SettingsIcon size={24} color="#1DB954" />,
      title: 'Spel Instellingen',
      items: [
        {
          title: 'Geluid',
          subtitle: 'Schakel geluid in/uit',
          icon: soundEnabled ? <Volume2 size={20} color="#1DB954" /> : <VolumeX size={20} color="#666666" />,
          control: <Switch value={soundEnabled} onValueChange={setSoundEnabled} />,
        },
        {
          title: 'Animaties',
          subtitle: 'Toon animaties en overgangen',
          control: <Switch value={showAnimations} onValueChange={setShowAnimations} />,
        },
        {
          title: 'Auto-play',
          subtitle: 'Start automatisch volgende fragment',
          control: <Switch value={autoPlay} onValueChange={setAutoPlay} />,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Instellingen</Text>
      
      {settingsItems.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <View style={styles.sectionHeader}>
            {section.icon}
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                {item.icon && <View style={styles.settingIcon}>{item.icon}</View>}
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              {item.control && (
                <View style={styles.settingControl}>
                  {item.control}
                </View>
              )}
            </View>
          ))}
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.aboutButton} onPress={showAbout}>
          <Info size={20} color="#1DB954" />
          <Text style={styles.aboutButtonText}>Over de App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF6B35" />
          <Text style={styles.logoutButtonText}>Uitloggen van Spotify</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Hitster Quiz v1.0
        </Text>
        <Text style={styles.footerSubtext}>
          Powered by Spotify Web API
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#191414',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191414',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  settingControl: {
    marginLeft: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  aboutButtonText: {
    fontSize: 16,
    color: '#1DB954',
    marginLeft: 8,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#B3B3B3',
    marginTop: 4,
  },
});