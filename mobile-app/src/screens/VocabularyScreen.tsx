import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { fetchVocabulary, VocabQuestion, submitProgress } from '../api/contentApi';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Vocabulary'>;
};

export default function VocabularyScreen({ navigation }: Props) {
  const { user, updateUser } = useUserStore();
  const [questions, setQuestions] = useState<VocabQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    if (!user?.uuid) return;
    setLoading(true);
    try {
      const data = await fetchVocabulary(user.uuid);
      if (data.length === 0) {
        Alert.alert('Bilgi', 'Şu an bu seviye için kelime bulunamadı.');
        navigation.goBack();
      } else {
        setQuestions(data);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kelimeler yüklenemedi.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleOptionPress = async (option: string) => {
    if (selectedOption !== null) return; // Zaten cevap verildiyse tıklamayı engelle
    
    const currentQ = questions[currentIndex];
    setSelectedOption(option);
    const correct = option === currentQ.correctAnswer;
    setIsCorrect(correct);
    
    if (user?.uuid) {
        try {
            const res = await submitProgress(user.uuid, currentQ._id, 'vocabulary', correct);
            if (res.levelUpOccurred) {
                Alert.alert('🎉 Seviye Atladınız!', `Tebrikler! Kelime seviyeniz ${res.newLevel} oldu.`);
                if (user.level) {
                    updateUser({ level: { ...user.level, vocabulary: res.newLevel } });
                }
            }
        } catch(e) {
            console.error('Submit progress failed', e);
        }
    }

    // 1.5 saniye sonra diğer soruya geç
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        Alert.alert('Tebrikler!', 'Günün kelime hedefini tamamladınız.', [
            { text: 'Ana Menüye Dön', onPress: () => navigation.goBack() }
        ]);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={{color: '#94a3b8', marginTop: 10}}>Kelimeler Hazırlanıyor...</Text>
      </View>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.progressText}>{currentIndex + 1} / {questions.length}</Text>
        </View>

        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>

        <View style={styles.card}>
            <Text style={styles.levelBadge}>{user?.level?.vocabulary} Seviyesi</Text>
            <Text style={styles.englishWord}>{currentQ.englishText}</Text>
            {currentQ.wordType && (
              <View style={styles.wordTypeBadge}>
                <Text style={styles.wordTypeText}>{currentQ.wordType}</Text>
              </View>
            )}
        </View>

        <View style={styles.optionsContainer}>
            {currentQ.options.map((option, idx) => {
                let bgColor = '#1e293b';
                let borderColor = '#334155';
                let textColor = '#cbd5e1';

                if (selectedOption !== null) {
                    if (option === currentQ.correctAnswer) {
                        bgColor = 'rgba(34, 197, 94, 0.2)'; // Yeşil
                        borderColor = '#22c55e';
                        textColor = '#22c55e';
                    } else if (option === selectedOption && !isCorrect) {
                        bgColor = 'rgba(239, 68, 68, 0.2)'; // Kırmızı
                        borderColor = '#ef4444';
                        textColor = '#ef4444';
                    } else {
                        // Diğer şıkları soluklaştır
                        textColor = '#64748b';
                    }
                }

                return (
                    <TouchableOpacity 
                        key={idx} 
                        style={[styles.optionButton, { backgroundColor: bgColor, borderColor }]} 
                        onPress={() => handleOptionPress(option)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 24 },
  centerContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  closeBtn: { color: '#94a3b8', fontSize: 24, fontWeight: 'bold' },
  progressText: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden', marginBottom: 40 },
  progressBarFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: 3 },
  card: { alignItems: 'center', marginBottom: 40 },
  levelBadge: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  englishWord: { color: '#f8fafc', fontSize: 42, fontWeight: '900', letterSpacing: 1 },
  wordTypeBadge: { marginTop: 12, backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  wordTypeText: { color: '#cbd5e1', fontSize: 14, fontWeight: '600', fontStyle: 'italic' },
  optionsContainer: { gap: 16 },
  optionButton: { padding: 20, borderRadius: 16, borderWidth: 2, alignItems: 'center' },
  optionText: { fontSize: 18, fontWeight: '700' },
});
