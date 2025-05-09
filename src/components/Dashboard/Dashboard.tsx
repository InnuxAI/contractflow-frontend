import React, { useState, useRef, useCallback } from 'react';
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
} from '@mui/material';
import DocumentList from './DocumentList';
import DocumentEditor, { DocumentEditorRef } from '../DocumentEditor/DocumentEditor';
import { Document } from '../../types';
import { updateDocument, addApprovers, getDocument } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useDocument } from '../../contexts/DocumentContext';
import ResizableLayout from '../common/ResizableLayout';
import AIChatSidebar from '../AIChatSidebar/AIChatSidebar';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { currentDocument, setCurrentDocument } = useDocument();
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [approverEmail, setApproverEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showEditor, setShowEditor] = useState(true);
    const editorRef = useRef<DocumentEditorRef>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const refreshDocument = useCallback(async (documentId: string) => {
        try {
            const refreshedDoc = await getDocument(documentId);
            setCurrentDocument(refreshedDoc);
            // Trigger document list refresh
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Failed to refresh document:', error);
            setSnackbar({
                open: true,
                message: 'Failed to refresh document',
                severity: 'error'
            });
        }
    }, [setCurrentDocument]);

    const handleDocumentSelect = async (document: Document) => {
        // If a document is already selected and it's different from the new selection
        if (currentDocument && currentDocument._id !== document._id) {
            // Clear the current document first
            setCurrentDocument(null);
            // Then fetch the fresh content of the new document
            await refreshDocument(document._id);
        } else {
            setCurrentDocument(document);
        }
        
        // If user is reviewer and document status is new or pending, update to in_progress
        if (user?.role === 'reviewer' && 
            (document.status === 'new' || document.status === 'pending')) {
            try {
                await updateDocument(document._id, {
                    status: 'in_progress',
                    notes: 'Document opened for review'
                });
                await refreshDocument(document._id);
            } catch (error) {
                console.error('Failed to update document status:', error);
            }
        }
    };

    const handleSave = async () => {
        if (!currentDocument || !editorRef.current) return;

        setIsSaving(true);
        try {
            // First save the document content
            await editorRef.current.save();
            
            // Then update document status
            await updateDocument(currentDocument._id, {
                status: user?.role === 'reviewer' ? 'changes_made' : 'in_progress',
                notes: user?.role === 'reviewer' ? 'Document marked as reviewed' : 'Document sent back for review'
            });

            // Refresh the document to get the latest content and trigger list refresh
            await refreshDocument(currentDocument._id);

            setSnackbar({
                open: true,
                message: user?.role === 'reviewer' ? 'Document saved successfully' : 'Document sent back for review',
                severity: 'success'
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
        if (!currentDocument || !editorRef.current) return;

        setIsApproving(true);
        try {
            // First save the document content
            await editorRef.current.save();
            
            // Update document status and add note about sending to sathish@gmail.com
            await updateDocument(currentDocument._id, {
                status: 'approved',
                notes: 'Document approved and sent to sathish@gmail.com'
            });

            // Send document to sathish@gmail.com
            try {
                await fetch('https://contractflow-backend-p632skk0v-valterans-projects.vercel.app/api/documents/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        document_id: currentDocument._id,
                        recipient_email: 'sathish@gmail.com',
                        subject: `Approved Document: ${currentDocument.title}`,
                        message: 'The document has been approved and is attached for your review.'
                    })
                });
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                // Don't throw the error, just log it and continue
            }

            // Refresh the document and trigger list refresh
            await refreshDocument(currentDocument._id);

            setSnackbar({
                open: true,
                message: 'Document approved and sent to sathish@gmail.com',
                severity: 'success'
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
        if (!currentDocument || !approverEmail) return;

        try {
            await addApprovers(currentDocument._id, [approverEmail]);
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

    const handleOpenAssignDialog = () => {
        setShowEditor(false);
        setIsAssignDialogOpen(true);
    };

    const handleCloseAssignDialog = () => {
        setIsAssignDialogOpen(false);
        // Add a small delay before remounting the editor
        setTimeout(() => {
            setShowEditor(true);
        }, 100);
    };

    const renderActionButtons = () => {
        if (!currentDocument) return null;

        if (user?.role === 'reviewer') {
            return (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleOpenAssignDialog}
                    >
                        Assign Approver
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
                        {isSaving ? <CircularProgress size={24} /> : 'Send Back for Review'}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleApprove}
                        disabled={isApproving}
                    >
                        {isApproving ? <CircularProgress size={24} /> : 'Approve'}
                    </Button>
                </>
            );
        }
        return null;
    };

    return (
        <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <ResizableLayout
                leftPanel={
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <DocumentList
                            onDocumentSelect={handleDocumentSelect}
                            refreshTrigger={refreshTrigger}
                        />
                    </Box>
                }
                middlePanel={
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {showEditor && currentDocument && (
                            <>
                                <Box sx={{ p: 2, display: 'flex', gap: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    {renderActionButtons()}
                                </Box>
                                <DocumentEditor
                                    ref={editorRef}
                                    documentId={currentDocument._id}
                                    content={currentDocument.content}
                                    userRole={user?.role}
                                    documentStatus={currentDocument.status}
                                    onSaveSuccess={() => {
                                        setSnackbar({
                                            open: true,
                                            message: 'Document content saved',
                                            severity: 'success'
                                        });
                                    }}
                                    onSaveError={(error) => {
                                        console.error('Save error:', error);
                                        setSnackbar({
                                            open: true,
                                            message: 'Failed to save document content',
                                            severity: 'error'
                                        });
                                    }}
                                />
                            </>
                        )}
                    </Box>
                }
                rightPanel={
                    <AIChatSidebar/>
                }
            />
            <Dialog open={isAssignDialogOpen} onClose={handleCloseAssignDialog}>
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
                    <Button onClick={handleCloseAssignDialog}>Cancel</Button>
                    <Button onClick={handleAssignApprover} disabled={!approverEmail}>
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
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
    );
};

export default Dashboard; 