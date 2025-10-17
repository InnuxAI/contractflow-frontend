// import React, { useState, useEffect } from 'react';
// import {
//     Box,
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     TextField,
//     List,
//     ListItem,
//     Typography,
//     Paper,
//     Select,
//     MenuItem,
//     FormControl,
//     InputLabel,
//     IconButton,
//     Snackbar,
//     Alert,
//     Chip,
//     Slider,
//     FormControlLabel,
//     Switch,
//     useTheme,
//     Autocomplete,
//     Stack,
//     Drawer,
//     Divider
// } from '@mui/material';
// import { Masonry } from '@mui/lab';
// import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterIcon, Close as CloseIcon } from '@mui/icons-material';
// import { motion, AnimatePresence } from 'framer-motion';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';

// interface Clause {
//     id: string;
//     title: string;
//     description: string;
//     domain: string;
//     created_at: string;
//     last_modified: string;
// }

// interface FilterState {
//     lastModifiedStart: Date | null;
//     lastModifiedEnd: Date | null;
//     createdStart: Date | null;
//     createdEnd: Date | null;
// }

// const dialogVariants = {
//     hidden: {
//         opacity: 0,
//         scale: 0.95,
//         y: 20
//     },
//     visible: {
//         opacity: 1,
//         scale: 1,
//         y: 0,
//         transition: {
//             type: "spring",
//             damping: 25,
//             stiffness: 300
//         }
//     },
//     exit: {
//         opacity: 0,
//         scale: 0.95,
//         y: 20,
//         transition: {
//             duration: 0.2
//         }
//     }
// };

// const gridItemVariants = {
//     hidden: {
//         opacity: 0,
//         scale: 0.95
//     },
//     visible: {
//         opacity: 1,
//         scale: 1,
//         transition: {
//             type: "spring",
//             damping: 20,
//             stiffness: 200
//         }
//     }
// };

// const drawerWidth = '30vw';

// const ClauseManager: React.FC = () => {
//     const theme = useTheme();
//     const [clauses, setClauses] = useState<Clause[]>([]);
//     const [selectedDomain, setSelectedDomain] = useState<string>('All');
//     const [filterState, setFilterState] = useState<FilterState>({
//         lastModifiedStart: null,
//         lastModifiedEnd: null,
//         createdStart: null,
//         createdEnd: null
//     });
//     const [isOpen, setIsOpen] = useState(false);
//     const [detailModalOpen, setDetailModalOpen] = useState(false);
//     const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
//     const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//     const [clauseToDelete, setClauseToDelete] = useState<string | null>(null);
//     const [editingClause, setEditingClause] = useState<Clause | null>(null);
//     const [newClause, setNewClause] = useState({
//         title: '',
//         description: '',
//         domain: ''
//     });
//     const [domains, setDomains] = useState<string[]>([]);
//     const [snackbar, setSnackbar] = useState<{
//         open: boolean;
//         message: string;
//         severity: 'success' | 'error';
//     }>({
//         open: false,
//         message: '',
//         severity: 'success'
//     });
//     const [columns, setColumns] = useState(3);
//     const [isGrid, setIsGrid] = useState(true);
//     const [showFilters, setShowFilters] = useState(false);

//     useEffect(() => {
//         fetchClauses();
//     }, []);

