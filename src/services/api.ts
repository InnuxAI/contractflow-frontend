import axios from 'axios';
import { Document, DocumentStatus } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,  // Include credentials in requests
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await api.post('/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/logout');
    return response.data;
};

export const getDocuments = async (status?: DocumentStatus) => {
    const params = status ? { status } : {};
    const response = await api.get<Document[]>('/documents', { params });
    return response.data;
};

export const getDocument = async (id: string) => {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
};

export const updateDocument = async (id: string, data: Partial<Document>) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
};

export const saveDocumentContent = async (id: string, data: Partial<Document>) => {
    const response = await api.post(`/documents/${id}/save`, data);
    return response.data;
};

export const getUserByEmail = async (email: string) => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
};

export const getUserById = async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const addApprovers = async (documentId: string, approverIds: string[]): Promise<any> => {
  const response = await api.post(`/documents/${documentId}/approvers`, {
    approver_ids: approverIds
  });
  return response.data;
};

export default api; 