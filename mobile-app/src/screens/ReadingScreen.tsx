import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { fetchReading, evaluateReading, ReadingText, submitProgress } from '../api/contentApi';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reading'>;
};

export default function ReadingScreen({ navigation }: Props) {
  const { user, updateUser } = useUserStore();
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{ accuracyScore: number, wrongWords: string[] } | null>(null);

  useEffect(() => {
    loadTexts();
    
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const loadTexts = async () => {
    if (!user?.uuid) return;
    setLoading(true);
    try {
      const data = await fetchReading(user.uuid, 'reading');
      if (data.length === 0) {
        Alert.alert('Bilgi', 'Şu an bu seviye için okuma metni bulunamadı.');
        navigation.goBack();
      } else {
        setTexts(data);
      }
    } catch (error) {
      Alert.alert('Hata', 'Metinler yüklenemedi.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      setSpokenText(e.value[0]);
    }
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.log('Speech Error:', e.error);
    
    // 7: No match (sessizlik), 11: Didn't understand (anlaşılamadı)
    // Eğer kullanıcı henüz "Durdur"a basmadıysa, otomatik olarak tekrar başlatıyoruz.
    const errorCode = e.error?.code;
    if (errorCode === '7' || errorCode === '11') {
        Voice.start('en-US', {
            RECOGNIZER_ENGINE: 'GOOGLE',
            EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 10000,
            EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 10000,
            EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 10000,
        });
        return;
    }

    setIsRecording(false);
    Alert.alert('Mikrofon Hatası', 'Sesiniz anlaşılamadı veya yetki sorunu var.');
  };

  const startRecording = async () => {
    try {
      // Modülün yüklü olup olmadığını kontrol et
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        Alert.alert('Hata', 'Ses tanıma modülü bu cihazda kullanılamıyor. Lütfen izinleri kontrol edin veya uygulamayı yeniden derleyin.');
        return;
      }

      setSpokenText('');
      setEvaluation(null);
      await Voice.start('en-US', {
        RECOGNIZER_ENGINE: 'GOOGLE',
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 10000,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 10000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 10000,
      });
      setIsRecording(true);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('null')) {
        Alert.alert('Native Module Hatası', 'Ses tanıma kütüphanesi (Native) yüklenemedi. Lütfen terminalde "npx expo prebuild" komutunu çalıştırıp Android Studio\'dan tekrar derleyin.');
      }
    }
  };

  const stopRecording = async () => {
    try {
        await Voice.stop();
        setIsRecording(false);
    } catch (e) {
        console.log('Stop Recording Error:', e);
        setIsRecording(false);
    }
  };

  const performEvaluation = async () => {
    if (!spokenText.trim()) {
        Alert.alert('Uyarı', 'Lütfen sesli olarak okuyun.');
        return;
    }
    
    try {
      setEvaluating(true);
      const currentQ = texts[currentIndex];
      const result = await evaluateReading(currentQ.englishText, spokenText);
      setEvaluation(result);

      if (user?.uuid) {
          try {
              const progRes = await submitProgress(user.uuid, currentQ._id, 'reading', false, result.accuracyScore);
              if (progRes.levelUpOccurred) {
                  Alert.alert('🎉 Seviye Atladınız!', `Tebrikler! Okuma seviyeniz ${progRes.newLevel} oldu.`);
                  if (user.level) updateUser({ level: { ...user.level, reading: progRes.newLevel } });
              }
          } catch(e) {
              console.error(e);
          }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Analiz yapılırken bir sorun oluştu.');
    } finally {
      setEvaluating(false);
    }
  };

  const nextText = () => {
    setSpokenText('');
    setEvaluation(null);
    if (currentIndex < texts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('Tebrikler!', 'Günün okuma hedefini tamamladınız.', [
        { text: 'Ana Menüye Dön', onPress: () => navigation.goBack() }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (texts.length === 0) return null;

  const currentQ = texts[currentIndex];
  
  // Asıl metni, hatalı kelimeler varsa kırmızı işaretleyerek render et
  const renderText = () => {
      if (!evaluation) return <Text style={styles.englishText}>{currentQ.englishText}</Text>;
      
      const words = currentQ.englishText.split(' ');
      return (
          <Text style={styles.englishText}>
              {words.map((word, i) => {
                  const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
                  const isWrong = evaluation.wrongWords.some(w => w.toLowerCase() === cleanWord);
                  return (
                      <Text key={i} style={{ color: isWrong ? '#ef4444' : '#22c55e' }}>
                          {word}{' '}
                      </Text>
                  );
              })}
          </Text>
      );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.progressText}>{currentIndex + 1} / {texts.length}</Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.levelBadge}>{user?.level?.reading} Seviyesi</Text>
            {renderText()}
            
            {evaluation && (
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>Doğruluk: %{evaluation.accuracyScore}</Text>
                </View>
            )}
        </View>

        <View style={styles.spokenContainer}>
            <Text style={styles.spokenLabel}>Sizin Okuduğunuz:</Text>
            <Text style={styles.spokenText}>{spokenText || '...'}</Text>
        </View>

        <View style={styles.footer}>
            {evaluating ? (
                <ActivityIndicator size="large" color="#f59e0b" />
            ) : evaluation ? (
                <TouchableOpacity style={styles.nextButton} onPress={nextText}>
                    <Text style={styles.nextButtonText}>Sıradaki Metne Geç</Text>
                </TouchableOpacity>
            ) : isRecording ? (
                <TouchableOpacity style={[styles.recordButton, styles.recordButtonActive]} onPress={stopRecording}>
                    <Text style={styles.recordButtonText}>Durdur</Text>
                </TouchableOpacity>
            ) : spokenText.trim() !== '' ? (
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={startRecording}>
                        <Text style={styles.secondaryButtonText}>Tekrar Dene</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.analyzeButton} onPress={performEvaluation}>
                        <Text style={styles.nextButtonText}>Analiz Et</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                    <Text style={styles.recordButtonText}>Mikrofona Bas ve Oku</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 24 },
  centerContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  closeBtn: { color: '#94a3b8', fontSize: 24, fontWeight: 'bold' },
  progressText: { color: '#f59e0b', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#1e293b', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#334155', minHeight: 200, justifyContent: 'center' },
  levelBadge: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, textAlign: 'center' },
  englishText: { color: '#f8fafc', fontSize: 28, fontWeight: '800', lineHeight: 40, textAlign: 'center' },
  scoreContainer: { marginTop: 20, backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 10, borderRadius: 10, alignSelf: 'center' },
  scoreText: { color: '#22c55e', fontWeight: 'bold', fontSize: 16 },
  spokenContainer: { marginTop: 30, padding: 20, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 12 },
  spokenLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  spokenText: { color: '#cbd5e1', fontSize: 16, fontStyle: 'italic' },
  footer: { marginTop: 'auto', marginBottom: 20 },
  recordButton: { backgroundColor: '#f59e0b', padding: 20, borderRadius: 16, alignItems: 'center' },
  recordButtonActive: { backgroundColor: '#ef4444' },
  recordButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nextButton: { backgroundColor: '#10b981', padding: 20, borderRadius: 16, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  secondaryButton: { flex: 1, backgroundColor: '#334155', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#475569' },
  secondaryButtonText: { color: '#cbd5e1', fontSize: 18, fontWeight: 'bold' },
  analyzeButton: { flex: 1, backgroundColor: '#f59e0b', padding: 20, borderRadius: 16, alignItems: 'center' },
});
