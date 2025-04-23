import React, { useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { Brightness4, Brightness7, Logout as LogoutIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { logout, user } = useAuth();
    const { mode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Current user:', user);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
                    height: '100%'
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout; 