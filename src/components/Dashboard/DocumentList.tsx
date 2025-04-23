import React, { useEffect, useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Paper,
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
    Divider,
    CircularProgress
} from '@mui/material';
import { Document, DocumentStatus } from '../../types';
import { getDocuments } from '../../services/api';
import StatusPill from '../common/StatusPill';

interface DocumentListProps {
    onDocumentSelect: (document: Document) => void;
    selectedDocument?: Document;
    refreshTrigger: number;
}

const DocumentList: React.FC<DocumentListProps> = ({
    onDocumentSelect,
    selectedDocument,
    refreshTrigger
}) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');

    useEffect(() => {
        const fetchDocuments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const docs = await getDocuments(statusFilter === 'ALL' ? undefined : statusFilter);
                setDocuments(docs);
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
            borderRight: 1,
            borderColor: 'divider',
        }}>
            <Box sx={{ 
                p: 2, 
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
            }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Documents</Typography>
                <FormControl fullWidth size="small">
                    <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                    <Select
                        labelId="status-filter-label"
                        value={statusFilter}
                        label="Filter by Status"
                        onChange={handleStatusFilterChange}
                    >
                        <MenuItem value="ALL">All Documents</MenuItem>
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="changes_made">Changes Made</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                backgroundColor: 'background.paper',
            }}>
                {documents.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No documents found
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {documents.map((doc, index) => (
                            <React.Fragment key={doc._id}>
                                <ListItem 
                                    disablePadding
                                    sx={{
                                        backgroundColor: selectedDocument?._id === doc._id 
                                            ? 'action.selected' 
                                            : 'transparent',
                                    }}
                                >
                                    <ListItemButton
                                        onDoubleClick={() => onDocumentSelect(doc)}
                                        sx={{ 
                                            py: 2,
                                            px: 2,
                                        }}
                                    >
                                        <Box sx={{ width: '100%' }}>
                                            <Typography 
                                                variant="subtitle1" 
                                                sx={{ 
                                                    mb: 1,
                                                    fontWeight: selectedDocument?._id === doc._id ? 600 : 400,
                                                    color: 'text.primary'
                                                }}
                                            >
                                                {doc.title}
                                            </Typography>
                                            <StatusPill status={doc.status} />
                                        </Box>
                                    </ListItemButton>
                                </ListItem>
                                {index < documents.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default DocumentList; 