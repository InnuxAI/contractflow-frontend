import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Unauthorized from './components/Auth/Unauthorized';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { registerLicense } from '@syncfusion/ej2-base';

// Register Syncfusion license
registerLicense('YOUR_SYNCFUSION_LICENSE_KEY');

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
