import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { generateTransferCode, transferDevice } from '../api/authApi';
import { updateUUID } from '../utils/auth';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeviceTransfer'>;
  route: RouteProp<RootStackParamList, 'DeviceTransfer'>;
};

export default function DeviceTransferScreen({ navigation, route }: Props) {
  const { user, setUser } = useUserStore();
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { fromOnboarding } = route.params || {};

  useEffect(() => {
    if (user?.transferCode && user?.transferCodeExpiresAt) {
      const expiresAt = new Date(user.transferCodeExpiresAt).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        if (expiresAt > now) {
          setGeneratedCode(user.transferCode);
          const diff = expiresAt - now;
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        } else {
          setGeneratedCode(null);
          setTimeLeft('');
          setUser({
            ...user,
            transferCode: undefined,
            transferCodeExpiresAt: undefined,
          });
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setGeneratedCode(null);
      setTimeLeft('');
    }
  }, [user]);

  const handleGenerateCode = async () => {
    if (!user?.uuid) return;
    setLoading(true);
    try {
      const res = await generateTransferCode(user.uuid);
      setGeneratedCode(res.transferCode);
      setUser({
        ...user,
        transferCode: res.transferCode,
        transferCodeExpiresAt: res.expiresAt,
      });
    } catch (error) {
      Alert.alert('Hata', 'Transfer kodu oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!user?.uuid || code.length !== 6) return;
    setLoading(true);
    try {
      // Sunucuya mevcut (geçici) UUID ve eski cihazdan alınan 6 haneli kodu gönder
      const updatedUser = await transferDevice(user.uuid, code);
      // Başarılı olursa, yereldeki UUID'yi de sunucudan dönen asıl UUID ile güncelle
      await updateUUID(updatedUser.uuid);
      setUser(updatedUser);
      Alert.alert('Başarılı!', 'Eski verileriniz bu cihaza başarıyla aktarıldı.', [
        { 
          text: 'Tamam', 
          onPress: async () => {
            if (fromOnboarding) {
              await SecureStore.setItemAsync('hasSeenWelcome', 'true');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } else {
              navigation.goBack();
            }
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Transfer başarısız. Kodu kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}></Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Cihazımı Değiştir</Text>
        <Text style={styles.description}>
          Verileriniz anonim olarak tutulur. Eski telefonunuzdaki verileri buraya aktarmak için eski telefondan bir kod oluşturun ve buraya girin.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eski Cihazımdan Aktar</Text>
          <TextInput
            style={styles.input}
            placeholder="6 Haneli Kod"
            placeholderTextColor="#475569"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity 
            style={[styles.button, code.length !== 6 && styles.buttonDisabled]} 
            onPress={handleTransfer}
            disabled={code.length !== 6 || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verilerimi Getir</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bu Cihazdan Başkasına Aktar</Text>
          {generatedCode ? (
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{generatedCode}</Text>
              <Text style={styles.codeWarning}>Bu kod geçerli olduğu süre: {timeLeft || '0:00'}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.outlineButton} onPress={handleGenerateCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#38bdf8" /> : <Text style={styles.outlineButtonText}>Transfer Kodu Oluştur</Text>}
            </TouchableOpacity>
          )}
        </View>

      </View>
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
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 12 },
  description: { fontSize: 15, color: '#94a3b8', lineHeight: 22, marginBottom: 40 },
  section: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: 8, padding: 16, fontSize: 18, textAlign: 'center', letterSpacing: 4, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  button: { backgroundColor: '#38bdf8', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#0284c7', opacity: 0.5 },
  buttonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 32 },
  outlineButton: { padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#38bdf8' },
  outlineButtonText: { color: '#38bdf8', fontWeight: 'bold', fontSize: 16 },
  codeContainer: { alignItems: 'center', padding: 20, backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#38bdf8' },
  codeText: { fontSize: 36, fontWeight: 'bold', color: '#38bdf8', letterSpacing: 8 },
  codeWarning: { color: '#94a3b8', fontSize: 12, marginTop: 8 }
});
