import { createTheme, PaletteMode, alpha } from '@mui/material';

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
                // Light mode
                primary: {
                    main: '#2196f3',
                    light: '#64b5f6',
                    dark: '#1976d2',
                    contrastText: '#fff',
                },
                secondary: {
                    main: '#9c27b0',
                    light: '#ba68c8',
                    dark: '#7b1fa2',
                    contrastText: '#fff',
                },
                background: {
                    default: '#f8f9fa',
                    paper: '#EBEBEB',
                },
                text: {
                    primary: 'rgba(0, 0, 0, 0.87)',
                    secondary: 'rgba(0, 0, 0, 0.6)',
                },
                divider: 'rgba(0, 0, 0, 0.12)',
                status: {
                    pending: '#ed6c02',
                    approved: '#2e7d32',
                    rejected: '#d32f2f',
                    inProgress: '#0288d1',
                    changesMade: '#9c27b0',
                },
            }
            : {
                // Dark mode
                primary: {
                    main: '#90caf9',
                    light: '#e3f2fd',
                    dark: '#42a5f5',
                    contrastText: '#000',
                },
                secondary: {
                    main: '#ce93d8',
                    light: '#f3e5f5',
                    dark: '#ab47bc',
                    contrastText: '#000',
                },
                background: {
                    default: '#121212',
                    paper: '#0A0A0A',
                },
                text: {
                    primary: '#ffffff',
                    secondary: 'rgba(255, 255, 255, 0.7)',
                },
                divider: 'rgba(255, 255, 255, 0.12)',
                status: {
                    pending: '#ffb74d',
                    approved: '#66bb6a',
                    rejected: '#f44336',
                    inProgress: '#29b6f6',
                    changesMade: '#ba68c8',
                },
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, fontSize: '2.5rem' },
        h2: { fontWeight: 600, fontSize: '2rem' },
        h3: { fontWeight: 600, fontSize: '1.75rem' },
        h4: { fontWeight: 600, fontSize: '1.5rem' },
        h5: { fontWeight: 600, fontSize: '1.25rem' },
        h6: { fontWeight: 600, fontSize: '1rem' },
        subtitle1: { fontSize: '1rem', fontWeight: 500 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
        body1: { fontSize: '1rem', lineHeight: 1.5 },
        body2: { fontSize: '0.875rem', lineHeight: 1.43 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: mode === 'light' 
                        ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                rounded: {
                    borderRadius: 12,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: 16,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});

export const getTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark'); 