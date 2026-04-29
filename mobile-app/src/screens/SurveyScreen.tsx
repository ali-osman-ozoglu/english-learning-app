import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { apiClient } from '../api/apiClient';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Survey'>;
};

type Question = {
  id: number;
  type: 'choice' | 'text';
  text: string;
  options?: string[];
};

const QUESTIONS: Question[] = [
  { id: 1, type: 'choice', text: 'İngilizce öğrenme geçmişiniz nedir?', options: ['Hiç eğitim almadım', 'Okulda zorunlu ders olarak gördüm', 'Özel kursa gittim', 'Kendi kendime öğrendim'] },
  { id: 2, type: 'choice', text: 'Günlük hayatınızda İngilizceyi ne sıklıkla kullanıyorsunuz?', options: ['Hiç', 'Nadiren', 'Haftada birkaç kez', 'Her gün'] },
  { id: 3, type: 'text', text: 'İngilizce öğrenmekteki temel amacınız nedir? (Kısaca açıklayın)' },
  { id: 4, type: 'choice', text: 'Boşluğu doldurun: I ___ a student.', options: ['am', 'is', 'are', 'be'] },
  { id: 5, type: 'choice', text: 'Boşluğu doldurun: She ___ to the store yesterday.', options: ['goes', 'go', 'went', 'gone'] },
  { id: 6, type: 'choice', text: 'Hangi cümle dilbilgisi açısından DOĞRUDUR?', options: ["He don't like pizza", "He doesn't likes pizza", "He doesn't like pizza", "He not like pizza"] },
  { id: 7, type: 'choice', text: 'İngilizce bir film izlerken altyazısız ne kadar anlarsınız?', options: ['%0-20 (Neredeyse hiç)', '%20-50 (Biraz)', '%50-80 (Çoğunu)', '%80-100 (Tamamını)'] },
  { id: 8, type: 'text', text: 'Şu anki ruh halinizi veya bugünün nasıl geçtiğini İngilizce olarak 2-3 cümleyle anlatır mısınız?' },
  { id: 9, type: 'choice', text: 'Boşluğu doldurun: If I ___ you, I would study harder.', options: ['am', 'was', 'were', 'be'] },
  { id: 10, type: 'choice', text: 'Hangisi "important" (önemli) kelimesinin eş anlamlısıdır?', options: ['crucial', 'trivial', 'minor', 'unknown'] },
  { id: 11, type: 'choice', text: 'Boşluğu doldurun: By the time we arrived, the movie ___.', options: ['started', 'has started', 'had started', 'was starting'] },
  { id: 12, type: 'text', text: 'Aşağıdaki İngilizce metni Türkçe olarak özetleyin: "Despite the heavy rain, the team managed to complete the project ahead of schedule, proving their extraordinary dedication."' },
  { id: 13, type: 'choice', text: '"It’s raining cats and dogs" deyimi ne anlama gelir?', options: ['Kedi ve köpek yağıyor', 'Çok şiddetli yağmur yağıyor', 'Hayvanlar ıslanıyor', 'Hava çok güneşli'] },
  { id: 14, type: 'choice', text: 'Hangisi "to put off" (phrasal verb) ifadesinin anlamıdır?', options: ['Giyinmek', 'Ertelenmek / Ertelemek', 'Söndürmek', 'Başlamak'] },
  { id: 15, type: 'text', text: 'Gelecek 5 yıl içindeki planlarınızı ve hayallerinizi İngilizce olarak detaylı bir şekilde anlatın.' },
];

export default function SurveyScreen({ navigation }: Props) {
  const { user, setUser } = useUserStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(QUESTIONS.map(q => ({ q: q.text, a: '' })));
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await submitSurvey();
    }
  };

  const submitSurvey = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/assessment/evaluate', {
        uuid: user?.uuid,
        answers
      });
      setUser(response.data.user);
      navigation.replace('SurveyResult', { evaluation: response.data.evaluation });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Anket değerlendirilemedi. Sunucu bağlantısını veya API ayarlarını kontrol edin.';
      Alert.alert('Hata', msg);
      setLoading(false);
    }
  };

  const currentQ = QUESTIONS[step];
  const currentAnswer = answers[step].a;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.progressText}>Soru {step + 1} / {QUESTIONS.length}</Text>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${((step + 1) / QUESTIONS.length) * 100}%` }]} />
            </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.questionText}>{currentQ.text}</Text>
            
            {currentQ.type === 'text' ? (
                <TextInput
                    style={styles.input}
                    multiline
                    placeholder="Cevabınızı buraya yazın..."
                    placeholderTextColor="#475569"
                    value={currentAnswer}
                    onChangeText={(val) => {
                        const newAnswers = [...answers];
                        newAnswers[step].a = val;
                        setAnswers(newAnswers);
                    }}
                />
            ) : (
                <View style={styles.optionsContainer}>
                    {currentQ.options?.map((opt, idx) => (
                        <TouchableOpacity 
                            key={idx} 
                            style={[styles.optionCard, currentAnswer === opt && styles.optionCardSelected]}
                            onPress={() => {
                                const newAnswers = [...answers];
                                newAnswers[step].a = opt;
                                setAnswers(newAnswers);
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.radioCircle, currentAnswer === opt && styles.radioCircleSelected]}>
                                {currentAnswer === opt && <View style={styles.radioInner} />}
                            </View>
                            <Text style={[styles.optionText, currentAnswer === opt && styles.optionTextSelected]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.button, !currentAnswer.trim() && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={!currentAnswer.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>{step === QUESTIONS.length - 1 ? 'Tamamla ve AI ile Analiz Et' : 'Devam Et'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 24 },
  header: { marginBottom: 30, marginTop: 10 },
  progressText: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  progressBarBg: { height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: 3 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  questionText: { color: '#f8fafc', fontSize: 22, fontWeight: '600', marginBottom: 30, lineHeight: 32 },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 20, borderRadius: 16, minHeight: 150, textAlignVertical: 'top', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 30 },
  optionsContainer: { gap: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  optionCardSelected: { borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.05)' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#64748b', marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  radioCircleSelected: { borderColor: '#38bdf8' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#38bdf8' },
  optionText: { color: '#cbd5e1', fontSize: 16, flex: 1 },
  optionTextSelected: { color: '#f8fafc', fontWeight: 'bold' },
  button: { backgroundColor: '#38bdf8', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginTop: 20 },
  buttonDisabled: { backgroundColor: '#0284c7', opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: '#0f172a', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
});
