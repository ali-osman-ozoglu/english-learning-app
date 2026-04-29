import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SurveyResult'>;
  route: RouteProp<RootStackParamList, 'SurveyResult'>;
};

export default function SurveyResultScreen({ navigation, route }: Props) {
  const { evaluation } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Analiz Tamamlandı! 🎯</Text>
            <Text style={styles.subtitle}>İşte yapay zeka tarafından belirlenen İngilizce profiliniz:</Text>
        </View>
        
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.skill}>Kelime Bilgisi</Text>
                <View style={styles.levelBadge}><Text style={styles.levelText}>{evaluation.vocabulary}</Text></View>
            </View>
            <View style={styles.row}>
                <Text style={styles.skill}>Okuma</Text>
                <View style={styles.levelBadge}><Text style={styles.levelText}>{evaluation.reading}</Text></View>
            </View>
            <View style={styles.row}>
                <Text style={styles.skill}>Yazma</Text>
                <View style={styles.levelBadge}><Text style={styles.levelText}>{evaluation.writing}</Text></View>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Text style={styles.skill}>Dinleme</Text>
                <View style={styles.levelBadge}><Text style={styles.levelText}>{evaluation.listening}</Text></View>
            </View>
        </View>

        <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Öğretmeninizin Notu</Text>
            <Text style={styles.explanationText}>{evaluation.explanation}</Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.replace('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Öğrenmeye Başla</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#f8fafc', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24 },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 16, marginBottom: 16 },
  skill: { color: '#e2e8f0', fontSize: 18, fontWeight: '600' },
  levelBadge: { backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  levelText: { color: '#38bdf8', fontSize: 16, fontWeight: '900' },
  explanationContainer: { backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)', marginBottom: 40 },
  explanationTitle: { color: '#fbbf24', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  explanationText: { color: '#f8fafc', fontSize: 15, lineHeight: 24 },
  button: { backgroundColor: '#38bdf8', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#0f172a', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
});
