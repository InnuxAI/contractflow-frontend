import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Paper,
    IconButton,
    Snackbar,
    Alert,
    Chip,
    useTheme,
    Autocomplete,
    Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import axios from 'axios';

interface Clause {
    id: string;
    title: string;
    description: string;
    domain: string;
    created_at: string;
    last_modified: string;
}

// Add color generation function
const generateDomainColor = (domain: string) => {
    // Base colors
    const baseBackground = '#022249';
    const baseText = '#47A8FF';
    
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    };

    // Convert RGB to HSL
    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    };

    // Convert HSL to RGB
    const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        const k = (n: number) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    };

    // Convert RGB to hex
    const rgbToHex = (r: number, g: number, b: number) => {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    };

    // Generate a consistent hash for the domain
    const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Get base HSL values
    const baseBgRgb = hexToRgb(baseBackground);
    const baseBgHsl = rgbToHsl(baseBgRgb.r, baseBgRgb.g, baseBgRgb.b);
    const baseTextRgb = hexToRgb(baseText);
    const baseTextHsl = rgbToHsl(baseTextRgb.r, baseTextRgb.g, baseTextRgb.b);

    // Apply hue shift based on domain hash
    const hueShift = (hash % 60) - 30; // Shift between -30 and +30 degrees
    const newBgHsl = { ...baseBgHsl, h: (baseBgHsl.h + hueShift + 360) % 360 };
    const newTextHsl = { ...baseTextHsl, h: (baseTextHsl.h + hueShift + 360) % 360 };

    // Convert back to RGB and then to hex
    const newBgRgb = hslToRgb(newBgHsl.h, newBgHsl.s, newBgHsl.l);
    const newTextRgb = hslToRgb(newTextHsl.h, newTextHsl.s, newTextHsl.l);

    return {
        background: rgbToHex(newBgRgb.r, newBgRgb.g, newBgRgb.b),
        text: rgbToHex(newTextRgb.r, newTextRgb.g, newTextRgb.b)
    };
};

