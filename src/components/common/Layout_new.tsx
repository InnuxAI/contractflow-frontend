import React, { useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Button, Avatar, Chip } from '@mui/material';
import { Brightness4, Brightness7, Logout as LogoutIcon, Dashboard as DashboardIcon, Article as ArticleIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    const { logout, user } = useAuth();
    const { mode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log('Current user:', user);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            width: '100vw',
            overflow: 'hidden'
        }}>
            <AppBar 
                position="static" 
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    background: mode === 'light' 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    boxShadow: mode === 'light' 
                        ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
                }}
            >
                <Toolbar sx={{ minHeight: '72px !important', px: 3 }}>
                    {/* Brand */}
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            background: mode === 'light'
                                ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                                : 'linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: mode === 'light' 
                                ? '0 2px 4px rgba(59, 130, 246, 0.1)'
                                : '0 2px 4px rgba(96, 165, 250, 0.2)',
                            letterSpacing: '-0.025em'
                        }}
                    >
                        ContractFlow
                    </Typography>

                    {/* Navigation */}
                    <Box sx={{ 
                        ml: 4, 
                        display: 'flex', 
                        gap: 1,
                        flex: 1
                    }}>
                        <Button
                            startIcon={<DashboardIcon />}
                            onClick={() => navigate('/dashboard')}
                            sx={{
                                borderRadius: '12px',
                                px: 2.5,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                position: 'relative',
                                overflow: 'hidden',
                                background: isActive('/dashboard') 
                                    ? (mode === 'light' 
                                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                        : 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(192, 132, 252, 0.2) 100%)')
                                    : 'transparent',
                                border: isActive('/dashboard') 
                                    ? (mode === 'light' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(96, 165, 250, 0.3)')
                                    : '1px solid transparent',
                                color: isActive('/dashboard') 
                                    ? (mode === 'light' ? 'primary.main' : 'primary.light')
                                    : 'text.primary',
                                '&:hover': {
                                    background: mode === 'light' 
                                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
                                        : 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: mode === 'light' 
                                        ? '0 4px 12px rgba(59, 130, 246, 0.15)'
                                        : '0 4px 12px rgba(96, 165, 250, 0.2)',
                                },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            Dashboard
                        </Button>

                        <Button
                            startIcon={<ArticleIcon />}
                            onClick={() => navigate('/document-editor')}
                            sx={{
                                borderRadius: '12px',
                                px: 2.5,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                position: 'relative',
                                overflow: 'hidden',
                                background: isActive('/document-editor') 
                                    ? (mode === 'light' 
                                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                        : 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(192, 132, 252, 0.2) 100%)')
                                    : 'transparent',
                                border: isActive('/document-editor') 
                                    ? (mode === 'light' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(96, 165, 250, 0.3)')
                                    : '1px solid transparent',
                                color: isActive('/document-editor') 
                                    ? (mode === 'light' ? 'primary.main' : 'primary.light')
                                    : 'text.primary',
                                '&:hover': {
                                    background: mode === 'light' 
                                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
                                        : 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: mode === 'light' 
                                        ? '0 4px 12px rgba(59, 130, 246, 0.15)'
                                        : '0 4px 12px rgba(96, 165, 250, 0.2)',
                                },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            Document Editor
                        </Button>
                    </Box>

                    {/* User Info & Actions */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2 
                    }}>
                        {/* User Info */}
                        {user && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1.5,
                                px: 2,
                                py: 1,
                                borderRadius: '12px',
                                background: mode === 'light' 
                                    ? 'rgba(255, 255, 255, 0.7)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid',
                                borderColor: mode === 'light' 
                                    ? 'rgba(0, 0, 0, 0.08)'
                                    : 'rgba(255, 255, 255, 0.08)',
                            }}>
                                <Avatar 
                                    sx={{ 
                                        width: 32, 
                                        height: 32,
                                        bgcolor: mode === 'light' ? 'primary.main' : 'primary.light',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        boxShadow: mode === 'light' 
                                            ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                                            : '0 2px 8px rgba(96, 165, 250, 0.4)',
                                    }}
                                >
                                    {user.email?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            lineHeight: 1.2,
                                            color: 'text.primary'
                                        }}
                                    >
                                        {user.email}
                                    </Typography>
                                    <Chip 
                                        label={user.role || 'User'}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            mt: 0.25,
                                            background: mode === 'light' 
                                                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                                : 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(192, 132, 252, 0.2) 100%)',
                                            color: mode === 'light' ? 'primary.main' : 'primary.light',
                                            border: '1px solid',
                                            borderColor: mode === 'light' 
                                                ? 'rgba(59, 130, 246, 0.2)'
                                                : 'rgba(96, 165, 250, 0.3)',
                                        }}
                                    />
                                </Box>
                            </Box>
                        )}

                        {/* Theme Toggle */}
                        <IconButton 
                            onClick={toggleTheme}
                            sx={{
                                borderRadius: '12px',
                                width: 44,
                                height: 44,
                                background: mode === 'light' 
                                    ? 'rgba(255, 255, 255, 0.7)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid',
                                borderColor: mode === 'light' 
                                    ? 'rgba(0, 0, 0, 0.08)'
                                    : 'rgba(255, 255, 255, 0.08)',
                                color: mode === 'light' ? 'text.primary' : 'primary.light',
                                '&:hover': {
                                    background: mode === 'light' 
                                        ? 'rgba(255, 255, 255, 0.9)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: mode === 'light' 
                                        ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        : '0 4px 12px rgba(96, 165, 250, 0.2)',
                                },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>

                        {/* Logout */}
                        <IconButton 
                            onClick={handleLogout}
                            sx={{
                                borderRadius: '12px',
                                width: 44,
                                height: 44,
                                background: mode === 'light' 
                                    ? 'rgba(239, 68, 68, 0.1)'
                                    : 'rgba(248, 113, 113, 0.1)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid',
                                borderColor: mode === 'light' 
                                    ? 'rgba(239, 68, 68, 0.2)'
                                    : 'rgba(248, 113, 113, 0.2)',
                                color: mode === 'light' ? '#dc2626' : '#f87171',
                                '&:hover': {
                                    background: mode === 'light' 
                                        ? 'rgba(239, 68, 68, 0.15)'
                                        : 'rgba(248, 113, 113, 0.2)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: mode === 'light' 
                                        ? '0 4px 12px rgba(239, 68, 68, 0.2)'
                                        : '0 4px 12px rgba(248, 113, 113, 0.3)',
                                },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ 
                flex: 1, 
                display: 'flex',
                overflow: 'hidden',
                background: mode === 'light'
                    ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
