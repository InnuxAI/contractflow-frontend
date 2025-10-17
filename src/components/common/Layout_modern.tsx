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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1.2rem',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            }}
                        >
                            D
                        </Box>
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                color: 'text.primary',
                                fontWeight: 700,
                                fontSize: '1.375rem',
                                background: mode === 'light' 
                                    ? 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)'
                                    : 'linear-gradient(135deg, #f8fafc 0%, #60a5fa 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '-0.025em',
                            }}
                        >
                            Document Review System
                        </Typography>
                    </Box>
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant={isActive('/') || isActive('/dashboard') ? 'contained' : 'text'}
                                    onClick={() => navigate('/')}
                                    startIcon={<DashboardIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        transition: 'all 0.2s ease',
                                        ...(isActive('/') || isActive('/dashboard') ? {
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                transform: 'translateY(-1px)',
                                            }
                                        } : {
                                            color: 'text.secondary',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                                color: 'primary.main',
                                                transform: 'translateY(-1px)',
                                            }
                                        })
                                    }}
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    variant={isActive('/clause-manager') ? 'contained' : 'text'}
                                    onClick={() => navigate('/clause-manager')}
                                    startIcon={<ArticleIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        transition: 'all 0.2s ease',
                                        ...(isActive('/clause-manager') ? {
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                transform: 'translateY(-1px)',
                                            }
                                        } : {
                                            color: 'text.secondary',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                                color: 'primary.main',
                                                transform: 'translateY(-1px)',
                                            }
                                        })
                                    }}
                                >
                                    Clause Manager
                                </Button>
                            </Box>
                            
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                bgcolor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                                borderRadius: 3,
                                px: 2,
                                py: 1,
                                border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                            }}>
                                <Avatar 
                                    sx={{ 
                                        width: 32, 
                                        height: 32,
                                        bgcolor: 'primary.main',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {user.email.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: 'text.primary',
                                            fontWeight: 500,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {user.email.split('@')[0]}
                                    </Typography>
                                    <Chip
                                        label={user.role}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.6875rem',
                                            fontWeight: 600,
                                            textTransform: 'capitalize',
                                            bgcolor: mode === 'light' ? 'primary.main' : 'primary.light',
                                            color: mode === 'light' ? 'primary.contrastText' : 'primary.contrastText',
                                            '& .MuiChip-label': {
                                                px: 1,
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            <IconButton 
                                onClick={toggleTheme}
                                sx={{ 
                                    color: 'text.primary',
                                    bgcolor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                                    border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                            >
                                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                            
                            <Button
                                variant="outlined"
                                onClick={handleLogout}
                                startIcon={<LogoutIcon />}
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                                    color: 'text.secondary',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'error.main',
                                        color: 'error.main',
                                        bgcolor: mode === 'light' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(239, 68, 68, 0.08)',
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    height: 'calc(100vh - 72px)',
                    minHeight: 0,
                    overflow: 'hidden',
                    background: mode === 'light' 
                        ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 50%, rgba(226, 232, 240, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(45, 60, 80, 0.95) 100%)',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
