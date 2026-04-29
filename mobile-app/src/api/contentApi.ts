import { apiClient } from './apiClient';

export interface VocabQuestion {
  _id: string;
  englishText: string;
  correctAnswer: string;
  options: string[];
  wordType?: string;
}

export const fetchVocabulary = async (uuid: string): Promise<VocabQuestion[]> => {
  const response = await apiClient.get(`/content/vocabulary?uuid=${uuid}`);
  return response.data.questions;
};

export interface ReadingText {
  _id: string;
  englishText: string;
  turkishTranslation: string;
}

export const fetchReading = async (uuid: string, module: 'reading' | 'writing' | 'listening' = 'reading'): Promise<ReadingText[]> => {
  const response = await apiClient.get(`/content/reading?uuid=${uuid}&module=${module}`);
  return response.data.readingTexts;
};

export const evaluateReading = async (originalText: string, spokenText: string) => {
  const response = await apiClient.post('/content/evaluate-reading', { originalText, spokenText });
  return response.data.evaluation;
};

export interface WritingEvaluation {
  score: number;
  feedback: string;
  correctedText: string;
}

export const evaluateWriting = async (originalText: string, writtenText: string, mode: 'translation' | 'dictation'): Promise<WritingEvaluation> => {
  const response = await apiClient.post('/content/evaluate-writing', { originalText, writtenText, mode });
  return response.data.evaluation;
};

export const submitProgress = async (
  uuid: string, 
  contentId: string, 
  moduleType: 'vocabulary' | 'reading' | 'writing' | 'listening', 
  isCorrect: boolean, 
  score?: number
) => {
  const response = await apiClient.post('/content/submit-progress', { uuid, contentId, moduleType, isCorrect, score });
  return response.data;
};
