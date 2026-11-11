import React, { useEffect, useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { 
  useFonts, 
  PressStart2P_400Regular 
} from '@expo-google-fonts/press-start-2p';
import * as SplashScreen from 'expo-splash-screen';
import { GameOnSplash } from '../src/components/GameOnSplash';

// Immediately unlock and hide any native splash screen to prevent hanging
SplashScreen.hideAsync().catch(() => {});

const GameOnDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#09080E',
    card: '#0E0D16',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#F4F4F5',
    notification: '#8B5CF6',
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide native splash screen immediately so Expo Go NEVER hangs
    SplashScreen.hideAsync().catch(() => {});

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = '#09080E';
      document.body.style.backgroundColor = '#09080E';
    }

    // Hard fallback: intro splash always dismisses after 1.6s
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#09080E' }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#09080E' }}>
        <ThemeProvider value={GameOnDarkTheme}>
          <StatusBar style="light" />
          {/* Opaque dark baseline ensuring zero white flash across any transitions */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#09080E' }]} pointerEvents="none" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#09080E' },
              animation: 'fade',
              animationDuration: 180,
            }}
          />
          {showSplash && (
            <GameOnSplash onFinish={() => setShowSplash(false)} />
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
