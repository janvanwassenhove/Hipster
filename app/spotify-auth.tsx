import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spotifyAuth } from '@/services/spotify';

export default function SpotifyAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Authenticating...');
  
  useEffect(() => {
    // Handle Spotify OAuth callback
    const handleCallback = async () => {
      try {
        setStatus('Exchanging authorization code...');
        
        const accessToken = await spotifyAuth.handleCallback();
        
        if (accessToken) {
          setStatus('Authentication successful! Redirecting...');
          console.log('Spotify authentication successful');
          
          // Small delay to show success message
          setTimeout(() => {
            router.replace('/');
          }, 1000);
        } else {
          // Check for error in URL
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          
          if (error) {
            console.error('Spotify authentication error:', error);
            setStatus('Authentication failed. Redirecting...');
            setTimeout(() => {
              router.replace('/?error=auth_failed');
            }, 2000);
          } else {
            console.error('No access token received');
            setStatus('No token received. Redirecting...');
            setTimeout(() => {
              router.replace('/?error=no_token');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error in callback handling:', error);
        setStatus('Authentication error. Redirecting...');
        setTimeout(() => {
          router.replace('/?error=callback_error');
        }, 2000);
      }
    };

    // Small delay to ensure the page has loaded
    const timer = setTimeout(handleCallback, 100);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#1DB954', '#191414']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ 
          color: '#FFFFFF', 
          fontSize: 18, 
          marginTop: 20,
          textAlign: 'center',
          paddingHorizontal: 40
        }}>
          {status}
        </Text>
        <Text style={{ 
          color: '#B3B3B3', 
          fontSize: 14, 
          marginTop: 10,
          textAlign: 'center',
          paddingHorizontal: 40
        }}>
          Please wait while we complete the login process.
        </Text>
      </LinearGradient>
    </View>
  );
}
