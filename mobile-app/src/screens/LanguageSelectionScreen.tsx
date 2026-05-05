import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LanguageSelection'>;
  route: RouteProp<RootStackParamList, 'LanguageSelection'>;
};

const LANGUAGES = [
  { id: 'en', name: 'İngilizce', available: true },
  { id: 'es', name: 'İspanyolca', available: false },
  { id: 'pt', name: 'Portekizce', available: false },
  { id: 'de', name: 'Almanca', available: false },
  { id: 'it', name: 'İtalyanca', available: false },
];

export default function LanguageSelectionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { fromOnboarding } = route.params || {};

  const handleSelect = async (langId: string) => {
    if (langId === 'en') {
      if (fromOnboarding) {
        navigation.navigate('Survey', { language: langId });
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Survey', { language: langId });
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      {navigation.canGoBack() && (
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.container, !navigation.canGoBack() && { paddingTop: Math.max(insets.top, 40) }]}>
        <Text style={styles.title}>Öğrenmek İstediğiniz Dili Seçin</Text>
        <Text style={styles.subtitle}>Şu an için sadece İngilizce aktiftir, diğer diller yakında eklenecektir.</Text>

        <View style={styles.list}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[styles.item, !lang.available && styles.itemDisabled]}
              onPress={() => handleSelect(lang.id)}
              disabled={!lang.available}
            >
              <Text style={[styles.itemName, !lang.available && styles.itemTextDisabled]}>
                {lang.name}
              </Text>
              {!lang.available && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Yakında</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingBottom: 12 
  },
  backButton: { padding: 8 },
  container: { padding: 24, alignItems: 'center' },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 20, marginBottom: 12 },
  subtitle: { color: '#94a3b8', fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  list: { width: '100%' },
  item: { 
    backgroundColor: '#1e293b', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  itemDisabled: { opacity: 0.6, backgroundColor: '#0f172a' },
  itemName: { color: '#f8fafc', fontSize: 18, fontWeight: '600' },
  itemTextDisabled: { color: '#64748b' },
  badge: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  badgeText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
});
