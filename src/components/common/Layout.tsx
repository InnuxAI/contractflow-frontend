import React, { useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Logout as LogoutIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Current user:', user);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: '#1976d2',
                }}
            >
                <Toolbar>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            flexGrow: 1,
                            fontWeight: 500,
                        }}
                    >
                        Document Review System
                    </Typography>
                    {user && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            mr: 1
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                px: 2,
                                py: 0.75,
                                borderRadius: 1,
                                minWidth: '200px',
                            }}>
                                <PersonIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                                <Box sx={{ overflow: 'hidden' }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontWeight: 500,
                                            lineHeight: 1.2,
                                            color: 'white',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {user.email}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            display: 'block',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {user.role}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton 
                                color="inherit" 
                                onClick={handleLogout}
                                sx={{ 
                                    '&:hover': { 
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                                    } 
                                }}
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    pt: '64px',
                    backgroundColor: '#f5f5f5',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout; 