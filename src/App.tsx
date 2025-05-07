import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ClauseManager from './pages/ClauseManager';
import Unauthorized from './components/Auth/Unauthorized';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/common/Layout';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CssBaseline />
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/clause-manager" element={<ClauseManager />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
