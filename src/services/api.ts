import axios from 'axios';
import { Document, DocumentStatus } from '../types';

const API_URL = 'contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app';

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

export const getUserByEmail = async (email: string) => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
};

export const getUserById = async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const addApprovers = async (documentId: string, approverEmails: string[]) => {
    // First get the user IDs for each email
    const approverIds = await Promise.all(
        approverEmails.map(async (email) => {
            const user = await getUserByEmail(email);
            return user._id;
        })
    );
    
    const response = await api.post(`/documents/${documentId}/approvers`, approverIds);
    return response.data;
};

export default api; 