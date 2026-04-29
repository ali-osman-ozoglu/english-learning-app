import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { user, isInitializing } = useUserStore();

  if (isInitializing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Bağlantı Kuruluyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hoş Geldiniz,</Text>
          <Text style={styles.anonId}>
            Anonim ID: {user?.uuid ? `${user.uuid.substring(0, 8)}...` : 'Bekleniyor'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.transferButton}
          onPress={() => navigation.navigate('DeviceTransfer')}
        >
          <Text style={styles.transferButtonText}>Cihazımı Değiştir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>İngilizce Serüveniniz Başlıyor</Text>
          <Text style={styles.subtitle}>
            Kişisel verileriniz cihazınızda güvendedir. Tamamen anonim olarak ilerlemenizi kaydediyoruz.
          </Text>
          
          <View style={styles.modulesContainer}>
            <Text style={styles.sectionTitle}>Öğrenme Modülleri</Text>
            
            <TouchableOpacity 
              style={styles.moduleCard} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Vocabulary')}
            >
                <View style={styles.moduleIconBg}><Text style={styles.moduleIcon}>📚</Text></View>
                <View style={styles.moduleTextContainer}>
                    <Text style={styles.moduleTitle}>Kelime Kartları</Text>
                    <Text style={styles.moduleDesc}>Seviyenize ({user?.level?.vocabulary || 'A1'}) uygun kelimeler</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.moduleCard} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Reading')}
            >
                <View style={[styles.moduleIconBg, {backgroundColor: 'rgba(16, 185, 129, 0.15)'}]}><Text style={styles.moduleIcon}>🎤</Text></View>
                <View style={styles.moduleTextContainer}>
                    <Text style={styles.moduleTitle}>Sesli Okuma</Text>
                    <Text style={styles.moduleDesc}>Telaffuzunuzu yapay zeka ile ölçün ({user?.level?.reading || 'A1'})</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.moduleCard} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Writing')}
            >
                <View style={[styles.moduleIconBg, {backgroundColor: 'rgba(168, 85, 247, 0.15)'}]}><Text style={styles.moduleIcon}>✍️</Text></View>
                <View style={styles.moduleTextContainer}>
                    <Text style={styles.moduleTitle}>Çeviri & Yazma</Text>
                    <Text style={styles.moduleDesc}>AI öğretmenden geri bildirim alın ({user?.level?.writing || 'A1'})</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.moduleCard} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Listening')}
            >
                <View style={[styles.moduleIconBg, {backgroundColor: 'rgba(236, 72, 153, 0.15)'}]}><Text style={styles.moduleIcon}>🎧</Text></View>
                <View style={styles.moduleTextContainer}>
                    <Text style={styles.moduleTitle}>Dinleme & Dikte</Text>
                    <Text style={styles.moduleDesc}>Duyduğunuz metni İngilizceye dökün ({user?.level?.listening || 'A1'})</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  greeting: { color: '#94a3b8', fontSize: 14 },
  anonId: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  transferButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  transferButtonText: { color: '#38bdf8', fontSize: 12, fontWeight: '600' },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, padding: 24 },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: '900', marginBottom: 12 },
  subtitle: { color: '#94a3b8', fontSize: 16, lineHeight: 24, marginBottom: 40 },
  modulesContainer: { flex: 1 },
  sectionTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  moduleIconBg: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(56, 189, 248, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  moduleIcon: { fontSize: 24 },
  moduleTextContainer: { flex: 1 },
  moduleTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  moduleDesc: { color: '#94a3b8', fontSize: 13 },
  chevron: { color: '#64748b', fontSize: 24, fontWeight: '300' },
});
