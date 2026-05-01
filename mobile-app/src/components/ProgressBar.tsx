import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  currentLevel: string;
  progress: number; // 0 to 100
}

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentLevel, progress }) => {
  const currentIndex = levels.indexOf(currentLevel);
  const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'MAX';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>{currentLevel}</Text>
        <Text style={styles.levelText}>{nextLevel}</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.percentageText}>%{Math.round(progress)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 4,
  },
  percentageText: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
