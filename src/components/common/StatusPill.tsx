import React from 'react';
import { Chip } from '@mui/material';
import { DocumentStatus } from '../../types';

interface StatusPillProps {
    status: DocumentStatus;
}

const getStatusConfig = (status: DocumentStatus) => {
    switch (status) {
        case 'new':
            return {
                color: '#1976d2',
                backgroundColor: '#e3f2fd',
            };
        case 'in_progress':
            return {
                color: '#757575',
                backgroundColor: '#f5f5f5',
            };
        case 'changes_made':
            return {
                color: '#ed6c02',
                backgroundColor: '#fff3e0',
            };
        case 'pending':
            return {
                color: '#d32f2f',
                backgroundColor: '#ffebee',
            };
        case 'approved':
            return {
                color: '#2e7d32',
                backgroundColor: '#e8f5e9',
            };
        default:
            return {
                color: '#757575',
                backgroundColor: '#f5f5f5',
            };
    }
};

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
    const { color, backgroundColor } = getStatusConfig(status);
    
    return (
        <Chip
            label={status.replace('_', ' ')}
            size="small"
            sx={{
                fontWeight: 500,
                textTransform: 'capitalize',
                color: color,
                backgroundColor: backgroundColor,
                borderRadius: '16px',
                height: '24px',
            }}
        />
    );
};

export default StatusPill; 