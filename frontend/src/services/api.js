import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const extractTranscript = async (url, language, force_whisper = false) => {
  const response = await apiClient.post('/transcripts/extract', { url, language, force_whisper });
  return response.data;
};

export const uploadTranscript = async (file, language) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  
  const response = await apiClient.post('/transcripts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const summarizeTranscripts = async (transcripts, video_id = null, language = null) => {
  const response = await apiClient.post('/gemini/summarize', { transcripts, video_id, language });
  return response.data;
};

export const qaTranscripts = async (transcripts, question) => {
  const response = await apiClient.post('/gemini/qa', { transcripts, question });
  return response.data;
};
