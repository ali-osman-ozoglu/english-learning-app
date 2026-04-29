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
import { getOrCreateUUID } from '../utils/auth';
import { registerDevice } from '../api/authApi';
import { useUserStore } from '../store/useUserStore';

export type RootStackParamList = {
  Home: undefined;
  DeviceTransfer: undefined;
  Survey: undefined;
  SurveyResult: { evaluation: any };
  Vocabulary: undefined;
  Reading: undefined;
  Writing: undefined;
  Listening: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading, setLoading, setUser } = useUserStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Cihaz UUID'sini getir veya oluştur (Anonim)
        const uuid = await getOrCreateUUID();
        
        // 2. Backend'e bağlan ve kullanıcı verilerini al/kaydet
        const user = await registerDevice(uuid);
        
        // 3. State'e kaydet ve yükleme ekranını kapat
        setUser(user);
      } catch (error) {
        console.error('App initialization failed:', error);
        setLoading(false);
      }
    };
    initApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.splashText}>Yapay Zeka Hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={user?.level?.vocabulary === 'UNTESTED' ? 'Survey' : 'Home'}
        screenOptions={{ 
          headerShown: false, 
          contentStyle: { backgroundColor: '#0f172a' },
          animation: 'fade_from_bottom'
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
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
