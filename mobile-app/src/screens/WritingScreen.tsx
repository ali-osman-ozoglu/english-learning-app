import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, TextInput, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { fetchReading, evaluateWriting, ReadingText, WritingEvaluation, submitProgress } from '../api/contentApi';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Writing'>;
};

export default function WritingScreen({ navigation }: Props) {
  const { user, updateUser } = useUserStore();
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [writtenText, setWrittenText] = useState('');
  
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    if (!user?.uuid) return;
    setLoading(true);
    try {
      // Reading modülündeki verileri cümle/paragraf olarak yazma pratiği için kullanıyoruz
      const data = await fetchReading(user.uuid, 'writing');
      if (data.length === 0) {
        Alert.alert('Bilgi', 'Şu an bu seviye için içerik bulunamadı.');
        navigation.goBack();
      } else {
        setTexts(data);
      }
    } catch (error) {
      Alert.alert('Hata', 'İçerikler yüklenemedi.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const submitWriting = async () => {
      if (!writtenText.trim()) {
          Alert.alert('Uyarı', 'Lütfen bir şeyler yazın.');
          return;
      }
      
      setEvaluating(true);
      const currentQ = texts[currentIndex];
      try {
        const result = await evaluateWriting(currentQ.englishText, writtenText, 'translation');
        setEvaluation(result);

        if (user?.uuid) {
            try {
                const progRes = await submitProgress(user.uuid, currentQ._id, 'writing', false, result.score);
                if (progRes.levelUpOccurred) {
                    Alert.alert('🎉 Seviye Atladınız!', `Tebrikler! Yazma seviyeniz ${progRes.newLevel} oldu.`);
                    if (user.level) updateUser({ level: { ...user.level, writing: progRes.newLevel } });
                }
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
      Alert.alert('Tebrikler!', 'Günün yazma hedefini tamamladınız.', [
        { text: 'Ana Menüye Dön', onPress: () => navigation.goBack() }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  if (texts.length === 0) return null;

  const currentQ = texts[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.progressText}>{currentIndex + 1} / {texts.length}</Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.levelBadge}>{user?.level?.writing} Seviyesi - Çeviri Görevi</Text>
            <Text style={styles.instructionText}>Aşağıdaki Türkçe metni İngilizceye çevirin:</Text>
            <Text style={styles.turkishText}>{currentQ.turkishTranslation}</Text>
        </View>

        {!evaluation && (
            <TextInput
                style={styles.input}
                multiline
                placeholder="İngilizce çevirinizi buraya yazın..."
                placeholderTextColor="#64748b"
                value={writtenText}
                onChangeText={setWrittenText}
            />
        )}

        {evaluation && (
            <View style={styles.evaluationCard}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Başarı Skoru:</Text>
                    <Text style={[styles.scoreValue, { color: evaluation.score > 70 ? '#10b981' : (evaluation.score > 40 ? '#f59e0b' : '#ef4444') }]}>
                        %{evaluation.score}
                    </Text>
                </View>
                <Text style={styles.feedbackText}>{evaluation.feedback}</Text>
                <View style={styles.correctedContainer}>
                    <Text style={styles.correctedLabel}>Doğru / Düzeltilmiş Hali:</Text>
                    <Text style={styles.correctedText}>{evaluation.correctedText}</Text>
                </View>
            </View>
        )}

        <View style={styles.footer}>
            {evaluating ? (
                <ActivityIndicator size="large" color="#a855f7" />
            ) : evaluation ? (
                <TouchableOpacity style={styles.nextButton} onPress={nextText} activeOpacity={0.8}>
                    <Text style={styles.nextButtonText}>Sıradaki Göreve Geç</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity 
                    style={[styles.submitButton, !writtenText.trim() && styles.submitButtonDisabled]} 
                    onPress={submitWriting}
                    disabled={!writtenText.trim()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitButtonText}>AI Öğretmene Gönder</Text>
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
  progressText: { color: '#a855f7', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#1e293b', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 30 },
  levelBadge: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  instructionText: { color: '#cbd5e1', fontSize: 16, marginBottom: 12 },
  turkishText: { color: '#f8fafc', fontSize: 22, fontWeight: '800', lineHeight: 32 },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 20, borderRadius: 16, minHeight: 180, textAlignVertical: 'top', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 30 },
  evaluationCard: { backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.3)', marginBottom: 30 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(168, 85, 247, 0.2)' },
  scoreLabel: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold' },
  scoreValue: { fontSize: 24, fontWeight: '900' },
  feedbackText: { color: '#f8fafc', fontSize: 16, lineHeight: 24, marginBottom: 20 },
  correctedContainer: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 16, borderRadius: 12 },
  correctedLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 },
  correctedText: { color: '#10b981', fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 'auto', marginBottom: 20 },
  submitButton: { backgroundColor: '#a855f7', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#a855f7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitButtonDisabled: { backgroundColor: '#7e22ce', opacity: 0.5, shadowOpacity: 0 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nextButton: { backgroundColor: '#10b981', padding: 20, borderRadius: 16, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
