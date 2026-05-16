import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import DeviceTransferScreen from '../screens/DeviceTransferScreen';
import SurveyScreen from '../screens/SurveyScreen';
import SurveyResultScreen from '../screens/SurveyResultScreen';
import VocabularyScreen from '../screens/VocabularyScreen';
import ReadingScreen from '../screens/ReadingScreen';
import WritingScreen from '../screens/WritingScreen';
import ListeningScreen from '../screens/ListeningScreen';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { getOrCreateUUID } from '../utils/auth';
import { registerDevice } from '../api/authApi';
import { useUserStore } from '../store/useUserStore';
import * as SecureStore from 'expo-secure-store';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  LanguageSelection: { fromOnboarding?: boolean } | undefined;
  Home: undefined;
  Settings: undefined;
  DeviceTransfer: { fromOnboarding?: boolean } | undefined;
  Survey: { language?: string } | undefined;
  SurveyResult: { evaluation: any };
  Vocabulary: undefined;
  Reading: undefined;
  Writing: undefined;
  Listening: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading, setLoading, setUser } = useUserStore();
  const [showSplash, setShowSplash] = React.useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = React.useState<boolean | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const seen = await SecureStore.getItemAsync('hasSeenWelcome');
        setHasSeenWelcome(seen === 'true');
        const uuid = await getOrCreateUUID();
        const user = await registerDevice(uuid);
        
        // Sunucudan gelen güvenlik tokanını kaydet
        if (user.authToken) {
          const { saveAuthToken } = require('../utils/auth');
          await saveAuthToken(user.authToken);
        }

        setUser(user);
        
        // Splash ekranını 2 saniye göster
        setTimeout(() => {
          setShowSplash(false);
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('App initialization failed:', error);
        setLoading(false);
        setShowSplash(false);
      }
    };
    initApp();
  }, []);

  if (isLoading || showSplash) {
    return <SplashScreen />;
  }

  // İlk giriş kontrolü: Eğer seviye UNTESTED ise dil seçimine yönlendir
  const isFirstTime = user?.level?.vocabulary === 'UNTESTED';
  const showWelcome = isFirstTime && !hasSeenWelcome;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={showWelcome ? 'Welcome' : (isFirstTime ? 'LanguageSelection' : 'Home')}
        screenOptions={{ 
          headerShown: false, 
          contentStyle: { backgroundColor: '#0f172a' },
          animation: 'fade_from_bottom'
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Survey" component={SurveyScreen} />
        <Stack.Screen name="SurveyResult" component={SurveyResultScreen} />
        <Stack.Screen name="Vocabulary" component={VocabularyScreen} />
        <Stack.Screen name="Reading" component={ReadingScreen} />
        <Stack.Screen name="Writing" component={WritingScreen} />
        <Stack.Screen name="Listening" component={ListeningScreen} />
        <Stack.Screen name="DeviceTransfer" component={DeviceTransferScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  splashText: {
    marginTop: 20,
    color: '#94a3b8',
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    letterSpacing: 1,
  }
});
