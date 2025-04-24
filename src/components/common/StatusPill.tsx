import React from 'react';
import { Chip, useTheme } from '@mui/material';
import { DocumentStatus } from '../../types';

interface StatusPillProps {
    status: DocumentStatus;
}

const getStatusConfig = (status: DocumentStatus) => {
    switch (status) {
        case 'new':
            return {
                color: '#1976d2',
                backgroundColor: '#bbdefb',
            };
        case 'in_progress':
            return {
                color: '#757575',
                backgroundColor: '#e0e0e0',
            };
        case 'changes_made':
            return {
                color: '#ed6c02',
                backgroundColor: '#ffe0b2',
            };
        case 'pending':
            return {
                color: '#d32f2f',
                backgroundColor: '#ffcdd2',
            };
        case 'approved':
            return {
                color: '#2e7d32',
                backgroundColor: '#c8e6c9',
            };
        default:
            return {
                color: '#757575',
                backgroundColor: '#e0e0e0',
            };
    }
};

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
    const theme = useTheme();
    const { color, backgroundColor } = getStatusConfig(status);
    
    return (
        <Chip
            label={status.replace('_', ' ')}
            size="small"
            variant={theme.palette.mode === 'light' ? 'outlined' : 'filled'}
            sx={{
                fontWeight: 500,
                textTransform: 'capitalize',
                // color: theme.palette.mode === 'dark' ? color : backgroundColor,
                // backgroundColor: theme.palette.mode === 'dark' ? backgroundColor : color,
                color: color,
                backgroundColor: backgroundColor,
                borderColor: color,
                borderRadius: '16px',
                height: '24px',
            }}
        />
    );
};

export default StatusPill; 