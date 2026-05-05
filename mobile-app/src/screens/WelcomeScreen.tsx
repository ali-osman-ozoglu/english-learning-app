import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const handleProceedToLanguage = () => {
    navigation.navigate('LanguageSelection', { fromOnboarding: true });
  };

  const handleProceedToTransfer = () => {
    navigation.navigate('DeviceTransfer', { fromOnboarding: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>

          <Text style={styles.title}>Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>
            Dil öğrenme serüveninizde yapay zeka yanınızda. Kelime, okuma, yazma ve dinleme modülleri ile dil becerilerinizi en üst seviyeye taşıyın.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleProceedToLanguage}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Öğrenmek İstediğiniz Dili Seçin</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.outlineButton} 
              onPress={handleProceedToTransfer}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Eski Cihazımdaki Verileri Aktar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { padding: 24, alignItems: 'center' },
  logoContainer: {
    width: width * 0.8,
    height: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: { width: '100%', height: '100%' },
  title: { color: '#f8fafc', fontSize: 32, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  subtitle: { color: '#94a3b8', fontSize: 16, textAlign: 'center', lineHeight: 26, marginBottom: 48 },
  buttonContainer: { width: '100%' },
  primaryButton: { 
    backgroundColor: '#38bdf8', 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4
  },
  primaryButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },
  outlineButton: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#38bdf8' 
  },
  outlineButtonText: { color: '#38bdf8', fontWeight: 'bold', fontSize: 16 },
});
