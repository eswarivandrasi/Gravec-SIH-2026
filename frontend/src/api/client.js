import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if stored
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cyclone_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Health & System
  getHealth: () => apiClient.get('/api/health'),
  getSystemStatus: () => apiClient.get('/api/system/status'),
  getAuditLogs: () => apiClient.get('/api/system/audit-logs'),
  getUsers: () => apiClient.get('/api/system/users'),

  // Auth
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  register: (userData) => apiClient.post('/api/auth/register', userData),
  getMe: () => apiClient.get('/api/auth/me'),

  // Dashboard
  getDashboardSummary: () => apiClient.get('/api/dashboard/summary'),

  // Cyclones & AI
  getCyclones: () => apiClient.get('/api/cyclones'),
  getCycloneById: (id) => apiClient.get(`/api/cyclones/${id}`),
  createCyclone: (data) => apiClient.post('/api/cyclones', data),
  runAIAnalysis: (id) => apiClient.post(`/api/cyclones/${id}/analyze`),
  getFingerprint: (id) => apiClient.get(`/api/cyclones/${id}/fingerprint`),
  getSimilarPatterns: (id) => apiClient.get(`/api/cyclones/${id}/similar-patterns`),
  getTrendAnalysis: (id) => apiClient.get(`/api/cyclones/${id}/trend`),

  // Data Ingestion
  uploadData: (formData) => apiClient.post('/api/data/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Alerts
  getAlerts: () => apiClient.get('/api/alerts'),
  getAlertHistory: () => apiClient.get('/api/alerts/history'),
  createAlert: (data) => apiClient.post('/api/alerts', data),
  testAlert: (params) => apiClient.post('/api/alerts/test', null, { params }),

  // IVR Voice Alert System
  getIVRLanguages: () => apiClient.get('/api/ivr/languages'),
  getIVRCalls: () => apiClient.get('/api/ivr/calls'),
  initiateIVRCall: (data) => apiClient.post('/api/ivr/test-call', data),
  interactIVRKeypad: (data) => apiClient.post('/api/ivr/interact', data),

  // Safety & Shelters
  getSafetyInstructions: () => apiClient.get('/api/safety/instructions'),
  getShelters: () => apiClient.get('/api/safety/shelters'),

  // Model Evaluation
  getModelEvaluation: () => apiClient.get('/api/models/evaluation'),
  getModelVersions: () => apiClient.get('/api/models/versions'),
};

export default apiClient;
