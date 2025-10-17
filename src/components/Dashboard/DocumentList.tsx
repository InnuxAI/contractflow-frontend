import React, { useEffect, useState } from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
    CircularProgress,
    Tooltip,
    Chip,
} from '@mui/material';
import { Document, DocumentStatus, UserRole } from '../../types';
import { getDocuments, getUserById } from '../../services/api';
import StatusPill from '../common/StatusPill';

interface DocumentListProps {
  onDocumentSelect: (document: Document) => void;
  selectedDocument?: Document | null;
  documents: DocumentWithApproverEmails[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentWithApproverEmails[]>>;
  refreshTrigger?: number;
  dashboardType?: 'action-required' | 'all-documents';
  userRole?: UserRole;
}


export interface DocumentWithApproverEmails extends Document {
    approverEmails: string[];
}

const DocumentList: React.FC<DocumentListProps> = ({
    onDocumentSelect,
    selectedDocument,
    documents,
    setDocuments,
    refreshTrigger,
    dashboardType = 'all-documents',
    userRole
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'alphabetical'>('deadline');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Helper function to format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Helper function to check if date is overdue
    const isOverdue = (dueDateString: string) => {
        const dueDate = new Date(dueDateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Helper function to get days remaining
    const getDaysRemaining = (dueDateString: string) => {
        const dueDate = new Date(dueDateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Filter documents based on dashboard type and user role
    const getFilteredDocuments = () => {
        let filteredDocs = documents;

        if (dashboardType === 'action-required') {
            if (userRole === 'reviewer') {
                filteredDocs = documents.filter(doc => 
                    doc.status === 'new' || 
                    doc.status === 'pending' || 
                    doc.status === 'with_reviewer'
                );
            } else if (userRole === 'approver') {
                filteredDocs = documents.filter(doc => 
                    doc.status === 'with_approver'
                );
            }
        }

        return sortDocuments(filteredDocs, sortBy, sortOrder);
    };

    // Sort documents function
    const sortDocuments = (docs: DocumentWithApproverEmails[], sortType: string, order: string) => {
        return [...docs].sort((a, b) => {
            let comparison = 0;
            
            switch (sortType) {
                case 'priority':
                    const priorityOrder = { 'urgent': 0, 'normal': 1 };
                    comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                                (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
                    break;
                case 'deadline':
                    const aDeadline = new Date(a.date_review_due || a.created_at).getTime();
                    const bDeadline = new Date(b.date_review_due || b.created_at).getTime();
                    comparison = aDeadline - bDeadline;
                    break;
                case 'alphabetical':
                    comparison = a.title.localeCompare(b.title);
                    break;
                default:
                    comparison = 0;
            }
            
            return order === 'desc' ? -comparison : comparison;
        });
    };


    useEffect(() => {
        const fetchDocuments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const docs = await getDocuments(statusFilter === 'ALL' ? undefined : statusFilter);
                // For each document, fetch approver emails
                const docsWithEmails = await Promise.all(docs.map(async (doc) => {
                    if (doc.approvers && doc.approvers.length > 0) {
                        const approverUsers = await Promise.all(doc.approvers.map(async (id) => {
                            try {
                                const user = await getUserById(id);
                                return user.email;
                            } catch {
                                return id; // fallback to id if user not found
                            }
                        }));
                        return { ...doc, approverEmails: approverUsers };
                    } else {
                        return { ...doc, approverEmails: [] };
                    }
                }));
                setDocuments(docsWithEmails);
            } catch (err) {
                console.error('Failed to fetch documents:', err);
                setError('Failed to load documents');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, [statusFilter, refreshTrigger]);

    const handleStatusFilterChange = (event: SelectChangeEvent<DocumentStatus | 'ALL'>) => {
        setStatusFilter(event.target.value as DocumentStatus | 'ALL');
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            width: '100%',
            borderRight: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            overflow: 'hidden',
        }}>
            <Box sx={{ 
                p: 2, 
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0,
            }}>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        mb: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        letterSpacing: '-0.02em'
                    }}
                >
                    {dashboardType === 'action-required' 
                        ? `${userRole === 'reviewer' ? 'Reviewer' : 'Approver'} Dashboard - Documents Requiring Action`
                        : 'All Documents'
                    }
                </Typography>

                {/* Sort Controls */}
                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value as 'priority' | 'deadline' | 'alphabetical')}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    backgroundColor: 'background.default',
                                },
                            }}
                        >
                            <MenuItem value="deadline">Deadline</MenuItem>
                            <MenuItem value="priority">Priority</MenuItem>
                            <MenuItem value="alphabetical">Alphabetical</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Order</InputLabel>
                        <Select
                            value={sortOrder}
                            label="Order"
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    backgroundColor: 'background.default',
                                },
                            }}
                        >
                            <MenuItem value="asc">Ascending</MenuItem>
                            <MenuItem value="desc">Descending</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {dashboardType === 'all-documents' && (
                    <FormControl 
                        fullWidth 
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: 'background.default',
                                '& fieldset': {
                                    borderColor: 'divider',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }
                        }}
                    >
                        <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            value={statusFilter}
                            label="Filter by Status"
                            onChange={handleStatusFilterChange}
                        >
                            <MenuItem value="ALL">All Documents</MenuItem>
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="with_reviewer">With Reviewer</MenuItem>
                            <MenuItem value="with_approver">With Approver</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </Box>
            <Box sx={{ 
                flexGrow: 1, 
                overflow: 'hidden auto',
                backgroundColor: 'background.paper',
                width: '100%',
            }}>
                {getFilteredDocuments().length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            {dashboardType === 'action-required' 
                                ? 'No documents requiring action'
                                : 'No documents found'
                            }
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding sx={{ width: '100%', p: 1 }}>
                        {getFilteredDocuments().map((doc: DocumentWithApproverEmails) => {
                            const isSelected = selectedDocument?._id === doc._id;
                            const daysRemaining = getDaysRemaining(doc.date_review_due);
                            const overdue = isOverdue(doc.date_review_due);
                            
                            return (
                                <React.Fragment key={doc._id}>
                                    <ListItem 
                                        disablePadding
                                        sx={{
                                            backgroundColor: isSelected ? 'primary.main' : 'transparent',
                                            borderRadius: '12px',
                                            mb: 1,
                                            overflow: 'hidden',
                                            transition: 'all 0.2s ease',
                                            border: 1,
                                            borderColor: isSelected ? 'primary.main' : 'divider',
                                            '&:hover': {
                                                backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                                                transform: 'translateX(2px)',
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        <Tooltip
                                            title={
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                        Document Details:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                        • Document Type: {doc.title.split('.')[0]}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                        • Date Received: {formatDate(doc.date_received)}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                        • Review Due: {formatDate(doc.date_review_due)}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                        • Priority: {doc.priority?.toUpperCase() || 'NORMAL'}
                                                    </Typography>
                                                    {doc.approverEmails && doc.approverEmails.length > 0 && (
                                                        <>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, mb: 0.5 }}>
                                                                Approvers:
                                                            </Typography>
                                                            {doc.approverEmails.map((email: string, idx: number) => (
                                                                <Typography key={idx} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                                    • {email}
                                                                </Typography>
                                                            ))}
                                                        </>
                                                    )}
                                                </Box>
                                            }
                                            arrow
                                            placement="right"
                                        >
                                            <ListItemButton
                                                onDoubleClick={() => onDocumentSelect(doc)}
                                                sx={{ 
                                                    p: 2,
                                                    width: '100%',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.2s ease',
                                                    backgroundColor: 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: 'transparent',
                                                    },
                                                }}
                                            >
                                                <Box sx={{ width: '100%', minWidth: 0 }}>
                                                    {/* Document Title */}
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        sx={{ 
                                                            mb: 1,
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                            color: isSelected ? '#ffffff !important' : 'text.primary',
                                                            letterSpacing: '-0.01em',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {doc.title.split('.')[0]}
                                                    </Typography>

                                                    {dashboardType === 'action-required' && (
                                                        <Box sx={{ mb: 1 }}>
                                                            {/* Date Information */}
                                                            <Typography 
                                                                variant="caption" 
                                                                sx={{ 
                                                                    display: 'block',
                                                                    color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
                                                                    fontSize: '0.7rem',
                                                                    lineHeight: 1.2,
                                                                }}
                                                            >
                                                                Received: {formatDate(doc.date_received)}
                                                            </Typography>
                                                            <Typography 
                                                                variant="caption" 
                                                                sx={{ 
                                                                    display: 'block',
                                                                    color: overdue 
                                                                        ? (isSelected ? '#ffcdd2' : 'error.main')
                                                                        : (isSelected ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'),
                                                                    fontSize: '0.7rem',
                                                                    lineHeight: 1.2,
                                                                    fontWeight: overdue ? 600 : 400,
                                                                }}
                                                            >
                                                                Due: {formatDate(doc.date_review_due)}
                                                                {overdue ? ' (OVERDUE)' : ` (${daysRemaining} days)`}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Priority and Status */}
                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <StatusPill 
                                                            status={doc.status}
                                                            sx={{
                                                                ...(isSelected && {
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
                                                                    color: 'rgba(255, 255, 255, 0.9) !important',
                                                                    borderColor: 'rgba(255, 255, 255, 0.3) !important',
                                                                })
                                                            }}
                                                        />
                                                        <Chip
                                                            label={doc.priority?.toUpperCase() || 'NORMAL'}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                fontSize: '0.65rem',
                                                                height: '20px',
                                                                backgroundColor: doc.priority === 'urgent' 
                                                                    ? (isSelected ? 'rgba(255, 87, 34, 0.3)' : '#ff5722')
                                                                    : (isSelected ? 'rgba(76, 175, 80, 0.3)' : '#4caf50'),
                                                                color: doc.priority === 'urgent'
                                                                    ? (isSelected ? '#ffffff' : '#ffffff')
                                                                    : (isSelected ? '#ffffff' : '#ffffff'),
                                                                borderColor: doc.priority === 'urgent'
                                                                    ? (isSelected ? '#ff5722' : '#ff5722')
                                                                    : (isSelected ? '#4caf50' : '#4caf50'),
                                                                fontWeight: 600,
                                                                border: 'none',
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </ListItemButton>
                                        </Tooltip>
                                    </ListItem>
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default DocumentList; 