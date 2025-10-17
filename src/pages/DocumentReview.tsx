import React, { useState, useRef, useCallback, useEffect } from 'react';
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
    Tooltip,
} from '@mui/material';

import {
    PersonAdd,
    Close,
} from '@mui/icons-material';
import DocumentList, {DocumentWithApproverEmails} from '../components/Dashboard/DocumentList';
import DocumentTable from '../components/Dashboard/DocumentTable';
import DocumentEditor, { DocumentEditorRef } from '../components/DocumentEditor/DocumentEditor';
import { Document } from '../types';
import { updateDocument, addApprovers, getDocument, getDocuments, getUserByEmail } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useDocument } from '../contexts/DocumentContext';
import ResizableLayout from '../components/common/ResizableLayout';
import AIChatSidebar from '../components/AIChatSidebar/AIChatSidebar';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { getUserById } from '../services/api';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8002';


const DocumentReview: React.FC = () => {
    const { user } = useAuth();
    const { currentDocument, setCurrentDocument } = useDocument();
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [approverEmail, setApproverEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [refreshTrigger] = useState(0);
    const [showEditor, setShowEditor] = useState(true);
    const [isDocumentListCollapsed, setIsDocumentListCollapsed] = useState(false);
    const [isChatCollapsed, setIsChatCollapsed] = useState(false);
    const editorRef = useRef<DocumentEditorRef>(null);
    const [documents, setDocuments] = useState<DocumentWithApproverEmails[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });
    useEffect(() => {
        const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
        const ws = new WebSocket(`${wsUrl}/ws`);
    
        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
    
            if (data.event === "document_updated") {
                const updatedDoc = await getDocument(data.document_id);
    
                const updatedApproverEmails = updatedDoc.approvers
                    ? await Promise.all(updatedDoc.approvers.map(async (id: string) => {
                        try {
                            const user = await getUserById(id);
                            return user.email;
                        } catch {
                            return id;
                        }
                    }))
                    : [];
    
                setDocuments(prevDocs => {
                    const index = prevDocs.findIndex(doc => doc._id === data.document_id);
                    if (index !== -1) {
                        const newDocs = [...prevDocs];
                        newDocs[index] = { ...updatedDoc, approverEmails: updatedApproverEmails };
                        return newDocs;
                    } else {
                        return [...prevDocs, { ...updatedDoc, approverEmails: updatedApproverEmails }];
                    }
                });
            }
        };
    
        return () => ws.close();
    }, []);

    // Load documents on component mount
    useEffect(() => {
        const fetchDocuments = async () => {
            setIsLoadingDocuments(true);
            try {
                const docs = await getDocuments();
                // For each document, fetch approver emails
                const docsWithEmails = await Promise.all(docs.map(async (doc: Document) => {
                    if (doc.approvers && doc.approvers.length > 0) {
                        const approverUsers = await Promise.all(doc.approvers.map(async (id: string) => {
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
            } finally {
                setIsLoadingDocuments(false);
            }
        };

        fetchDocuments();
    }, []);
    
    

    const refreshDocument = useCallback(async (documentId: string) => {
        try {
            const refreshedDoc = await getDocument(documentId);
            setCurrentDocument(refreshedDoc);
    
            // Fetch approver emails for this document
            let approverEmails: string[] = [];
            if (refreshedDoc.approvers && refreshedDoc.approvers.length > 0) {
                approverEmails = await Promise.all(
                    refreshedDoc.approvers.map(async (id: string) => {
                        try {
                            const user = await getUserById(id);
                            return user.email;
                        } catch {
                            return id;
                        }
                    })
                );
            }
    
            // Update the document in documents list
            setDocuments(prevDocs =>
                prevDocs.map(doc =>
                    doc._id === documentId
                        ? { ...refreshedDoc, approverEmails }
                        : doc
                )
            );
    
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
        
        // If user is reviewer and document status is new or pending, update to with_reviewer
        if (user?.role === 'reviewer' && 
            (document.status === 'new' || document.status === 'pending')) {
            try {
                await updateDocument(document._id, {
                    status: 'with_reviewer',
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
                notes: 'Document saved successfully'
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

    const handleSendToApprover = async () => {
        if (!currentDocument || !editorRef.current) return;

        if (!currentDocument.approvers || currentDocument.approvers.length === 0) {
            setSnackbar({
                open: true,
                message: 'Please assign at least one approver before sending the document for approval.',
                severity: 'error'
            });
            return;
        }

        try {
            // First save the document content
            await editorRef.current.save();
            
            // Update document status with changes summary
            await updateDocument(currentDocument._id, {
                status: 'with_approver',
                changes_summary: 'Document reviewed and ready for approval',
                notes: 'Document sent to approver'
            });

            // Refresh the document and trigger list refresh
            await refreshDocument(currentDocument._id);

            setSnackbar({
                open: true,
                message: 'Document Sent to Approver',
                severity: 'success'
            });
        } catch (error: any) {
            console.error('Failed to send document to approver:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to send document to approver';
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
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
                await fetch(`${API_URL}/api/documents/send-email`, {
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
            // First, get the user ID by email
            const user = await getUserByEmail(approverEmail);
            if (!user) {
                setSnackbar({
                    open: true,
                    message: 'User not found with this email',
                    severity: 'error'
                });
                return;
            }

            await addApprovers(currentDocument._id, [user._id]);
            setIsAssignDialogOpen(false);
            setApproverEmail('');
            setSnackbar({
                open: true,
                message: 'Approver assigned successfully',
                severity: 'success'
            });
        } catch (error: any) {
            console.error('Failed to assign approver:', error);
            let errorMessage = 'Failed to assign approver';
            
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const handleCloseDocument = () => {
        setCurrentDocument(null);
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
                    <Tooltip title="Close Document" placement="right">
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ 
                                backgroundColor: '#666', 
                                height: 40, 
                                minWidth: 0,
                                '&:hover': { backgroundColor: '#555' }
                            }}
                            onClick={handleCloseDocument}
                            className="dock-item"
                        >
                            <Close fontSize="small" />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Assign Approver" placement="right">
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{ 
                                backgroundColor: '#000', 
                                height: 40, 
                                minWidth: 0,
                                '&:hover': { backgroundColor: '#111' }
                            }}
                            onClick={handleOpenAssignDialog}
                            className="dock-item"
                        >
                            <PersonAdd fontSize="small" />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Save Document" placement="right">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            disabled={isSaving}
                            sx={{ height: 40, minWidth: 0 }}
                            className="dock-item"
                        >
                            {isSaving ? <CircularProgress size={24} /> : <SaveIcon fontSize="small" />}
                        </Button>
                    </Tooltip>
                    <Tooltip title="Send to Approver" placement="right">
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={handleSendToApprover}
                            disabled={(user?.role === 'reviewer' && (currentDocument?.status === 'with_approver' || currentDocument?.status === 'approved'))}
                            sx={{ 
                                backgroundColor: '#000', 
                                height: 40, 
                                minWidth: 0,
                                '&:hover': { backgroundColor: '#111' }
                            }}
                            className="dock-item"
                        >
                            <SendIcon fontSize="small" />
                        </Button>
                    </Tooltip>
                </>
            );
        } else if (user?.role === 'approver') {
            return (
                <>
                    <Tooltip title="Close Document" placement="right">
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ 
                                backgroundColor: '#666', 
                                height: 40, 
                                minWidth: 0,
                                '&:hover': { backgroundColor: '#555' }
                            }}
                            onClick={handleCloseDocument}
                            className="dock-item"
                        >
                            <Close fontSize="small" />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Save Document" placement="right">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            disabled={isSaving}
                            sx={{ padding: 1, minWidth: 0, margin: 0 }}
                            className="dock-item"
                        >
                            {isSaving ? <CircularProgress size={24} /> : <SaveIcon />}
                        </Button>
                    </Tooltip>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaving || isApproving || currentDocument?.status !== 'with_approver'}
                        className="dock-item"
                    >
                        {isSaving ? <CircularProgress size={24} /> : 'Send Back for Review'}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleApprove}
                        disabled={isApproving || isSaving || currentDocument?.status !== 'with_approver'}
                        className="dock-item"
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
            {!currentDocument ? (
                // Show table view when no document is selected
                <Box sx={{ height: '100%', padding: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4" component="h1" sx={{ mb: 3, color: 'primary.main' }}>
                        Document Review
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        {isLoadingDocuments ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <DocumentTable 
                                documents={documents.map(doc => ({ ...doc }))} // Convert DocumentWithApproverEmails to Document
                                onDocumentSelect={handleDocumentSelect}
                                userRole={user?.role}
                                dashboardType="all-documents"
                            />
                        )}
                    </Box>
                </Box>
            ) : (
                // Show document editor when a document is selected
                <ResizableLayout
                    leftPanel={
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <DocumentList
                                onDocumentSelect={handleDocumentSelect}
                                selectedDocument={currentDocument}
                                documents={documents}
                                setDocuments={setDocuments}
                                refreshTrigger={refreshTrigger}
                            />
                        </Box>
                    }
                    middlePanel={
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {showEditor && currentDocument && (
                                <>
                                    {/* macOS-style floating dock for action buttons */}
                                    <Box className="mac-dock">
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
                        <AIChatSidebar onToggle={() => setIsChatCollapsed(!isChatCollapsed)}/>
                    }
                    isRightPanelVisible={!!currentDocument}
                    isLeftPanelCollapsed={isDocumentListCollapsed}
                    isRightPanelCollapsed={isChatCollapsed}
                    onLeftToggle={() => setIsDocumentListCollapsed(!isDocumentListCollapsed)}
                    onRightToggle={() => setIsChatCollapsed(!isChatCollapsed)}
                />
            )}
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

export default DocumentReview;
