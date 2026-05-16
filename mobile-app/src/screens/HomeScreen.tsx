import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';

import { MaterialIcons } from '@expo/vector-icons';

// Ekran Parametreleri
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { user } = useUserStore();

  // Öğrenme modülü kartlarını oluşturan yardımcı fonksiyon
  const renderModuleCard = (
    id: 'vocabulary' | 'reading' | 'writing' | 'listening',
    title: string,
    desc: string,
    icon: string,
    navScreen: keyof RootStackParamList,
    bgColor: string
  ) => {
    const isLocked = user?.dailyQuotas?.counts && user?.dailyQuotas?.limits && 
                     user.dailyQuotas.counts[id] >= user.dailyQuotas.limits[id];

    return (
      <TouchableOpacity 
        key={id}
        style={[styles.moduleCard, isLocked && styles.moduleCardLocked]} 
        activeOpacity={isLocked ? 1 : 0.8}
        onPress={() => !isLocked && navigation.navigate(navScreen as any)}
      >
          <View style={[styles.moduleIconBg, { backgroundColor: isLocked ? 'rgba(71, 85, 105, 0.2)' : bgColor }]}>
            <Text style={[styles.moduleIcon, isLocked && styles.moduleIconLocked]}>{icon}</Text>
          </View>
          <View style={styles.moduleTextContainer}>
              <Text style={[styles.moduleTitle, isLocked && styles.moduleTextLocked]}>{title}</Text>
              <Text style={[styles.moduleDesc, isLocked && styles.moduleTextLocked]}>
                {isLocked ? 'Günlük Hedef Tamamlandı' : `${desc} (${user?.level?.[id] || 'A1'})`}
              </Text>
          </View>
          <Text style={[styles.chevron, isLocked && styles.moduleTextLocked]}>{isLocked ? '🔒' : '›'}</Text>
      </TouchableOpacity>
    );
  };

  const targetLanguage = user?.targetLanguage || 'en';
  // Uygulama isimleri (Hedef dile göre logoda görünecek isimler)
  const appNames: Record<string, string> = {
    en: 'myEnglish',
    es: 'mySpanish',
    pt: 'myPortuguese',
    de: 'myGerman',
    it: 'myItalian',
  };
  const appName = appNames[targetLanguage] || 'myLanguage';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/myEnglish.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <MaterialIcons name="settings" size={28} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.modulesContainer}>
            <Text style={styles.sectionTitle}>Öğrenme Modülleri</Text>
            
            {renderModuleCard('vocabulary', 'Kelime Hazinesi', 'Yeni kelimeleri keşfet ve pekiştir', '📚', 'Vocabulary', 'rgba(56, 189, 248, 0.15)')}
            {renderModuleCard('reading', 'Telaffuz Analizi', 'Yapay zeka ile telaffuzunu geliştir', '🎤', 'Reading', 'rgba(16, 185, 129, 0.15)')}
            {renderModuleCard('writing', 'Akıllı Yazım Rehberi', 'Yaz, çevir, yapay zeka ile mükemmeli yakala', '✍️', 'Writing', 'rgba(168, 85, 247, 0.15)')}
            {renderModuleCard('listening', 'Sesten Metne', 'Dinlediğini yazarak anlama ve odaklanma hızını yapay zeka ile ölç', '🎧', 'Listening', 'rgba(236, 72, 153, 0.15)')}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  centerContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94a3b8', marginTop: 16, fontSize: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  logo: { width: 170, height: 48 },
  settingsButton: {
    padding: 4,
  },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, padding: 24 },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: '900', marginBottom: 12 },
  subtitle: { color: '#94a3b8', fontSize: 16, lineHeight: 24, marginBottom: 40 },
  modulesContainer: { flex: 1 },
  sectionTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  moduleCardLocked: { opacity: 0.5, borderColor: '#1e293b' },
  moduleIconBg: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  moduleIcon: { fontSize: 24 },
  moduleIconLocked: { opacity: 0.3 },
  moduleTextContainer: { flex: 1 },
  moduleTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  moduleDesc: { color: '#94a3b8', fontSize: 13 },
  moduleTextLocked: { color: '#475569' },
  chevron: { color: '#64748b', fontSize: 24, fontWeight: '300' },
});
