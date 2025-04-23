import React, { createContext, useContext, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, AuthContextType } from '../types';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface JWTPayload {
    sub: string;
    email: string;
    role: string;
    exp: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    return null;
                }
                return {
                    _id: decoded.sub,
                    email: decoded.email,
                    role: decoded.role as User['role'],
                };
            } catch {
                localStorage.removeItem('token');
                return null;
            }
        }
        return null;
    });

    const login = useCallback(async (email: string, password: string) => {
        const { access_token } = await apiLogin(email, password);
        localStorage.setItem('token', access_token);
        const decoded = jwtDecode<JWTPayload>(access_token);
        setUser({
            _id: decoded.sub,
            email: decoded.email,
            role: decoded.role as User['role'],
        });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 