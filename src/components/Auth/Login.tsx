import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch {
            setError('Invalid email or password');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1
                        }}
                    >
                        Welcome Back
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary',
                            opacity: 0.8
                        }}
                    >
                        Sign in to continue to your account
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                        InputProps={{
                            sx: {
                                borderRadius: 2,
                                bgcolor: 'background.default'
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 3 }}
                        InputProps={{
                            sx: {
                                borderRadius: 2,
                                bgcolor: 'background.default'
                            },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    {error && (
                        <Typography 
                            color="error" 
                            sx={{ 
                                mb: 2,
                                textAlign: 'center',
                                fontSize: '0.875rem'
                            }}
                        >
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: 'none'
                            }
                        }}
                    >
                        Sign In
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Login; 