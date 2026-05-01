import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: Props) {
  const { user } = useUserStore();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('LanguageSelection')}
          >
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Öğrenilen Dili Değiştir</Text>
                <Text style={styles.value}>İngilizce</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#64748b" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cihaz ve Veri</Text>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('DeviceTransfer')}
          >
            <View style={styles.row}>
              <Text style={styles.label}>Cihazımı Değiştir / Veri Aktar</Text>
              <MaterialIcons name="chevron-right" size={24} color="#64748b" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLabel}>Kullanıcı Kimliği (UUID)</Text>
          <Text style={styles.uuidText}>{user?.uuid}</Text>
          <Text style={styles.versionText}>Versiyon 1.0.0</Text>
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
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  container: { padding: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#f8fafc', fontSize: 16, fontWeight: '500' },
  value: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold' },
  footer: { marginTop: 40, alignItems: 'center' },
  footerLabel: { color: '#64748b', fontSize: 12, marginBottom: 8 },
  uuidText: { color: '#475569', fontSize: 10, textAlign: 'center', marginBottom: 20 },
  versionText: { color: '#334155', fontSize: 12 },
});
