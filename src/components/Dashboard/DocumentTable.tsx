import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridToolbar,
    GridFilterModel,
    GridSortModel,
} from '@mui/x-data-grid';
import { Visibility, Schedule, Warning } from '@mui/icons-material';
import { Document, DocumentStatus, UserRole } from '../../types';
import StatusPill from '../common/StatusPill';

// Extended interface to include approver emails
interface DocumentWithApproverEmails extends Document {
    approverEmails?: string[];
}

interface DocumentTableProps {
    documents: DocumentWithApproverEmails[];
    onDocumentSelect: (document: Document) => void;
    userRole?: UserRole;
    dashboardType?: 'action-required' | 'all-documents';
}

interface DocumentTableRow {
    id: string;
    title: string;
    status: DocumentStatus;
    priority: string;
    dueDate: string;
    assignedTo: string;
    createdAt: string;
    document: Document;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
    documents,
    onDocumentSelect,
    userRole,
    dashboardType = 'all-documents'
}) => {
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([
        { field: 'dueDate', sort: 'asc' },
    ]);

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
    const filteredDocuments = useMemo(() => {
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

        return filteredDocs;
    }, [documents, dashboardType, userRole]);

    // Convert documents to table rows
    const rows: DocumentTableRow[] = useMemo(() => {
        return filteredDocuments.map((doc) => {
            // Use approverEmails if available, otherwise fall back to approvers array
            let assignedTo = 'Unassigned';
            if (doc.approverEmails && doc.approverEmails.length > 0) {
                if (doc.approverEmails.length === 1) {
                    assignedTo = doc.approverEmails[0];
                } else {
                    assignedTo = `${doc.approverEmails[0]} (+${doc.approverEmails.length - 1} more)`;
                }
            } else if (doc.approvers && doc.approvers.length > 0) {
                if (doc.approvers.length === 1) {
                    assignedTo = doc.approvers[0];
                } else {
                    assignedTo = `${doc.approvers[0]} (+${doc.approvers.length - 1} more)`;
                }
            }

            return {
                id: doc._id,
                title: doc.title,
                status: doc.status,
                priority: doc.priority || 'normal',
                dueDate: doc.date_review_due || '',
                assignedTo,
                createdAt: doc.created_at || '',
                document: doc
            };
        });
    }, [filteredDocuments]);

    const columns: GridColDef[] = [
        {
            field: 'title',
            headerName: 'Document Title',
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {params.value}
                    </Typography>
                    {params.row.dueDate && isOverdue(params.row.dueDate) && (
                        <Tooltip title="Overdue">
                            <Warning color="error" fontSize="small" />
                        </Tooltip>
                    )}
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 180,
            renderCell: (params: GridRenderCellParams) => (
                <StatusPill status={params.value} />
            ),
        },
        {
            field: 'priority',
            headerName: 'Priority',
            width: 140,
            renderCell: (params: GridRenderCellParams) => {
                const priority = params.value as string;
                const color = priority === 'urgent' ? 'error' : 'info';
                return (
                    <Chip
                        label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                        color={color}
                        size="small"
                        variant="outlined"
                    />
                );
            },
        },
        {
            field: 'dueDate',
            headerName: 'Due Date',
            width: 160,
            renderCell: (params: GridRenderCellParams) => {
                if (!params.value) return '-';
                const isOverdueDate = isOverdue(params.value);
                const daysRemaining = getDaysRemaining(params.value);
                
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: isOverdueDate ? 'error.main' : 'text.primary',
                                fontWeight: isOverdueDate ? 'bold' : 'normal'
                            }}
                        >
                            {formatDate(params.value)}
                        </Typography>
                        {Math.abs(daysRemaining) <= 3 && (
                            <Tooltip title={isOverdueDate ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}>
                                <Schedule 
                                    color={isOverdueDate ? 'error' : 'warning'} 
                                    fontSize="small" 
                                />
                            </Tooltip>
                        )}
                    </Box>
                );
            },
            sortComparator: (v1, v2) => {
                if (!v1 && !v2) return 0;
                if (!v1) return 1;
                if (!v2) return -1;
                return new Date(v1).getTime() - new Date(v2).getTime();
            },
        },
        {
            field: 'assignedTo',
            headerName: 'Assigned To',
            width: 120,
            renderCell: (params: GridRenderCellParams) => {
                const assignedTo = params.value;
                // If it looks like an email, extract the name part
                if (assignedTo && assignedTo.includes('@')) {
                    const emailName = assignedTo.split('@')[0];
                    // Handle multiple approvers display
                    if (assignedTo.includes(' (+')) {
                        const parts = assignedTo.split(' (+');
                        const mainEmail = parts[0];
                        const count = parts[1];
                        const mainName = mainEmail.split('@')[0];
                        return (
                            <Tooltip title={assignedTo}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {mainName} (+{count}
                                </Typography>
                            </Tooltip>
                        );
                    }
                    return (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {emailName}
                        </Typography>
                    );
                }
                return (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {assignedTo || 'Unassigned'}
                    </Typography>
                );
            },
        },
        {
            field: 'createdAt',
            headerName: 'Created',
            width: 140,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" color="text.secondary">
                    {params.value ? formatDate(params.value) : '-'}
                </Typography>
            ),
            sortComparator: (v1, v2) => {
                if (!v1 && !v2) return 0;
                if (!v1) return 1;
                if (!v2) return -1;
                return new Date(v1).getTime() - new Date(v2).getTime();
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Open Document">
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDocumentSelect(params.row.document);
                        }}
                        sx={{ color: 'primary.main' }}
                    >
                        <Visibility fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            {rows.length === 0 ? (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px',
                    textAlign: 'center',
                    color: 'text.secondary'
                }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        No documents found
                    </Typography>
                    <Typography variant="body2">
                        {dashboardType === 'action-required' 
                            ? 'No documents require your action at this time.'
                            : 'No documents are available in the system.'
                        }
                    </Typography>
                </Box>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    slots={{
                        toolbar: GridToolbar,
                    }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                        },
                    }}
                    onRowClick={(params) => {
                        onDocumentSelect(params.row.document);
                    }}
                    sx={{
                        '& .MuiDataGrid-root': {
                            border: 'none',
                        },
                        '& .MuiDataGrid-row': {
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.16)',
                                },
                            },
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid rgba(224, 224, 224, 0.1)',
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderBottom: '2px solid rgba(224, 224, 224, 0.2)',
                            color: 'text.primary',
                            fontWeight: 'bold',
                            '& .MuiDataGrid-columnHeader': {
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 16px',
                            },
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '2px solid rgba(224, 224, 224, 0.2)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        },
                        '& .MuiDataGrid-toolbarContainer': {
                            padding: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            borderBottom: '1px solid rgba(224, 224, 224, 0.1)',
                        },
                        '& .MuiInputBase-root': {
                            color: 'text.primary',
                        },
                        '& .MuiSvgIcon-root': {
                            color: 'text.secondary',
                        },
                    }}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 25,
                            },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    autoHeight={false}
                />
            )}
        </Box>
    );
};

export default DocumentTable;
