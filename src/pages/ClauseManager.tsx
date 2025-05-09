import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    Typography,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Snackbar,
    Alert,
    Chip,
    Grid,
    Slider,
    FormControlLabel,
    Switch,
    useTheme,
    Autocomplete,
    Stack,
    Drawer,
    Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterIcon, Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

interface Clause {
    id: string;
    title: string;
    description: string;
    domain: string;
    created_at: string;
    last_modified: string;
}

interface FilterState {
    domain: string;
    lastModifiedStart: Date | null;
    lastModifiedEnd: Date | null;
    createdStart: Date | null;
    createdEnd: Date | null;
}

const dialogVariants = {
    hidden: { 
        opacity: 0,
        scale: 0.95,
        y: 20
    },
    visible: { 
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 300
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.2
        }
    }
};

const gridItemVariants = {
    hidden: { 
        opacity: 0,
        scale: 0.95
    },
    visible: { 
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 200
        }
    }
};

const drawerWidth = '30vw';

const ClauseManager: React.FC = () => {
    const theme = useTheme();
    const [clauses, setClauses] = useState<Clause[]>([]);
    const [filterState, setFilterState] = useState<FilterState>({
        domain: 'All',
        lastModifiedStart: null,
        lastModifiedEnd: null,
        createdStart: null,
        createdEnd: null
    });
    const [isOpen, setIsOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clauseToDelete, setClauseToDelete] = useState<string | null>(null);
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
    const [columns, setColumns] = useState(1);
    const [isGrid, setIsGrid] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchClauses();
    }, []);

    const fetchClauses = async () => {
        try {
            const response = await axios.get<Clause[]>('https://contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app/api/clauses');
            setClauses(response.data);
            const uniqueDomains = Array.from(new Set(response.data.map(clause => clause.domain)));
            setDomains(['All', ...uniqueDomains]);
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
                await axios.put(`https://contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app/api/clauses/${editingClause.id}`, newClause);
                setSnackbar({
                    open: true,
                    message: 'Clause updated successfully',
                    severity: 'success'
                });
            } else {
                await axios.post('https://contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app/api/clauses', newClause);
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

    const handleEdit = (clause: Clause) => {
        setEditingClause(clause);
        setNewClause({
            title: clause.title,
            description: clause.description,
            domain: clause.domain
        });
        setIsOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleDelete = async (clauseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setClauseToDelete(clauseId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!clauseToDelete) return;
        
        try {
            await axios.delete(`https://contractflow-backend-2mxg8mkdk-valterans-projects.vercel.app/api/clauses/${clauseToDelete}`);
            fetchClauses();
            setSnackbar({
                open: true,
                message: 'Clause deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting clause:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete clause',
                severity: 'error'
            });
        } finally {
            setDeleteDialogOpen(false);
            setClauseToDelete(null);
        }
    };

    const handleFilterChange = (field: keyof FilterState, value: unknown) => {
        setFilterState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilterState({
            domain: 'All',
            lastModifiedStart: null,
            lastModifiedEnd: null,
            createdStart: null,
            createdEnd: null
        });
    };

    const filteredClauses = clauses.filter(clause => {
        // Domain filter
        if (filterState.domain !== 'All' && clause.domain !== filterState.domain) {
            return false;
        }

        // Last Modified date range filter
        const lastModified = new Date(clause.last_modified);
        if (filterState.lastModifiedStart && lastModified < filterState.lastModifiedStart) {
            return false;
        }
        if (filterState.lastModifiedEnd && lastModified > filterState.lastModifiedEnd) {
            return false;
        }

        // Created date range filter
        const created = new Date(clause.created_at);
        if (filterState.createdStart && created < filterState.createdStart) {
            return false;
        }
        if (filterState.createdEnd && created > filterState.createdEnd) {
            return false;
        }

        return true;
    });

    const getDomainPillColors = (domain: string) => {
        const domainHash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const domainHue = (0 + domainHash) % 360;
        
        return {
            background: `hsl(${domainHue}, 90%, 10%)`,
            text: `hsl(${domainHue}, 100%, 65%)`
        };
    };

    const clauseCard = (clause: Clause) => {
        const pillColors = getDomainPillColors(clause.domain);
        return (
            <motion.div
                key={clause.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ 
                    scale: 1.01,
                    boxShadow: theme.shadows[3]
                }}
                whileTap={{ scale: 0.99 }}
            >
                <Paper
                    sx={{
                        p: 3,
                        height: '100%',
                        cursor: 'pointer',
                        backgroundColor: theme.palette.background.paper,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                                fontWeight: 600,
                                mb: 1,
                                letterSpacing: '-0.25px',
                                color: theme.palette.text.primary
                            }}
                        >
                            {clause.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(clause);
                                }}
                                sx={{
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.light,
                                        color: theme.palette.primary.contrastText
                                    }
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={(e) => handleDelete(clause.id, e)}
                                sx={{
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.error.light,
                                        color: theme.palette.error.contrastText
                                    }
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Chip
                        label={clause.domain}
                        size="small"
                        sx={{
                            mb: 1.5,
                            backgroundColor: pillColors.background,
                            color: pillColors.text,
                            fontWeight: 500
                        }}
                    />
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.6,
                            letterSpacing: '0.00938em',
                            mb: 2
                        }}
                    >
                        {clause.description}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.disabled"
                    >
                        Created: {new Date(clause.created_at).toLocaleString()}
                        <br />
                        Last Modified: {new Date(clause.last_modified).toLocaleString()}
                    </Typography>
                </Paper>
            </motion.div>
        );
    };

    return (
        <Box sx={{ 
            display: 'flex',
            height: 'calc(100vh - 64px)',
            backgroundColor: theme.palette.background.default,
        }}>
            {/* Filter Drawer */}
            <Drawer
                variant="temporary"
                anchor="left"
                open={showFilters}
                onClose={() => setShowFilters(false)}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        position: 'relative',
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <Typography variant="h6" component="h2">
                            Filters
                        </Typography>
                        <IconButton onClick={() => setShowFilters(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Stack spacing={3}>
                            <FormControl fullWidth>
                                <InputLabel>Domain</InputLabel>
                                <Select
                                    value={filterState.domain}
                                    label="Domain"
                                    onChange={(e) => handleFilterChange('domain', e.target.value)}
                                >
                                    {domains.map((domain) => (
                                        <MenuItem key={domain} value={domain}>
                                            {domain}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Last Modified
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <DatePicker
                                        label="Start Date"
                                        value={filterState.lastModifiedStart}
                                        onChange={(date) => handleFilterChange('lastModifiedStart', date)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        value={filterState.lastModifiedEnd}
                                        onChange={(date) => handleFilterChange('lastModifiedEnd', date)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Created Date
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <DatePicker
                                        label="Start Date"
                                        value={filterState.createdStart}
                                        onChange={(date) => handleFilterChange('createdStart', date)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        value={filterState.createdEnd}
                                        onChange={(date) => handleFilterChange('createdEnd', date)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Box>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    View Options
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={isGrid}
                                                onChange={(e) => setIsGrid(e.target.checked)}
                                            />
                                        }
                                        label="Grid View"
                                    />

                                    {isGrid && (
                                        <Box sx={{ width: 200 }}>
                                            <Typography gutterBottom>Columns: {columns}</Typography>
                                            <Slider
                                                value={columns}
                                                onChange={(_, value) => setColumns(value as number)}
                                                min={1}
                                                max={4}
                                                step={1}
                                                marks
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={clearFilters}
                                fullWidth
                            >
                                Clear All Filters
                            </Button>
                        </Stack>
                    </LocalizationProvider>
                </Box>
            </Drawer>

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
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
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

                <Box sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    position: 'relative',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: theme.palette.background.paper,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.divider,
                        borderRadius: '4px',
                    },
                }}>
                    <AnimatePresence mode="wait">
                        {isGrid ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ 
                                    height: '100%',
                                    paddingRight: '8px',
                                }}
                            >
                                <Grid container spacing={3}>
                                    {filteredClauses.map((clause, index) => (
                                        <Grid 
                                            item 
                                            xs={12} 
                                            sm={columns >= 2 ? 6 : 12}
                                            md={columns >= 3 ? 4 : columns === 2 ? 6 : 12}
                                            lg={columns === 4 ? 3 : columns === 3 ? 4 : columns === 2 ? 6 : 12}
                                            key={clause.id}
                                        >
                                            <motion.div
                                                variants={gridItemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                {clauseCard(clause)}
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ 
                                    height: '100%',
                                    paddingRight: '8px',
                                }}
                            >
                                <Paper
                                    sx={{
                                        height: '100%',
                                        borderRadius: 2,
                                        backgroundColor: theme.palette.background.paper,
                                        border: '1px solid',
                                        borderColor: theme.palette.divider,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <List sx={{ 
                                        p: 0, 
                                        height: '100%', 
                                        overflow: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: theme.palette.background.paper,
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: theme.palette.divider,
                                            borderRadius: '4px',
                                        },
                                    }}>
                                        {filteredClauses.map((clause, index) => (
                                            <motion.div
                                                key={clause.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <ListItem
                                                    sx={{
                                                        p: 3,
                                                        borderBottom: '1px solid',
                                                        borderColor: theme.palette.divider,
                                                        '&:last-child': {
                                                            borderBottom: 'none'
                                                        }
                                                    }}
                                                >
                                                    {clauseCard(clause)}
                                                </ListItem>
                                            </motion.div>
                                        ))}
                                    </List>
                                </Paper>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={dialogVariants}
                        >
                            <Dialog
                                open={isOpen}
                                onClose={() => {
                                    setIsOpen(false);
                                    setEditingClause(null);
                                    setNewClause({ title: '', description: '', domain: '' });
                                }}
                                maxWidth="sm"
                                fullWidth
                                PaperProps={{
                                    component: motion.div,
                                    variants: dialogVariants,
                                    sx: {
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: theme.palette.divider
                                    }
                                }}
                            >
                                <DialogTitle sx={{
                                    fontWeight: 600,
                                    letterSpacing: '-0.25px',
                                    pb: 2
                                }}>
                                    {editingClause ? 'Edit Clause' : 'Add New Clause'}
                                </DialogTitle>
                                <form onSubmit={handleSubmit}>
                                    <DialogContent sx={{ pt: 2 }}>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Title"
                                            fullWidth
                                            value={newClause.title}
                                            onChange={(e) => setNewClause({ ...newClause, title: e.target.value })}
                                            required
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            margin="dense"
                                            label="Description"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={newClause.description}
                                            onChange={(e) => setNewClause({ ...newClause, description: e.target.value })}
                                            required
                                            sx={{ mb: 2 }}
                                        />
                                        <Autocomplete
                                            freeSolo
                                            options={domains.filter(domain => domain !== 'All')}
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
                                                    margin="dense"
                                                    label="Domain"
                                                    required
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </DialogContent>
                                    <DialogActions sx={{ p: 3, pt: 0 }}>
                                        <Button
                                            onClick={() => {
                                                setIsOpen(false);
                                                setEditingClause(null);
                                                setNewClause({ title: '', description: '', domain: '' });
                                            }}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 500
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                px: 3
                                            }}
                                        >
                                            {editingClause ? 'Update' : 'Add'} Clause
                                        </Button>
                                    </DialogActions>
                                </form>
                            </Dialog>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {deleteDialogOpen && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={dialogVariants}
                        >
                            <Dialog
                                open={deleteDialogOpen}
                                onClose={() => setDeleteDialogOpen(false)}
                                maxWidth="sm"
                                fullWidth
                                PaperProps={{
                                    component: motion.div,
                                    variants: dialogVariants,
                                    sx: {
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: theme.palette.divider
                                    }
                                }}
                            >
                                <DialogTitle sx={{
                                    fontWeight: 600,
                                    letterSpacing: '-0.25px',
                                    pb: 2,
                                    color: theme.palette.error.main
                                }}>
                                    Delete Clause
                                </DialogTitle>
                                <DialogContent>
                                    <Typography>
                                        Are you sure you want to delete this clause? This action is irreversible and cannot be undone.
                                    </Typography>
                                </DialogContent>
                                <DialogActions sx={{ p: 3, pt: 0 }}>
                                    <Button
                                        onClick={() => setDeleteDialogOpen(false)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 500
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={confirmDelete}
                                        variant="contained"
                                        color="error"
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            px: 3
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default ClauseManager; 