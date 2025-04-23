import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField,
    Snackbar,
    Alert,
    CircularProgress,
    Typography,
    Paper
} from '@mui/material';
import Layout from '../common/Layout';
import DocumentList from './DocumentList';
import { Document } from '../../types';
import { updateDocument, addApprovers } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [approverEmail, setApproverEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleDocumentSelect = async (document: Document) => {
        setSelectedDocument(document);
        
        // If user is reviewer and document status is new or pending, update to in_progress
        if (user?.role === 'reviewer' && 
            (document.status === 'new' || document.status === 'pending')) {
            try {
                await updateDocument(document._id, {
                    status: 'in_progress',
                    notes: 'Document opened for review'
                });
                setSelectedDocument({
                    ...document,
                    status: 'in_progress' as const
                });
            } catch (error) {
                console.error('Failed to update document status:', error);
            }
        }
    };

    const handleSave = async () => {
        if (!selectedDocument) return;

        setIsSaving(true);
        try {
            await updateDocument(selectedDocument._id, {
                status: user?.role === 'reviewer' ? 'changes_made' : 'in_progress',
                notes: user?.role === 'reviewer' ? 'Document marked as reviewed' : 'Document sent back for review'
            });
            setSnackbar({
                open: true,
                message: 'Document saved successfully',
                severity: 'success'
            });
            setSelectedDocument({
                ...selectedDocument,
                status: user?.role === 'reviewer' ? 'changes_made' as const : 'in_progress' as const
            });
        } catch (error) {
            console.error('Failed to save document:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save document',
                severity: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedDocument) return;

        setIsApproving(true);
        try {
            await updateDocument(selectedDocument._id, {
                status: 'approved',
                notes: 'Document approved'
            });
            setSnackbar({
                open: true,
                message: 'Document approved successfully',
                severity: 'success'
            });
            setSelectedDocument({
                ...selectedDocument,
                status: 'approved' as const
            });
        } catch (error) {
            console.error('Failed to approve document:', error);
            setSnackbar({
                open: true,
                message: 'Failed to approve document',
                severity: 'error'
            });
        } finally {
            setIsApproving(false);
        }
    };

    const handleAssignApprover = async () => {
        if (!selectedDocument || !approverEmail) return;

        try {
            await addApprovers(selectedDocument._id, [approverEmail]);
            setIsAssignDialogOpen(false);
            setApproverEmail('');
            setSnackbar({
                open: true,
                message: 'Approver assigned successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Failed to assign approver:', error);
            setSnackbar({
                open: true,
                message: 'Failed to assign approver',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const renderActionButtons = () => {
        if (!selectedDocument) return null;

        if (user?.role === 'reviewer') {
            return (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsAssignDialogOpen(true)}
                        disabled={isSaving}
                    >
                        Assign Approvers
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{ ml: 2 }}
                    >
                        {isSaving ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </>
            );
        } else if (user?.role === 'approver') {
            return (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Saving...
                            </>
                        ) : (
                            'Send Back for Review'
                        )}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleApprove}
                        disabled={isApproving || selectedDocument.status === 'approved'}
                        sx={{ ml: 2 }}
                    >
                        {isApproving ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Approving...
                            </>
                        ) : (
                            selectedDocument.status === 'approved' ? 'Approved' : 'Approve'
                        )}
                    </Button>
                </>
            );
        }
        return null;
    };

    return (
        <Layout>
            <Box sx={{ 
                display: 'flex', 
                height: '100%',
            }}>
                <Box sx={{ width: '300px', height: '100vh' }}>
                    <DocumentList
                        onDocumentSelect={handleDocumentSelect}
                        selectedDocument={selectedDocument || undefined}
                    />
                </Box>
                <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    width: 'calc(100vw - 300px)',
                    backgroundColor: 'background.default',
                }}>
                    {selectedDocument ? (
                        <>
                            <Box sx={{ 
                                p: 2, 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                backgroundColor: 'background.paper',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {renderActionButtons()}
                                </Box>
                                {selectedDocument.status === 'approved' && (
                                    <Typography 
                                        variant="subtitle2" 
                                        sx={{ color: 'success.main' }}
                                    >
                                        ✓ Approved
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ 
                                flexGrow: 1, 
                                backgroundColor: 'white',
                                p: 3,
                                overflow: 'auto'
                            }}>
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 3, 
                                        minHeight: '100%',
                                        backgroundColor: 'grey.50'
                                    }}
                                >
                                    <Typography variant="body1" component="div">
                                        {selectedDocument.content ? (
                                            <iframe
                                                src={`data:application/pdf;base64,${selectedDocument.content}`}
                                                style={{
                                                    width: '100%',
                                                    height: 'calc(100vh - 200px)',
                                                    border: 'none'
                                                }}
                                                title="Document Viewer"
                                            />
                                        ) : (
                                            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                                No content available
                                            </Box>
                                        )}
                                    </Typography>
                                </Paper>
                            </Box>
                        </>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                backgroundColor: 'background.paper',
                            }}
                        >
                            Select a document to view
                        </Box>
                    )}
                </Box>
            </Box>

            <Dialog open={isAssignDialogOpen} onClose={() => setIsAssignDialogOpen(false)}>
                <DialogTitle>Assign Approver</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Approver Email"
                        type="email"
                        fullWidth
                        value={approverEmail}
                        onChange={(e) => setApproverEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssignApprover} variant="contained">
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Layout>
    );
};

export default Dashboard; 