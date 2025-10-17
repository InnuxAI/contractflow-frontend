import React from 'react';
import { Chip, useTheme, SxProps, Theme } from '@mui/material';
import { DocumentStatus } from '../../types';

interface StatusPillProps {
    status: DocumentStatus;
    sx?: SxProps<Theme>;
}

const getStatusConfig = (status: DocumentStatus, isDark: boolean) => {
    const baseConfigs = {
        'new': {
            light: { color: '#1565c0', backgroundColor: 'rgba(21, 101, 192, 0.1)' }, // blue
            dark: { color: '#90caf9', backgroundColor: 'rgba(144, 202, 249, 0.15)' }
        },
        'pending': {
            light: { color: '#f9a825', backgroundColor: 'rgba(249, 168, 37, 0.1)' }, // yellow
            dark: { color: '#ffe082', backgroundColor: 'rgba(255, 224, 130, 0.15)' }
        },
        'with_reviewer': {
            light: { color: '#757575', backgroundColor: 'rgba(117, 117, 117, 0.1)' }, // gray
            dark: { color: '#bdbdbd', backgroundColor: 'rgba(189, 189, 189, 0.15)' }
        },
        'with_approver': {
            light: { color: '#0097a7', backgroundColor: 'rgba(0, 151, 167, 0.1)' }, // cyan
            dark: { color: '#4dd0e1', backgroundColor: 'rgba(77, 208, 225, 0.15)' }
        },
        'approved': {
            light: { color: '#2e7d32', backgroundColor: 'rgba(46, 125, 50, 0.1)' }, // green
            dark: { color: '#81c784', backgroundColor: 'rgba(129, 199, 132, 0.15)' }
        }
    };

    return baseConfigs[status]?.[isDark ? 'dark' : 'light'] || baseConfigs['with_reviewer'][isDark ? 'dark' : 'light'];
};

const StatusPill: React.FC<StatusPillProps> = ({ status, sx = {} }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { color, backgroundColor } = getStatusConfig(status, isDark);
    
    return (
        <Chip
            label={status.replace('_', ' ')}
            size="small"
            variant="filled"
            sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'capitalize',
                color: color,
                backgroundColor: backgroundColor,
                border: `1px solid ${color}20`,
                borderRadius: '6px',
                height: '22px',
                letterSpacing: '-0.01em',
                '& .MuiChip-label': {
                    px: 1,
                },
                ...sx
            }}
        />
    );
};

export default StatusPill; 