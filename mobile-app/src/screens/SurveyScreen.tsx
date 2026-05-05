import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { apiClient } from '../api/apiClient';

import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Survey'>;
  route: RouteProp<RootStackParamList, 'Survey'>;
};

type Question = {
  id: number;
  type: 'choice' | 'text';
  text: string;
  options?: string[];
};

const QUESTIONS_BY_LANGUAGE: Record<string, Question[]> = {
  en: [
    // Demografik ve Genel Sorular (7 Soru)
    { id: 1, type: 'text', text: 'Okuduğunuz veya mezun olduğunuz okulun adı nedir?' },
    { id: 2, type: 'text', text: 'Hangi bölümde okuyorsunuz / okudunuz?' },
    { id: 3, type: 'text', text: 'Şu anki mesleğiniz nedir? (Öğrenciyseniz "Öğrenci" yazabilirsiniz)' },
    { id: 4, type: 'choice', text: 'İngilizce öğrenme geçmişiniz nedir?', options: ['Hiç eğitim almadım', 'Okulda zorunlu ders olarak gördüm', 'Özel kursa gittim', 'Kendi kendime öğrendim'] },
    { id: 5, type: 'choice', text: 'Günlük hayatınızda İngilizceyi ne sıklıkla kullanıyorsunuz?', options: ['Hiç', 'Nadiren', 'Haftada birkaç kez', 'Her gün'] },
    { id: 6, type: 'text', text: 'İngilizce öğrenmekteki temel amacınız nedir? (Kısaca açıklayın)' },
    { id: 7, type: 'choice', text: 'İngilizce bir film izlerken altyazısız ne kadar anlarsınız?', options: ['%0-20 (Neredeyse hiç)', '%20-50 (Biraz)', '%50-80 (Çoğunu)', '%80-100 (Tamamını)'] },
    
    // A1 Seviyesi (6 Soru)
    { id: 8, type: 'choice', text: 'Boşluğu doldurun: I ___ a student.', options: ['am', 'is', 'are', 'be'] },
    { id: 9, type: 'choice', text: '"Apple" kelimesinin Türkçe karşılığı nedir?', options: ['Elma', 'Armut', 'Çilek', 'Kiraz'] },
    { id: 10, type: 'choice', text: 'Boşluğu doldurun: He ___ a dog.', options: ['have', 'has', 'having', 'had'] },
    { id: 11, type: 'choice', text: 'Hangi kelime bir rengi ifade ETMEZ?', options: ['Red', 'Blue', 'Table', 'Green'] },
    { id: 12, type: 'choice', text: 'Boşluğu doldurun: I like ___ books.', options: ['read', 'reading', 'to reading', 'reads'] },
    { id: 13, type: 'choice', text: '"Good morning" ne zaman söylenir?', options: ['Akşam', 'Gece', 'Sabah', 'Öğleden Sonra'] },

    // A2 Seviyesi (6 Soru)
    { id: 14, type: 'choice', text: 'Boşluğu doldurun: She ___ to the store yesterday.', options: ['goes', 'go', 'went', 'gone'] },
    { id: 15, type: 'choice', text: '"Beautiful" kelimesinin zıt anlamlısı nedir?', options: ['Ugly', 'Pretty', 'Handsome', 'Nice'] },
    { id: 16, type: 'choice', text: 'Boşluğu doldurun: I am taller ___ my brother.', options: ['then', 'than', 'that', 'this'] },
    { id: 17, type: 'choice', text: 'Hangi kelime "hızlı" anlamına gelir?', options: ['Slow', 'Fast', 'Hard', 'Soft'] },
    { id: 18, type: 'choice', text: 'Boşluğu doldurun: I have never ___ to Paris.', options: ['be', 'was', 'been', 'being'] },
    { id: 19, type: 'choice', text: 'Boşluğu doldurun: Can you ___ me a favor?', options: ['do', 'make', 'take', 'give'] },

    // B1 Seviyesi (5 Soru)
    { id: 20, type: 'choice', text: 'Boşluğu doldurun: If I ___ you, I would study harder.', options: ['am', 'was', 'were', 'be'] },
    { id: 21, type: 'choice', text: 'Hangi cümle dilbilgisi açısından DOĞRUDUR?', options: ["He don't like pizza", "He doesn't likes pizza", "He doesn't like pizza", "He not like pizza"] },
    { id: 22, type: 'choice', text: 'Hangisi "important" (önemli) kelimesinin eş anlamlısıdır?', options: ['crucial', 'trivial', 'minor', 'unknown'] },
    { id: 23, type: 'text', text: 'Şu anki ruh halinizi veya bugünün nasıl geçtiğini İngilizce olarak 2-3 cümleyle anlatır mısınız?' },
    { id: 24, type: 'choice', text: 'Boşluğu doldurun: He is interested ___ learning English.', options: ['on', 'at', 'in', 'to'] },

    // B2 Seviyesi (5 Soru)
    { id: 25, type: 'choice', text: 'Boşluğu doldurun: By the time we arrived, the movie ___.', options: ['started', 'has started', 'had started', 'was starting'] },
    { id: 26, type: 'choice', text: 'Hangisi "to put off" (phrasal verb) ifadesinin anlamıdır?', options: ['Ertelenmek / Ertelemek', 'Giyinmek', 'Söndürmek', 'Başlamak'] },
    { id: 27, type: 'choice', text: 'Boşluğu doldurun: She is used to ___ up early.', options: ['wake', 'woke', 'waking', 'woken'] },
    { id: 28, type: 'choice', text: 'Boşluğu doldurun: I wish I ___ more time.', options: ['have', 'had', 'has', 'having'] },
    { id: 29, type: 'choice', text: '"Breathtaking" kelimesinin Türkçe karşılığı nedir?', options: ['Sıkıcı', 'Korkutucu', 'Nefes kesici', 'Eğlenceli'] },

    // C1 Seviyesi (4 Soru)
    { id: 30, type: 'choice', text: '"It’s raining cats and dogs" deyimi ne anlama gelir?', options: ['Çok şiddetli yağmur yağıyor', 'Kedi ve köpek yağıyor', 'Hava çok güneşli', 'Hayvanlar ıslanıyor'] },
    { id: 31, type: 'text', text: 'Aşağıdaki İngilizce metni Türkçe olarak özetleyin: "Despite the heavy rain, the team managed to complete the project ahead of schedule, proving their extraordinary dedication."' },
    { id: 32, type: 'choice', text: 'Boşluğu doldurun: Scarcely had I arrived ___ it started to rain.', options: ['when', 'than', 'then', 'that'] },
    { id: 33, type: 'choice', text: '"To turn a blind eye" deyimi ne anlama gelir?', options: ['Görmezden gelmek', 'Kör olmak', 'Çok dikkatli bakmak', 'Göz kırpmak'] },

    // C2 Seviyesi (4 Soru)
    { id: 34, type: 'choice', text: '"Ubiquitous" kelimesinin en yakın anlamlısı nedir?', options: ['Omnipresent', 'Rare', 'Harmful', 'Beneficial'] },
    { id: 35, type: 'text', text: 'Gelecek 5 yıl içindeki planlarınızı ve hayallerinizi İngilizce olarak detaylı bir şekilde anlatın.' },
    { id: 36, type: 'choice', text: 'Boşluğu doldurun: His argument was so ___ that everyone agreed with him.', options: ['convoluted', 'compelling', 'fallacious', 'ambiguous'] },
    { id: 37, type: 'choice', text: '"Mitigate" kelimesinin eş anlamlısı nedir?', options: ['Aggravate', 'Alleviate', 'Instigate', 'Obfuscate'] },
  ]
};

export default function SurveyScreen({ navigation, route }: Props) {
  const { user, setUser } = useUserStore();
  const { language = 'en' } = route.params || {};
  const QUESTIONS = QUESTIONS_BY_LANGUAGE[language] || QUESTIONS_BY_LANGUAGE['en'];

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