const ClauseManager: React.FC = () => {
    const theme = useTheme();
    const [clauses, setClauses] = useState<Clause[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clausesToDelete, setClausesToDelete] = useState<string[]>([]);
    const [editingClause, setEditingClause] = useState<Clause | null>(null);
    const [newClause, setNewClause] = useState({
        title: '',
        description: '',
        domain: ''
    });
    const [domains, setDomains] = useState<string[]>([]);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });
    const [pageSize, setPageSize] = useState<number>(10);
    const [selectedRows, setSelectedRows] = useState<Clause[]>([]);

    useEffect(() => {
        fetchClauses();
    }, []);

    const fetchClauses = async () => {
        try {
            const response = await axios.get<Clause[]>('contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app/api/clauses');
            setClauses(response.data);
            const uniqueDomains = Array.from(new Set(response.data.map(clause => clause.domain)));
            setDomains(uniqueDomains);
        } catch (error) {
            console.error('Error fetching clauses:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch clauses',
                severity: 'error'
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingClause) {
                await axios.put(`contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app/api/clauses/${editingClause.id}`, newClause);
                setSnackbar({
                    open: true,
                    message: 'Clause updated successfully',
                    severity: 'success'
                });
            } else {
                await axios.post('contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app/api/clauses', newClause);
                setSnackbar({
                    open: true,
                    message: 'Clause created successfully',
                    severity: 'success'
                });
            }
            setIsOpen(false);
            setNewClause({ title: '', description: '', domain: '' });
            setEditingClause(null);
            fetchClauses();
        } catch (error) {
            console.error('Error saving clause:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save clause',
                severity: 'error'
            });
        }
    };

    const handleDelete = async (clauseIds: string[]) => {
        setClausesToDelete(clauseIds);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (clausesToDelete.length === 0) return;
        
        try {
            await Promise.all(
                clausesToDelete.map(id => 
                    axios.delete(`contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app/api/clauses/${id}`)
                )
            );
            fetchClauses();
            setSnackbar({
                open: true,
                message: `Successfully deleted ${clausesToDelete.length} clause${clausesToDelete.length > 1 ? 's' : ''}`,
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting clauses:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete clauses',
                severity: 'error'
            });
        } finally {
            setDeleteDialogOpen(false);
            setClausesToDelete([]);
            setSelectedRows([]);
        }
    };

    const columns: GridColDef[] = [
        { 
            field: 'title', 
            headerName: 'Title', 
            flex: 1,
            minWidth: 200,
            filterable: true,
        },
        { 
            field: 'description', 
            headerName: 'Description', 
            flex: 2,
            minWidth: 300,
            filterable: true,
        },
        { 
            field: 'domain', 
            headerName: 'Domain', 
            flex: 1,
            minWidth: 150,
            filterable: true,
            renderCell: (params: GridRenderCellParams) => {
                const colors = generateDomainColor(params.value);
                return (
                    <Chip
                        label={params.value}
                        size="small"
                        sx={{
                            backgroundColor: colors.background,
                            color: colors.text,
                        }}
                    />
                );
            },
        },
        { 
            field: 'created_at', 
            headerName: 'Created At', 
            flex: 1,
            minWidth: 180,
            filterable: true,
            renderCell: (params: GridRenderCellParams) => 
                new Date(params.row.created_at).toLocaleString(),
        },
        { 
            field: 'last_modified', 
            headerName: 'Last Modified', 
            flex: 1,
            minWidth: 180,
            filterable: true,
            renderCell: (params: GridRenderCellParams) => 
                new Date(params.row.last_modified).toLocaleString(),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setEditingClause(params.row);
                            setNewClause({
                                title: params.row.title,
                                description: params.row.description,
                                domain: params.row.domain
                            });
                            setIsOpen(true);
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDelete([params.row.id])}
                        sx={{ color: theme.palette.error.main }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ 
            display: 'flex',
            height: 'calc(100vh - 64px)',
            backgroundColor: theme.palette.background.default,
        }}>
            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    width: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, letterSpacing: '-0.5px' }}>
                        Clause Manager
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {selectedRows.length > 0 && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDelete(selectedRows.map(row => row.id))}
                            >
                                Delete Selected ({selectedRows.length})
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setEditingClause(null);
                                setNewClause({ title: '', description: '', domain: '' });
                                setIsOpen(true);
                            }}
                        >
                            Add New Clause
                        </Button>
                    </Box>
                </Box>

                <Paper
                    sx={{
                        height: 'calc(100% - 100px)',
                        width: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <DataGrid
                        rows={clauses}
                        columns={columns}
                        pageSizeOptions={[5, 10, 25, 50]}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: pageSize },
                            },
                            filter: {
                                filterModel: {
                                    items: [],
                                },
                            },
                        }}
                        onPaginationModelChange={(params) => setPageSize(params.pageSize)}
                        checkboxSelection
                        disableRowSelectionOnClick
                        onRowSelectionModelChange={(ids) => {
                            const selectedIDs = new Set((ids as unknown as string[]));
                            const selected = clauses.filter((row) => selectedIDs.has(row.id));
                            setSelectedRows(selected);
                        }}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: theme.palette.background.paper,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: `1px solid ${theme.palette.divider}`,
                            },
                        }}
                    />
                </Paper>
            </Box>

            {/* Add/Edit Dialog */}
            <Dialog
                open={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setEditingClause(null);
                    setNewClause({ title: '', description: '', domain: '' });
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingClause ? 'Edit Clause' : 'Add New Clause'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                autoFocus
                                label="Title"
                                fullWidth
                                value={newClause.title}
                                onChange={(e) => setNewClause({ ...newClause, title: e.target.value })}
                                required
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                value={newClause.description}
                                onChange={(e) => setNewClause({ ...newClause, description: e.target.value })}
                                required
                            />
                            <Autocomplete
                                freeSolo
                                options={domains}
                                value={newClause.domain}
                                onChange={(_, newValue) => {
                                    setNewClause({ ...newClause, domain: newValue || '' });
                                }}
                                onInputChange={(_, newInputValue) => {
                                    setNewClause({ ...newClause, domain: newInputValue });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Domain"
                                        required
                                    />
                                )}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setIsOpen(false);
                                setEditingClause(null);
                                setNewClause({ title: '', description: '', domain: '' });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            {editingClause ? 'Update' : 'Add'} Clause
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Delete Clause{clausesToDelete.length > 1 ? 's' : ''}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {clausesToDelete.length > 1 ? 'these clauses' : 'this clause'}? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ClauseManager; 