//     const fetchClauses = async () => {
//         try {
//             const response = await axios.get<Clause[]>('http://127.0.0.1:8002/api/clauses');
//             setClauses(response.data);
//             const uniqueDomains = Array.from(new Set(response.data.map(clause => clause.domain)));
//             setDomains(['All', ...uniqueDomains]);
//         } catch (error) {
//             console.error('Error fetching clauses:', error);
//             setSnackbar({
//                 open: true,
//                 message: 'Failed to fetch clauses',
//                 severity: 'error'
//             });
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             if (editingClause) {
//                 await axios.put(`http://127.0.0.1:8002/api/clauses/${editingClause.id}`, newClause);
//                 setSnackbar({
//                     open: true,
//                     message: 'Clause updated successfully',
//                     severity: 'success'
//                 });
//             } else {
//                 await axios.post('http://127.0.0.1:8002/api/clauses', newClause);
//                 setSnackbar({
//                     open: true,
//                     message: 'Clause created successfully',
//                     severity: 'success'
//                 });
//             }
//             setIsOpen(false);
//             setNewClause({ title: '', description: '', domain: '' });
//             setEditingClause(null);
//             fetchClauses();
//         } catch (error) {
//             console.error('Error saving clause:', error);
//             setSnackbar({
//                 open: true,
//                 message: 'Failed to save clause',
//                 severity: 'error'
//             });
//         }
//     };

//     const handleEdit = (clause: Clause) => {
//         setEditingClause(clause);
//         setNewClause({
//             title: clause.title,
//             description: clause.description,
//             domain: clause.domain
//         });
//         setIsOpen(true);
//     };

//     const handleCloseSnackbar = () => {
//         setSnackbar({ ...snackbar, open: false });
//     };

//     const handleDelete = async (clauseId: string, e: React.MouseEvent) => {
//         e.stopPropagation();
//         setClauseToDelete(clauseId);
//         setDeleteDialogOpen(true);
//     };

//     const confirmDelete = async () => {
//         if (!clauseToDelete) return;

//         try {
//             await axios.delete(`http://127.0.0.1:8002/api/clauses/${clauseToDelete}`);
//             fetchClauses();
//             setSnackbar({
//                 open: true,
//                 message: 'Clause deleted successfully',
//                 severity: 'success'
//             });
//         } catch (error) {
//             console.error('Error deleting clause:', error);
//             setSnackbar({
//                 open: true,
//                 message: 'Failed to delete clause',
//                 severity: 'error'
//             });
//         } finally {
//             setDeleteDialogOpen(false);
//             setClauseToDelete(null);
//         }
//     };

//     const handleFilterChange = (field: keyof FilterState, value: unknown) => {
//         setFilterState(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const clearFilters = () => {
//         setSelectedDomain('All');
//         setFilterState({
//             lastModifiedStart: null,
//             lastModifiedEnd: null,
//             createdStart: null,
//             createdEnd: null
//         });
//     };

//     // Get clause count for each domain
//     const getDomainClauseCount = (domain: string) => {
//         if (domain === 'All') return clauses.length;
//         return clauses.filter(clause => clause.domain === domain).length;
//     };

//     const filteredClauses = clauses.filter(clause => {
//         // Domain filter (single source of truth)
//         if (selectedDomain !== 'All' && clause.domain !== selectedDomain) {
//             return false;
//         }

//         // Last Modified date range filter
//         const lastModified = new Date(clause.last_modified);
//         if (filterState.lastModifiedStart && lastModified < filterState.lastModifiedStart) {
//             return false;
//         }
//         if (filterState.lastModifiedEnd && lastModified > filterState.lastModifiedEnd) {
//             return false;
//         }

//         // Created date range filter
//         const created = new Date(clause.created_at);
//         if (filterState.createdStart && created < filterState.createdStart) {
//             return false;
//         }
//         if (filterState.createdEnd && created > filterState.createdEnd) {
//             return false;
//         }

//         return true;
//     });

//     const getDomainPillColors = (domain: string) => {
//         const domainHash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//         const domainHue = (0 + domainHash) % 360;

//         return {
//             background: `hsl(${domainHue}, 90%, 10%)`,
//             text: `hsl(${domainHue}, 100%, 65%)`
//         };
//     };

//     const clauseCard = (clause: Clause) => {
//         const pillColors = getDomainPillColors(clause.domain);
//         return (
//             <motion.div
//                 key={clause.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 transition={{ duration: 0.3 }}
//                 whileHover={{
//                     scale: 1.01,
//                     boxShadow: theme.shadows[3]
//                 }}
//                 whileTap={{ scale: 0.99 }}
//             >
//                 <Paper
//                     sx={{
//                         p: 3,
//                         width: '100%',
//                         cursor: 'pointer',
//                         backgroundColor: theme.palette.background.paper,
//                         border: '1px solid',
//                         borderColor: theme.palette.divider,
//                         transition: 'all 0.2s ease-in-out',
//                         borderRadius: 2,
//                         '&:hover': {
//                             backgroundColor: theme.palette.action.hover,
//                             transform: 'translateY(-2px)',
//                             boxShadow: theme.shadows[4]
//                         }
//                     }}
//                     onClick={() => {
//                         setSelectedClause(clause);
//                         setDetailModalOpen(true);
//                     }}
//                 >
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                         <Typography
//                             variant="h6"
//                             component="h2"
//                             sx={{
//                                 fontWeight: 600,
//                                 mb: 1,
//                                 letterSpacing: '-0.25px',
//                                 color: theme.palette.text.primary
//                             }}
//                         >
//                             {clause.title}
//                         </Typography>
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                             <IconButton
//                                 size="small"
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleEdit(clause);
//                                 }}
//                                 sx={{
//                                     color: theme.palette.primary.main,
//                                     '&:hover': {
//                                         backgroundColor: theme.palette.primary.light,
//                                         color: theme.palette.primary.contrastText
//                                     }
//                                 }}
//                             >
//                                 <EditIcon />
//                             </IconButton>
//                             <IconButton
//                                 size="small"
//                                 onClick={(e) => handleDelete(clause.id, e)}
//                                 sx={{
//                                     color: theme.palette.error.main,
//                                     '&:hover': {
//                                         backgroundColor: theme.palette.error.light,
//                                         color: theme.palette.error.contrastText
//                                     }
//                                 }}
//                             >
//                                 <DeleteIcon />
//                             </IconButton>
//                         </Box>
//                     </Box>
//                     <Chip
//                         label={clause.domain}
//                         size="small"
//                         sx={{
//                             mb: 1.5,
//                             backgroundColor: pillColors.background,
//                             color: pillColors.text,
//                             fontWeight: 500
//                         }}
//                     />
//                     <Typography
//                         variant="body2"
//                         color="text.secondary"
//                         sx={{
//                             lineHeight: 1.6,
//                             letterSpacing: '0.00938em',
//                             mb: 2,
//                             display: '-webkit-box',
//                             WebkitLineClamp: 4,
//                             WebkitBoxOrient: 'vertical',
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis'
//                         }}
//                     >
//                         {clause.description}
//                     </Typography>
//                     <Typography
//                         variant="caption"
//                         color="text.disabled"
//                     >
//                         Created: {new Date(clause.created_at).toLocaleString()}
//                         <br />
//                         Last Modified: {new Date(clause.last_modified).toLocaleString()}
//                     </Typography>
//                 </Paper>
//             </motion.div>
//         );
//     };

//     return (
//         <Box sx={{
//             display: 'flex',
//             height: 'calc(100vh - 64px)',
//             backgroundColor: theme.palette.background.default,
//         }}>
//             {/* Filter Drawer */}
//             <Drawer
//                 variant="temporary"
//                 anchor="left"
//                 open={showFilters}
//                 onClose={() => setShowFilters(false)}
//                 sx={{
//                     width: drawerWidth,
//                     flexShrink: 0,
//                     '& .MuiDrawer-paper': {
//                         width: drawerWidth,
//                         boxSizing: 'border-box',
//                         borderRight: `1px solid ${theme.palette.divider}`,
//                         backgroundColor: theme.palette.background.paper,
//                         position: 'relative',
//                     },
//                 }}
//             >
//                 <Box sx={{ p: 3 }}>
//                     <Box sx={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         mb: 3
//                     }}>
//                         <Typography variant="h6" component="h2">
//                             Filters
//                         </Typography>
//                         <IconButton onClick={() => setShowFilters(false)}>
//                             <CloseIcon />
//                         </IconButton>
//                     </Box>

//                     <LocalizationProvider dateAdapter={AdapterDateFns}>
//                         <Stack spacing={3}>
//                             <FormControl fullWidth>
//                                 <InputLabel>Domain</InputLabel>
//                                 <Select
//                                     value={selectedDomain}
//                                     label="Domain"
//                                     onChange={(e) => setSelectedDomain(e.target.value)}
//                                 >
//                                     {domains.map((domain) => (
//                                         <MenuItem key={domain} value={domain}>
//                                             {domain}
//                                         </MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>

//                             <Box>
//                                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                                     Last Modified
//                                 </Typography>
//                                 <Box sx={{ display: 'flex', gap: 2 }}>
//                                     <DatePicker
//                                         label="Start Date"
//                                         value={filterState.lastModifiedStart}
//                                         onChange={(date) => handleFilterChange('lastModifiedStart', date)}
//                                         renderInput={(params) => <TextField {...params} fullWidth />}
//                                     />
//                                     <DatePicker
//                                         label="End Date"
//                                         value={filterState.lastModifiedEnd}
//                                         onChange={(date) => handleFilterChange('lastModifiedEnd', date)}
//                                         renderInput={(params) => <TextField {...params} fullWidth />}
//                                     />
//                                 </Box>
//                             </Box>

//                             <Box>
//                                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                                     Created Date
//                                 </Typography>
//                                 <Box sx={{ display: 'flex', gap: 2 }}>
//                                     <DatePicker
//                                         label="Start Date"
//                                         value={filterState.createdStart}
//                                         onChange={(date) => handleFilterChange('createdStart', date)}
//                                         renderInput={(params) => <TextField {...params} fullWidth />}
//                                     />
//                                     <DatePicker
//                                         label="End Date"
//                                         value={filterState.createdEnd}
//                                         onChange={(date) => handleFilterChange('createdEnd', date)}
//                                         renderInput={(params) => <TextField {...params} fullWidth />}
//                                     />
//                                 </Box>
//                             </Box>

//                             <Divider />

//                             <Box>
//                                 <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                                     View Options
//                                 </Typography>
//                                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                                     <FormControlLabel
//                                         control={
//                                             <Switch
//                                                 checked={isGrid}
//                                                 onChange={(e) => setIsGrid(e.target.checked)}
//                                             />
//                                         }
//                                         label="Grid View"
//                                     />

//                                     {isGrid && (
//                                         <Box sx={{ width: '100%' }}>
//                                             <Typography variant="caption" gutterBottom sx={{ display: 'block' }}>
//                                                 Columns: {columns}
//                                             </Typography>
//                                             <Slider
//                                                 value={columns}
//                                                 onChange={(_, value) => setColumns(value as number)}
//                                                 min={1}
//                                                 max={6}
//                                                 step={1}
//                                                 marks={[
//                                                     { value: 1, label: '1' },
//                                                     { value: 2, label: '2' },
//                                                     { value: 3, label: '3' },
//                                                     { value: 4, label: '4' },
//                                                     { value: 5, label: '5' },
//                                                     { value: 6, label: '6' }
//                                                 ]}
//                                             />
//                                         </Box>
//                                     )}
//                                 </Box>
//                             </Box>

//                             <Button
//                                 variant="outlined"
//                                 color="secondary"
//                                 onClick={clearFilters}
//                                 fullWidth
//                             >
//                                 Clear All Filters
//                             </Button>
//                         </Stack>
//                     </LocalizationProvider>
//                 </Box>
//             </Drawer>

//             {/* Main Content */}
//             <Box
//                 component="main"
//                 sx={{
//                     flexGrow: 1,
//                     display: 'flex',
//                     height: '100%',
//                     overflow: 'hidden',
//                 }}
//             >
//                 {/* Domain Sidebar */}
//                 <Box
//                     sx={{
//                         width: '280px',
//                         borderRight: `1px solid ${theme.palette.divider}`,
//                         backgroundColor: theme.palette.background.paper,
//                         display: 'flex',
//                         flexDirection: 'column',
//                     }}
//                 >
//                     <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
//                         <Typography
//                             variant="h6"
//                             sx={{
//                                 fontWeight: 600,
//                                 mb: 2,
//                             }}
//                         >
//                             Domains
//                         </Typography>
//                         <Button
//                             variant="contained"
//                             startIcon={<AddIcon />}
//                             onClick={() => setIsOpen(true)}
//                             fullWidth
//                             sx={{
//                                 borderRadius: '8px',
//                                 textTransform: 'none',
//                                 fontWeight: 600,
//                             }}
//                         >
//                             Add New Clause
//                         </Button>
//                     </Box>

//                     <Box sx={{ flex: 1, overflow: 'auto' }}>
//                         <List sx={{ p: 1 }}>
//                             {domains.map((domain) => {
//                                 const count = getDomainClauseCount(domain);
//                                 const isSelected = selectedDomain === domain;
//                                 const pillColors = getDomainPillColors(domain);

//                                 return (
//                                     <ListItem
//                                         key={domain}
//                                         sx={{
//                                             mb: 0.5,
//                                             borderRadius: '8px',
//                                             cursor: 'pointer',
//                                             backgroundColor: isSelected ? 'action.selected' : 'transparent',
//                                             '&:hover': {
//                                                 backgroundColor: isSelected ? 'action.selected' : 'action.hover',
//                                             },
//                                             transition: 'background-color 0.2s ease',
//                                         }}
//                                         onClick={() => setSelectedDomain(domain)}
//                                     >
//                                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
//                                             <Box
//                                                 sx={{
//                                                     width: 8,
//                                                     height: 8,
//                                                     borderRadius: '50%',
//                                                     backgroundColor: domain === 'All'
//                                                         ? theme.palette.primary.main
//                                                         : pillColors.text,
//                                                     mr: 2,
//                                                 }}
//                                             />
//                                             <Box sx={{ flex: 1 }}>
//                                                 <Typography
//                                                     variant="body2"
//                                                     sx={{
//                                                         fontWeight: isSelected ? 600 : 500,
//                                                         color: isSelected ? 'primary.main' : 'text.primary'
//                                                     }}
//                                                 >
//                                                     {domain}
//                                                 </Typography>
//                                             </Box>
//                                             <Chip
//                                                 label={count}
//                                                 size="small"
//                                                 sx={{
//                                                     height: 20,
//                                                     fontSize: '0.7rem',
//                                                     backgroundColor: isSelected
//                                                         ? 'primary.main'
//                                                         : 'action.hover',
//                                                     color: isSelected
//                                                         ? 'primary.contrastText'
//                                                         : 'text.secondary',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </ListItem>
//                                 );
//                             })}
//                         </List>
//                     </Box>
//                 </Box>

//                 {/* Clauses Content */}
//                 <Box
//                     sx={{
//                         flex: 1,
//                         p: 3,
//                         display: 'flex',
//                         flexDirection: 'column',
//                         overflow: 'hidden',
//                     }}
//                 >
//                     <Box sx={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         mb: 3,
//                         flexShrink: 0,
//                     }}>
//                         <Typography
//                             variant="h4"
//                             component="h1"
//                             sx={{
//                                 fontWeight: 700,
//                                 fontSize: '1.75rem',
//                                 letterSpacing: '-0.02em',
//                                 background: theme.palette.mode === 'light'
//                                     ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
//                                     : 'linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)',
//                                 WebkitBackgroundClip: 'text',
//                                 WebkitTextFillColor: 'transparent',
//                                 backgroundClip: 'text',
//                             }}
//                         >
//                             {selectedDomain === 'All' ? 'All Clauses' : `${selectedDomain} Clauses`}
//                         </Typography>
//                         <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
//                             <Button
//                                 variant="outlined"
//                                 startIcon={<FilterIcon />}
//                                 onClick={() => setShowFilters(!showFilters)}
//                                 sx={{
//                                     borderRadius: '8px',
//                                     textTransform: 'none',
//                                     fontWeight: 600,
//                                     px: 2.5,
//                                     py: 1,
//                                 }}
//                             >
//                                 {showFilters ? 'Hide Filters' : 'Show Filters'}
//                             </Button>
//                         </Box>
//                     </Box>

//                     <Box sx={{
//                         flex: 1,
//                         overflow: 'hidden auto',
//                         position: 'relative',
//                         width: '100%',
//                         '&::-webkit-scrollbar': {
//                             width: '6px',
//                         },
//                     '&::-webkit-scrollbar-track': {
//                         background: 'transparent',
//                     },
//                     '&::-webkit-scrollbar-thumb': {
//                         background: theme.palette.divider,
//                         borderRadius: '3px',
//                         '&:hover': {
//                             background: theme.palette.text.secondary,
//                         }
//                     },
//                 }}>
//                     <AnimatePresence mode="wait">
//                         {isGrid ? (
//                             <motion.div
//                                 key="grid"
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 transition={{ duration: 0.2 }}
//                                 style={{
//                                     height: '100%',
//                                     paddingRight: '8px',
//                                 }}
//                             >
//                                 <Masonry columns={columns} spacing={3}>
//                                     {filteredClauses.map((clause, index) => (
//                                         <motion.div
//                                             key={clause.id}
//                                             variants={gridItemVariants}
//                                             initial="hidden"
//                                             animate="visible"
//                                             transition={{ delay: index * 0.05 }}
//                                         >
//                                             {clauseCard(clause)}
//                                         </motion.div>
//                                     ))}
//                                 </Masonry>
//                             </motion.div>
//                         ) : (
//                             <motion.div
//                                 key="list"
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 transition={{ duration: 0.2 }}
//                                 style={{
//                                     height: '100%',
//                                     paddingRight: '8px',
//                                 }}
//                             >
//                                 <Paper
//                                     sx={{
//                                         height: '100%',
//                                         borderRadius: '12px',
//                                         backgroundColor: theme.palette.background.paper,
//                                         border: '1px solid',
//                                         borderColor: theme.palette.divider,
//                                         overflow: 'hidden',
//                                         backdropFilter: 'blur(12px)',
//                                         WebkitBackdropFilter: 'blur(12px)',
//                                         boxShadow: theme.palette.mode === 'light'
//                                             ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
//                                             : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
//                                     }}
//                                 >
//                                     <List sx={{
//                                         p: 0,
//                                         height: '100%',
//                                         overflow: 'hidden auto',
//                                         width: '100%',
//                                         '&::-webkit-scrollbar': {
//                                             width: '6px',
//                                         },
//                                         '&::-webkit-scrollbar-track': {
//                                             background: 'transparent',
//                                         },
//                                         '&::-webkit-scrollbar-thumb': {
//                                             background: theme.palette.divider,
//                                             borderRadius: '3px',
//                                             '&:hover': {
//                                                 background: theme.palette.text.secondary,
//                                             }
//                                         },
//                                     }}>
//                                         {filteredClauses.map((clause, index) => (
//                                             <motion.div
//                                                 key={clause.id}
//                                                 initial={{ opacity: 0, y: 20 }}
//                                                 animate={{ opacity: 1, y: 0 }}
//                                                 transition={{ delay: index * 0.05 }}
//                                             >
//                                                 <ListItem
//                                                     sx={{
//                                                         p: 2.5,
//                                                         borderBottom: '1px solid',
//                                                         borderColor: theme.palette.divider,
//                                                         borderRadius: '8px',
//                                                         mx: 1,
//                                                         mb: 0.5,
//                                                         width: 'calc(100% - 16px)',
//                                                         transition: 'all 0.2s ease',
//                                                         '&:hover': {
//                                                             backgroundColor: theme.palette.action.hover,
//                                                             transform: 'translateX(2px)',
//                                                         },
//                                                         '&:last-child': {
//                                                             borderBottom: 'none'
//                                                         }
//                                                     }}
//                                                 >
//                                                     {clauseCard(clause)}
//                                                 </ListItem>
//                                             </motion.div>
//                                         ))}
//                                     </List>
//                                 </Paper>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </Box>

//                 <AnimatePresence>
//                     {isOpen && (
//                         <motion.div
//                             initial="hidden"
//                             animate="visible"
//                             exit="exit"
//                             variants={dialogVariants}
//                         >
//                             <Dialog
//                                 open={isOpen}
//                                 onClose={() => {
//                                     setIsOpen(false);
//                                     setEditingClause(null);
//                                     setNewClause({ title: '', description: '', domain: '' });
//                                 }}
//                                 maxWidth="sm"
//                                 fullWidth
//                                 PaperProps={{
//                                     component: motion.div,
//                                     variants: dialogVariants,
//                                     sx: {
//                                         borderRadius: 2,
//                                         border: '1px solid',
//                                         borderColor: theme.palette.divider
//                                     }
//                                 }}
//                             >
//                                 <DialogTitle sx={{
//                                     fontWeight: 600,
//                                     letterSpacing: '-0.25px',
//                                     pb: 2
//                                 }}>
//                                     {editingClause ? 'Edit Clause' : 'Add New Clause'}
//                                 </DialogTitle>
//                                 <form onSubmit={handleSubmit}>
//                                     <DialogContent sx={{ pt: 2 }}>
//                                         <TextField
//                                             autoFocus
//                                             margin="dense"
//                                             label="Title"
//                                             fullWidth
//                                             value={newClause.title}
//                                             onChange={(e) => setNewClause({ ...newClause, title: e.target.value })}
//                                             required
//                                             sx={{ mb: 2 }}
//                                         />
//                                         <TextField
//                                             margin="dense"
//                                             label="Description"
//                                             fullWidth
//                                             multiline
//                                             rows={4}
//                                             value={newClause.description}
//                                             onChange={(e) => setNewClause({ ...newClause, description: e.target.value })}
//                                             required
//                                             sx={{ mb: 2 }}
//                                         />
//                                         <Autocomplete
//                                             freeSolo
//                                             options={domains.filter(domain => domain !== 'All')}
//                                             value={newClause.domain}
//                                             onChange={(_, newValue) => {
//                                                 setNewClause({ ...newClause, domain: newValue || '' });
//                                             }}
//                                             onInputChange={(_, newInputValue) => {
//                                                 setNewClause({ ...newClause, domain: newInputValue });
//                                             }}
//                                             renderInput={(params) => (
//                                                 <TextField
//                                                     {...params}
//                                                     margin="dense"
//                                                     label="Domain"
//                                                     required
//                                                     fullWidth
//                                                 />
//                                             )}
//                                         />
//                                     </DialogContent>
//                                     <DialogActions sx={{ p: 3, pt: 0 }}>
//                                         <Button
//                                             onClick={() => {
//                                                 setIsOpen(false);
//                                                 setEditingClause(null);
//                                                 setNewClause({ title: '', description: '', domain: '' });
//                                             }}
//                                             sx={{
//                                                 textTransform: 'none',
//                                                 fontWeight: 500
//                                             }}
//                                         >
//                                             Cancel
//                                         </Button>
//                                         <Button
//                                             type="submit"
//                                             variant="contained"
//                                             sx={{
//                                                 textTransform: 'none',
//                                                 fontWeight: 500,
//                                                 px: 3
//                                             }}
//                                         >
//                                             {editingClause ? 'Update' : 'Add'} Clause
//                                         </Button>
//                                     </DialogActions>
//                                 </form>
//                             </Dialog>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 <AnimatePresence>
//                     {detailModalOpen && selectedClause && (
//                         <motion.div
//                             initial="hidden"
//                             animate="visible"
//                             exit="exit"
//                             variants={dialogVariants}
//                         >
//                             <Dialog
//                                 open={detailModalOpen}
//                                 onClose={() => setDetailModalOpen(false)}
//                                 maxWidth="md"
//                                 fullWidth
//                                 PaperProps={{
//                                     component: motion.div,
//                                     variants: dialogVariants,
//                                     sx: {
//                                         borderRadius: 2,
//                                         border: '1px solid',
//                                         borderColor: theme.palette.divider,
//                                         maxHeight: '80vh'
//                                     }
//                                 }}
//                             >
//                                 <DialogTitle sx={{
//                                     fontWeight: 600,
//                                     letterSpacing: '-0.25px',
//                                     pb: 2,
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     alignItems: 'flex-start'
//                                 }}>
//                                     <Box>
//                                         <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
//                                             {selectedClause.title}
//                                         </Typography>
//                                         <Chip
//                                             label={selectedClause.domain}
//                                             size="small"
//                                             sx={{
//                                                 backgroundColor: getDomainPillColors(selectedClause.domain).background,
//                                                 color: getDomainPillColors(selectedClause.domain).text,
//                                                 fontWeight: 500
//                                             }}
//                                         />
//                                     </Box>
//                                     <IconButton
//                                         onClick={() => setDetailModalOpen(false)}
//                                         sx={{ mt: -1, mr: -1 }}
//                                     >
//                                         <CloseIcon />
//                                     </IconButton>
//                                 </DialogTitle>
//                                 <DialogContent>
//                                     <Box sx={{ mb: 3 }}>
//                                         <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
//                                             Description
//                                         </Typography>
//                                         <Typography
//                                             variant="body1"
//                                             sx={{
//                                                 lineHeight: 1.7,
//                                                 whiteSpace: 'pre-wrap',
//                                                 color: theme.palette.text.primary
//                                             }}
//                                         >
//                                             {selectedClause.description}
//                                         </Typography>
//                                     </Box>

//                                     <Box sx={{
//                                         mt: 3,
//                                         p: 2,
//                                         backgroundColor: theme.palette.action.hover,
//                                         borderRadius: 2
//                                     }}>
//                                         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
//                                             Metadata
//                                         </Typography>
//                                         <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
//                                             <Box>
//                                                 <Typography variant="caption" color="text.disabled">
//                                                     Created
//                                                 </Typography>
//                                                 <Typography variant="body2">
//                                                     {new Date(selectedClause.created_at).toLocaleString()}
//                                                 </Typography>
//                                             </Box>
//                                             <Box>
//                                                 <Typography variant="caption" color="text.disabled">
//                                                     Last Modified
//                                                 </Typography>
//                                                 <Typography variant="body2">
//                                                     {new Date(selectedClause.last_modified).toLocaleString()}
//                                                 </Typography>
//                                             </Box>
//                                         </Box>
//                                     </Box>
//                                 </DialogContent>
//                                 <DialogActions sx={{ p: 3, pt: 0 }}>
//                                     <Button
//                                         onClick={() => {
//                                             setDetailModalOpen(false);
//                                             handleEdit(selectedClause);
//                                         }}
//                                         startIcon={<EditIcon />}
//                                         variant="outlined"
//                                         sx={{
//                                             textTransform: 'none',
//                                             fontWeight: 500,
//                                             borderRadius: '8px'
//                                         }}
//                                     >
//                                         Edit Clause
//                                     </Button>
//                                     <Button
//                                         onClick={() => setDetailModalOpen(false)}
//                                         variant="contained"
//                                         sx={{
//                                             textTransform: 'none',
//                                             fontWeight: 500,
//                                             borderRadius: '8px'
//                                         }}
//                                     >
//                                         Close
//                                     </Button>
//                                 </DialogActions>
//                             </Dialog>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 <AnimatePresence>
//                     {deleteDialogOpen && (
//                         <motion.div
//                             initial="hidden"
//                             animate="visible"
//                             exit="exit"
//                             variants={dialogVariants}
//                         >
//                             <Dialog
//                                 open={deleteDialogOpen}
//                                 onClose={() => setDeleteDialogOpen(false)}
//                                 maxWidth="sm"
//                                 fullWidth
//                                 PaperProps={{
//                                     component: motion.div,
//                                     variants: dialogVariants,
//                                     sx: {
//                                         borderRadius: 2,
//                                         border: '1px solid',
//                                         borderColor: theme.palette.divider
//                                     }
//                                 }}
//                             >
//                                 <DialogTitle sx={{
//                                     fontWeight: 600,
//                                     letterSpacing: '-0.25px',
//                                     pb: 2,
//                                     color: theme.palette.error.main
//                                 }}>
//                                     Delete Clause
//                                 </DialogTitle>
//                                 <DialogContent>
//                                     <Typography>
//                                         Are you sure you want to delete this clause? This action is irreversible and cannot be undone.
//                                     </Typography>
//                                 </DialogContent>
//                                 <DialogActions sx={{ p: 3, pt: 0 }}>
//                                     <Button
//                                         onClick={() => setDeleteDialogOpen(false)}
//                                         sx={{
//                                             textTransform: 'none',
//                                             fontWeight: 500
//                                         }}
//                                     >
//                                         Cancel
//                                     </Button>
//                                     <Button
//                                         onClick={confirmDelete}
//                                         variant="contained"
//                                         color="error"
//                                         sx={{
//                                             textTransform: 'none',
//                                             fontWeight: 500,
//                                             px: 3
//                                         }}
//                                     >
//                                         Delete
//                                     </Button>
//                                 </DialogActions>
//                             </Dialog>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 <Snackbar
//                     open={snackbar.open}
//                     autoHideDuration={6000}
//                     onClose={handleCloseSnackbar}
//                     anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                 >
//                     <Alert
//                         onClose={handleCloseSnackbar}
//                         severity={snackbar.severity}
//                         sx={{ width: '100%' }}
//                     >
//                         {snackbar.message}
//                     </Alert>
//                 </Snackbar>
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// export default ClauseManager;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClauseManager.css";

interface Clause {
  id: string;
  title: string;
  description: string;
  domain: string;
  created_at: string;
  last_modified: string;
}

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8002';

const ClauseManager: React.FC = () => {
  // ====================
  // Hooks
  // ====================
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Add/Edit Clause modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<Clause | null>(null);
  const [newClause, setNewClause] = useState({
    title: "",
    description: "",
    domain: "Legal",
  });
  const [creating, setCreating] = useState(false);

  // Delete confirmation modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clauseToDelete, setClauseToDelete] = useState<string | null>(null);

  // ====================
  // Effects
  // ====================
  useEffect(() => {
    fetchClauses();
  }, []);

  // ====================
  // Functions
  // ====================
  const fetchClauses = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Clause[]>(
        `${API_URL}/api/clauses`
      );
      setClauses(res.data);

      const uniqueDomains = Array.from(new Set(res.data.map((c) => c.domain)));
      setDomains(["All", ...uniqueDomains]);
      setError("");
    } catch (err) {
      console.error("Error fetching clauses:", err);
      setError("Failed to load clauses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClause = async () => {
    if (!newClause.title.trim() || !newClause.description.trim()) {
      setError("Title and description are required");
      return;
    }
    try {
      setCreating(true);
      
      if (editingClause) {
        // Update existing clause
        const res = await axios.put<Clause>(
          `${API_URL}/api/clauses/${editingClause.id}`,
          newClause
        );
        setClauses((prev) =>
          prev.map((c) => (c.id === editingClause.id ? res.data : c))
        );
      } else {
        // Create new clause
        const res = await axios.post<Clause>(
          `${API_URL}/api/clauses`,
          newClause
        );
        setClauses((prev) => [...prev, res.data]);
      }

      if (!domains.includes(newClause.domain)) {
        setDomains((prev) => [...prev, newClause.domain]);
      }

      setNewClause({ title: "", description: "", domain: "Legal" });
      setEditingClause(null);
      setError("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving clause:", err);
      setError(editingClause ? "Failed to update clause" : "Failed to create clause");
    } finally {
      setCreating(false);
    }
  };

  const handleEditClause = (clause: Clause, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClause(clause);
    setNewClause({
      title: clause.title,
      description: clause.description,
      domain: clause.domain,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (clauseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClauseToDelete(clauseId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clauseToDelete) return;

    try {
      await axios.delete(`${API_URL}/api/clauses/${clauseToDelete}`);
      setClauses((prev) => prev.filter((c) => c.id !== clauseToDelete));
      setDeleteDialogOpen(false);
      setClauseToDelete(null);
      setError("");
    } catch (err) {
      console.error("Error deleting clause:", err);
      setError("Failed to delete clause");
      setDeleteDialogOpen(false);
      setClauseToDelete(null);
    }
  };

  const filteredClauses = clauses.filter(
    (clause) => selectedDomain === "All" || clause.domain === selectedDomain
  );

  const getDomainColor = (domain: string) => {
    const map: Record<string, string> = {
      Legal: "var(--success)",
      Pharmaceutical: "#3b82f6",
      Finance: "#eab308",
      Technology: "#8b5cf6",
      Healthcare: "#14b8a6",
      Marketing: "#f43f5e",
    };
    return map[domain] || "#6b7280"; // default gray
  };

  // ====================
  // Render
  // ====================
  if (loading) return <div className="loading">Loading clauses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="clause-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Domains</h2>
        {domains.map((domain) => (
          <div
            key={domain}
            className={`domain-item ${
              selectedDomain === domain ? "active" : ""
            }`}
            onClick={() => setSelectedDomain(domain)}
          >
            {domain}{" "}
            <span className="count">
              (
              {domain === "All"
                ? clauses.length
                : clauses.filter((c) => c.domain === domain).length}
              )
            </span>
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>
          {selectedDomain === "All"
            ? "All Clauses"
            : `${selectedDomain} Clauses`}
        </h1>

        {/* Add Clause Button */}
        <button
          className="add-clause-btn modal-title"
          onClick={() => {
            setEditingClause(null);
            setNewClause({ title: "", description: "", domain: "Legal" });
            setIsModalOpen(true);
          }}
        >
          + Add Clause
        </button>

        {filteredClauses.length === 0 ? (
          <div className="no-clauses">No clauses found for this domain.</div>
        ) : (
          <div className="clauses-grid">
            {filteredClauses.map((clause) => (
              <div
                key={clause.id}
                className="clause-card"
                onClick={() => setSelectedClause(clause)}
              >
                <div className="card-header">
                  <h3>{clause.title}</h3>
                  <div className="card-actions">
                    <button
                      className="icon-btn edit"
                      onClick={(e) => handleEditClause(clause, e)}
                      title="Edit clause"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={(e) => handleDeleteClick(clause.id, e)}
                      title="Delete clause"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <span
                  className="domain-pill"
                  style={{ backgroundColor: getDomainColor(clause.domain) }}
                >
                  {clause.domain}
                </span>
                <p className="card-description">{clause.description}</p>
                <div className="card-meta">
                  <div>
                    Created: {new Date(clause.created_at).toLocaleString()}
                  </div>
                  <div>
                    Last Modified:{" "}
                    {new Date(clause.last_modified).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Clause Modal */}
      {selectedClause && (
        <div className="modal-backdrop" onClick={() => setSelectedClause(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedClause.title}</h2>
            <div
              className="modal-domain"
              style={{ backgroundColor: getDomainColor(selectedClause.domain) }}
            >
              {selectedClause.domain}
            </div>
            <p className="modal-description">{selectedClause.description}</p>
            <div className="modal-meta">
              <div>
                <strong>Created:</strong>{" "}
                {new Date(selectedClause.created_at).toLocaleString()}
              </div>
              <div>
                <strong>Last Modified:</strong>{" "}
                {new Date(selectedClause.last_modified).toLocaleString()}
              </div>
            </div>
            <button onClick={() => setSelectedClause(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Add/Edit Clause Modal */}
      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setIsModalOpen(false);
            setEditingClause(null);
            setNewClause({ title: "", description: "", domain: "Legal" });
          }}
        >
          <div
            className="modal form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingClause ? "Edit Clause" : "Add New Clause"}</h2>

            <div className="form-group">
              <label htmlFor="new-clause-title">Title</label>
              <input
                id="new-clause-title"
                type="text"
                placeholder="Enter clause title"
                value={newClause.title}
                onChange={(e) =>
                  setNewClause({ ...newClause, title: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-clause-desc">Description</label>
              <textarea
                id="new-clause-desc"
                placeholder="Enter clause description"
                value={newClause.description}
                onChange={(e) =>
                  setNewClause({ ...newClause, description: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-clause-domain">Domain</label>
              <select
                id="new-clause-domain"
                value={newClause.domain}
                onChange={(e) =>
                  setNewClause({ ...newClause, domain: e.target.value })
                }
              >
                {[
                  "Legal",
                  "Pharmaceutical",
                  "Finance",
                  "Technology",
                  "Healthcare",
                  "Marketing",
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-primary"
                onClick={handleCreateClause}
                disabled={creating}
              >
                {creating
                  ? editingClause
                    ? "Updating..."
                    : "Creating..."
                  : editingClause
                  ? "Update Clause"
                  : "Add Clause"}
              </button>
              <button
                className="btn-cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingClause(null);
                  setNewClause({ title: "", description: "", domain: "Legal" });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setDeleteDialogOpen(false);
            setClauseToDelete(null);
          }}
        >
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Delete Clause</h2>
            <p className="delete-modal-text">
              Are you sure you want to delete this clause?
            </p>
            <p className="delete-modal-warning">
              <strong>This action is irreversible and cannot be undone.</strong>
            </p>
            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setClauseToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClauseManager;
