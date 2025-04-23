import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: 2,
            }}
        >
            <Typography variant="h4" component="h1">
                Unauthorized Access
            </Typography>
            <Typography variant="body1">
                You don't have permission to access this page.
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
            >
                Go to Dashboard
            </Button>
        </Box>
    );
};

export default Unauthorized; 