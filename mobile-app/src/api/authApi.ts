import { apiClient } from './apiClient';

export interface UserResponse {
  uuid: string;
  targetLanguage?: string;
  authToken?: string;
  transferCode?: string;
  transferCodeExpiresAt?: string;
  level: {
    vocabulary: string;
    reading: string;
    writing: string;
    listening: string;
  };
  progress: {
    vocabulary: number;
    reading: number;
    writing: number;
    listening: number;
  };
  dailyQuotas?: {
    date: string;
    limits: {
      vocabulary: number;
      reading: number;
      writing: number;
      listening: number;
    };
    counts: {
      vocabulary: number;
      reading: number;
      writing: number;
      listening: number;
    };
  };
}

export const registerDevice = async (uuid: string): Promise<UserResponse> => {
  const response = await apiClient.post('/auth/register', { uuid });
  return response.data.user;
};

export const generateTransferCode = async (uuid: string) => {
  const response = await apiClient.post('/auth/generate-transfer-code', { uuid });
  return response.data;
};

export const transferDevice = async (newUuid: string, transferCode: string): Promise<UserResponse> => {
  const response = await apiClient.post('/auth/transfer-device', { newUuid, transferCode });
  return response.data.user;
};
