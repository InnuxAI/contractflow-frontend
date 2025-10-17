import { createTheme, PaletteMode } from '@mui/material';

// Custom type for our status colors
declare module '@mui/material/styles' {
    interface Palette {
        status: {
            pending: string;
            approved: string;
            rejected: string;
            inProgress: string;
            changesMade: string;
        };
    }
    interface PaletteOptions {
        status?: {
            pending?: string;
            approved?: string;
            rejected?: string;
            inProgress?: string;
            changesMade?: string;
        };
    }
}

const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode - Minimalistic bright colors
                primary: {
                    main: '#2563eb', // Clean blue
                    light: '#3b82f6',
                    dark: '#1d4ed8',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#7c3aed', // Clean purple
                    light: '#8b5cf6',
                    dark: '#6d28d9',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#fafafa', // Very light gray
                    paper: '#ffffff', // Pure white
                },
                text: {
                    primary: '#111827', // Very dark gray
                    secondary: '#6b7280', // Medium gray
                },
                divider: 'rgba(17, 24, 39, 0.06)',
                status: {
                    pending: '#f59e0b', // Orange
                    approved: '#10b981', // Green
                    rejected: '#ef4444', // Red
                    inProgress: '#3b82f6', // Blue
                    changesMade: '#8b5cf6', // Purple
                },
            }
            : {
                // Dark mode - Premium light shades
                primary: {
                    main: '#60a5fa', // Light blue shades
                    light: '#93c5fd',
                    dark: '#3b82f6',
                    contrastText: '#1e293b',
                },
                secondary: {
                    main: '#c084fc', // Purple-pink shades
                    light: '#ddd6fe',
                    dark: '#a855f7',
                    contrastText: '#1e293b',
                },
                background: {
                    default: 'rgba(0, 0, 0, 0.33)', // Dark gray
                    paper: 'rgba(21, 21, 21, 0.08)', // Near black
                },
                text: {
                    primary: '#f8fafc', // White
                    secondary: 'rgba(248, 250, 252, 0.7)', // Semi-transparent white
                },
                divider: 'rgba(248, 250, 252, 0.08)',
                status: {
                    pending: '#fbbf24', // Light orange
                    approved: '#34d399', // Light green
                    rejected: '#f87171', // Bright red
                    inProgress: '#60a5fa', // Light blue
                    changesMade: '#c084fc', // Light purple
                },
            }),
    },
    typography: {
        // Modern font stack with Inter and Roboto
        fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
        // Enhanced heading hierarchy
        h1: { 
            fontWeight: 700, 
            fontSize: '2.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.025em'
        },
        h2: { 
            fontWeight: 600, 
            fontSize: '2rem',
            lineHeight: 1.25,
            letterSpacing: '-0.025em'
        },
        h3: { 
            fontWeight: 600, 
            fontSize: '1.75rem',
            lineHeight: 1.3,
            letterSpacing: '-0.02em'
        },
        h4: { 
            fontWeight: 600, 
            fontSize: '1.5rem',
            lineHeight: 1.35,
            letterSpacing: '-0.02em'
        },
        h5: { 
            fontWeight: 600, 
            fontSize: '1.25rem',
            lineHeight: 1.4,
            letterSpacing: '-0.015em'
        },
        h6: { 
            fontWeight: 600, 
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '-0.01em'
        },
        // Enhanced subtitles
        subtitle1: { 
            fontSize: '1rem', 
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: '-0.01em'
        },
        subtitle2: { 
            fontSize: '0.875rem', 
            fontWeight: 500,
            lineHeight: 1.43,
            letterSpacing: '-0.005em'
        },
        // Enhanced body text
        body1: { 
            fontSize: '1rem', 
            lineHeight: 1.5,
            letterSpacing: '-0.01em'
        },
        body2: { 
            fontSize: '0.875rem', 
            lineHeight: 1.43,
            letterSpacing: '-0.005em'
        },
        // Button styling - no uppercase transform
        button: { 
            textTransform: 'none' as const, 
            fontWeight: 600,
            letterSpacing: '-0.01em'
        },
    },
    shape: {
        borderRadius: 4, // General border radius
    },
    components: {
        // AppBar enhancements
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: mode === 'light' 
                        ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
                    borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                },
            },
        },
        // Button enhancements
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                    textTransform: 'none' as const,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                } as const,
                contained: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                    },
                } as const,
            },
        },
        // Paper enhancements
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                },
                rounded: {
                    borderRadius: 12, // Cards & paper
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                },
                elevation2: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
                elevation3: {
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
            },
        },
        // TextField enhancements
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                        },
                    },
                },
            },
        },
        // Card enhancements
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: 16,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: mode === 'light' 
                            ? '0 16px 32px rgba(0, 0, 0, 0.15)'
                            : '0 16px 32px rgba(0, 0, 0, 0.4)',
                    },
                },
            },
        },
        // ListItem enhancements
        MuiListItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateX(4px)',
                        backgroundColor: mode === 'light' 
                            ? 'rgba(59, 130, 246, 0.08)' 
                            : 'rgba(96, 165, 250, 0.08)',
                    },
                },
            },
        },
        // Dialog enhancements
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                    boxShadow: mode === 'light'
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                },
            },
        },
        // Chip enhancements
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    fontWeight: 500,
                    border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                },
            },
        },
    },
});

export const getTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark'); 