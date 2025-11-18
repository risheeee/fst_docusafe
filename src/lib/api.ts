import axios from 'axios';
import type { AuthResponse, DocumentsResponse, UsersResponse, UploadResponse } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (name: string, email: string, password: string, role: 'student' | 'admin'): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', { name, email, password, role });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const documentsAPI = {
  getMyDocuments: async (): Promise<DocumentsResponse> => {
    const response = await api.get('/documents/my');
    return response.data;
  },

  getAllDocuments: async (): Promise<DocumentsResponse> => {
    const response = await api.get('/documents/all');
    return response.data;
  },

  uploadDocument: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};

export const usersAPI = {
  getAllUsers: async (): Promise<UsersResponse> => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

export default api;
