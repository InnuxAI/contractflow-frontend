import React, { useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Button, Link } from '@mui/material';
import { Brightness4, Brightness7, Logout as LogoutIcon } from '@mui/icons-material';
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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <AppBar 
                position="static" 
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Toolbar>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            flexGrow: 1,
                            color: 'text.primary',
                            fontWeight: 600
                        }}
                    >
                        Document Review System
                    </Typography>
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/')}
                                    sx={{
                                        color: isActive('/') ? 'primary.main' : 'text.secondary',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            color: 'primary.main',
                                        }
                                    }}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/clause-manager')}
                                    sx={{
                                        color: isActive('/clause-manager') ? 'primary.main' : 'text.secondary',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            color: 'primary.main',
                                        }
                                    }}
                                >
                                    Clause Manager
                                </Link>
                            </Box>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}
                            >
                                {user.email}
                                <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        ml: 1,
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {user.role}
                                </Typography>
                            </Typography>
                            <IconButton 
                                onClick={toggleTheme}
                                sx={{ color: 'text.primary' }}
                            >
                                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                            <Button
                                variant="outlined"
                                onClick={handleLogout}
                                startIcon={<LogoutIcon />}
                                size="small"
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
                    height: 'calc(100vh - 64px)',
                    minHeight: 0,
                    overflow: 'hidden'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout; 