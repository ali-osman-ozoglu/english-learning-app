import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { fetchReading, evaluateWriting, ReadingText, WritingEvaluation, submitProgress } from '../api/contentApi';
import { ProgressBar } from '../components/ProgressBar';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Listening'>;
};

export default function ListeningScreen({ navigation }: Props) {
  const { user, updateUser } = useUserStore();
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [writtenText, setWrittenText] = useState('');
  
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);

  useEffect(() => {
    loadTexts();
    return () => {
        Speech.stop();
    };
  }, []);

  const loadTexts = async () => {
    if (!user?.uuid) return;
    setLoading(true);
    try {
      const data = await fetchReading(user.uuid, 'listening');
      if (data.length === 0) {
        Alert.alert('Bilgi', 'Şu an bu seviye için içerik bulunamadı.');
        navigation.goBack();
      } else {
        setTexts(data);
      }
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.quotaFull) {
        Alert.alert('Bilgi', error.response.data.message || 'Tebrikler! Günlük hedefinizi tamamladınız.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Hata', 'İçerikler yüklenemedi.');
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
      if (texts.length === 0) return;
      const currentQ = texts[currentIndex];
      Speech.stop();
      Speech.speak(currentQ.englishText, { language: 'en-US', rate: 0.85 }); // Okuma hızını hafif düşürdük
  };

  const submitDictation = async () => {
      if (!writtenText.trim()) {
          Alert.alert('Uyarı', 'Lütfen duyduğunuz metni yazın.');
          return;
      }
      
      setEvaluating(true);
      const currentQ = texts[currentIndex];
      try {
        const result = await evaluateWriting(currentQ.englishText, writtenText, 'dictation');
        setEvaluation(result);

        if (user?.uuid) {
            try {
                const progRes = await submitProgress(user.uuid, currentQ._id, 'listening', false, result.score);
                if (progRes.levelUpOccurred) {
                    Alert.alert('🎉 Seviye Atladınız!', `Tebrikler! Dinleme seviyeniz ${progRes.newLevel} oldu.`);
                    if (user.level) updateUser({ level: { ...user.level, listening: progRes.newLevel } });
                } else if (progRes.levelUpBlocked) {
                    Alert.alert('Bilgi', progRes.balanceWarning || 'Diğer modülleri geliştirmeniz gerekiyor.');
                }
                
                updateUser({ 
                  progress: { ...user.progress, listening: progRes.currentProgress },
                  dailyQuotas: progRes.dailyQuotas
                });
            } catch(e) { console.error(e); }
        }

      } catch(e) {
          Alert.alert('Hata', 'Değerlendirme yapılamadı.');
      } finally {
        setEvaluating(false);
      }
  };

  const nextText = () => {
    setWrittenText('');
    setEvaluation(null);
    if (currentIndex < texts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Liste bitti, yenisini yükle
      setCurrentIndex(0);
      loadTexts();
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  if (texts.length === 0) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => { Speech.stop(); navigation.goBack(); }}>
                <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
        </View>

        <ProgressBar 
            currentLevel={user?.level?.listening || 'A1'} 
            progress={user?.progress?.listening || 0} 
        />

        <View style={styles.card}>
            <Text style={styles.levelBadge}>{user?.level?.listening} Seviyesi - Dikte Görevi</Text>
            <Text style={styles.instructionText}>Metni dinlemek için butona basın ve duyduğunuzu İngilizce olarak aşağıya yazın.</Text>
            
            <TouchableOpacity style={styles.playButton} onPress={playAudio} activeOpacity={0.8}>
                <Text style={styles.playButtonIcon}>🔊</Text>
                <Text style={styles.playButtonText}>Sesi Oynat</Text>
            </TouchableOpacity>
        </View>

        {!evaluation && (
            <TextInput
                style={styles.input}
                multiline
                placeholder="Duyduğunuz metni yazın..."
                placeholderTextColor="#64748b"
                value={writtenText}
                onChangeText={setWrittenText}
            />
        )}

        {evaluation && (
            <View style={styles.evaluationCard}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Doğruluk Skoru:</Text>
                    <Text style={[styles.scoreValue, { color: evaluation.score > 70 ? '#10b981' : (evaluation.score > 40 ? '#f59e0b' : '#ef4444') }]}>
                        %{evaluation.score}
                    </Text>
                </View>
                <Text style={styles.feedbackText}>{evaluation.feedback}</Text>
                <View style={styles.correctedContainer}>
                    <Text style={styles.correctedLabel}>Asıl Metin:</Text>
                    <Text style={styles.correctedText}>{evaluation.correctedText}</Text>
                </View>
            </View>
        )}

        <View style={styles.footer}>
            {evaluating ? (
                <ActivityIndicator size="large" color="#ec4899" />
            ) : evaluation ? (
                <TouchableOpacity style={styles.nextButton} onPress={nextText} activeOpacity={0.8}>
                    <Text style={styles.nextButtonText}>Sıradaki Göreve Geç</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity 
                    style={[styles.submitButton, !writtenText.trim() && styles.submitButtonDisabled]} 
                    onPress={submitDictation}
                    disabled={!writtenText.trim()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitButtonText}>Değerlendir (AI)</Text>
                </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flexGrow: 1, padding: 24 },
  centerContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  closeBtn: { color: '#94a3b8', fontSize: 24, fontWeight: 'bold' },
  progressText: { color: '#ec4899', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#1e293b', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 30, alignItems: 'center' },
  levelBadge: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  instructionText: { color: '#cbd5e1', fontSize: 16, marginBottom: 24, textAlign: 'center', lineHeight: 24 },
  playButton: { backgroundColor: 'rgba(236, 72, 153, 0.15)', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 99, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.3)' },
  playButtonIcon: { fontSize: 24, marginRight: 12 },
  playButtonText: { color: '#ec4899', fontSize: 18, fontWeight: 'bold' },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 20, borderRadius: 16, minHeight: 180, textAlignVertical: 'top', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 30 },
  evaluationCard: { backgroundColor: 'rgba(236, 72, 153, 0.1)', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.3)', marginBottom: 30 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(236, 72, 153, 0.2)' },
  scoreLabel: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold' },
  scoreValue: { fontSize: 24, fontWeight: '900' },
  feedbackText: { color: '#f8fafc', fontSize: 16, lineHeight: 24, marginBottom: 20 },
  correctedContainer: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 16, borderRadius: 12 },
  correctedLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 },
  correctedText: { color: '#10b981', fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 'auto', marginBottom: 20 },
  submitButton: { backgroundColor: '#ec4899', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitButtonDisabled: { backgroundColor: '#9d174d', opacity: 0.5, shadowOpacity: 0 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nextButton: { backgroundColor: '#10b981', padding: 20, borderRadius: 16, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
