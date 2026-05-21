import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { fetchReading, evaluateReading, ReadingText, submitProgress } from '../api/contentApi';
import { ProgressBar } from '../components/ProgressBar';

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
  const [evaluation, setEvaluation] = useState<{ accuracyScore: number, wrongWords: string[], feedback?: string } | null>(null);
  const isManualStopRef = useRef(false);
  const committedTextRef = useRef('');
  const retryCountRef = useRef(0);

  useEffect(() => {
    loadTexts();
    return () => {
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  useSpeechRecognitionEvent('start', () => {
    console.log('Speech Started');
    setIsRecording(true);
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('Speech Ended');
    setIsRecording(false);
  });

  useSpeechRecognitionEvent('result', (e) => {
    if (e.results && e.results.length > 0) {
      const resultPart = e.results[0].transcript;
      if (e.isFinal) {
        committedTextRef.current = (committedTextRef.current + ' ' + resultPart).trim();
        setSpokenText(committedTextRef.current);
      } else {
        const fullText = (committedTextRef.current + ' ' + resultPart).trim();
        setSpokenText(fullText);
      }
    }
  });

  useSpeechRecognitionEvent('error', (e) => {
    const errorCode = e.error;
    console.log('Speech Error (Code ' + errorCode + '):', e.message);
    
    if (isManualStopRef.current) return;

    if (errorCode === 'no-speech' || errorCode === 'network' || errorCode === 'aborted') {
        setIsRecording(false);
        return;
    }

    setIsRecording(false);
    Alert.alert('Mikrofon Hatası (' + errorCode + ')', 'Sesiniz anlaşılamadı veya teknik bir sorun oluştu.');
  });

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
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.quotaFull) {
        Alert.alert('Bilgi', error.response.data.message || 'Tebrikler! Günlük hedefinizi tamamladınız.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Hata', 'Metinler yüklenemedi.');
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      retryCountRef.current = 0;
      await ExpoSpeechRecognitionModule.stop();
      await new Promise(resolve => setTimeout(resolve, 200));

      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Hata', 'Mikrofon veya ses tanıma izni reddedildi.');
        return;
      }

      setSpokenText('');
      setEvaluation(null);
      isManualStopRef.current = false;
      committedTextRef.current = '';
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true });
    } catch (e: any) {
      console.log('Start Error:', e);
      setIsRecording(false);
    }
  };

  const continueRecording = async () => {
    try {
      isManualStopRef.current = false;
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true });
    } catch (e) {
      console.log('Continue Error:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
        isManualStopRef.current = true;
        ExpoSpeechRecognitionModule.stop();
    } catch (e) {
        console.log('Stop Recording Error:', e);
        setIsRecording(false);
    }
  };

  const resetRecording = async () => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch (e) {}
    setSpokenText('');
    setEvaluation(null);
    committedTextRef.current = '';
    setIsRecording(false);
    retryCountRef.current = 0;
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
              } else if (progRes.levelUpBlocked) {
                  Alert.alert('Bilgi', progRes.balanceWarning || 'Diğer modülleri geliştirmeniz gerekiyor.');
              }
              
              // Her durumda store'u son ilerleme ile güncelle
              updateUser({ 
                progress: { ...user.progress, reading: progRes.currentProgress },
                dailyQuotas: progRes.dailyQuotas // Eğer API döndürüyorsa
              });
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
      // Liste bitti, yenisini yükle
      setCurrentIndex(0);
      loadTexts();
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
        </View>

        <ProgressBar 
            currentLevel={user?.level?.reading || 'A1'} 
            progress={user?.progress?.reading || 0} 
        />

        <View style={styles.card}>
            <Text style={styles.levelBadge}>{user?.level?.reading} Seviyesi</Text>
            {renderText()}
            
            {evaluation && (
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>Doğruluk: %{evaluation.accuracyScore}</Text>
                    {evaluation.feedback && (
                        <Text style={styles.feedbackText}>{evaluation.feedback}</Text>
                    )}
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
                    <MaterialIcons name="stop" size={40} color="#fff" />
                </TouchableOpacity>
            ) : spokenText.trim() !== '' ? (
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.resetButton} onPress={resetRecording}>
                        <Text style={styles.secondaryButtonText}>Sıfırla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={continueRecording}>
                        <Text style={styles.secondaryButtonText}>Devam Et</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.analyzeButton} onPress={performEvaluation}>
                        <Text style={styles.nextButtonText}>Analiz Et</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                    <MaterialIcons name="mic" size={40} color="#fff" />
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
  scoreContainer: { marginTop: 20, backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 15, borderRadius: 12, alignSelf: 'center', width: '100%', alignItems: 'center' },
  scoreText: { color: '#22c55e', fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  feedbackText: { color: '#cbd5e1', fontSize: 14, textAlign: 'center', fontStyle: 'italic', lineHeight: 20 },
  spokenContainer: { marginTop: 30, padding: 20, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 12 },
  spokenLabel: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  spokenText: { color: '#cbd5e1', fontSize: 16, fontStyle: 'italic' },
  footer: { marginTop: 'auto', marginBottom: 50, alignItems: 'center' },
  recordButton: { 
    backgroundColor: '#f59e0b', 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: { backgroundColor: '#ef4444', shadowColor: '#ef4444' },
  recordButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nextButton: { backgroundColor: '#10b981', padding: 20, borderRadius: 16, alignItems: 'center', width: '100%' },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 8 },
  resetButton: { flex: 1, backgroundColor: '#475569', padding: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { flex: 1.2, backgroundColor: '#334155', padding: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#475569' },
  secondaryButtonText: { color: '#cbd5e1', fontSize: 16, fontWeight: 'bold' },
  analyzeButton: { flex: 1.5, backgroundColor: '#f59e0b', padding: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
