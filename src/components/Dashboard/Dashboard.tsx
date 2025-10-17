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
    Tabs,
    Tab,
} from '@mui/material';
import DocumentList, {DocumentWithApproverEmails} from './DocumentList';
import DocumentEditor, { DocumentEditorRef } from '../DocumentEditor/DocumentEditor';
import { Document } from '../../types';
import { updateDocument, addApprovers, getDocument, getUserByEmail } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useDocument } from '../../contexts/DocumentContext';
import ResizableLayout from '../common/ResizableLayout';
import AIChatSidebar from '../AIChatSidebar/AIChatSidebar';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { getUserById } from '../../services/api';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8002';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
            sx={{ 
                height: '100%', 
                display: value === index ? 'flex' : 'none', 
                flexDirection: 'column' 
            }}
            {...other}
        >
            {value === index && children}
        </Box>
    );
}


const Dashboard: React.FC = () => {
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
    const [dashboardTab, setDashboardTab] = useState(0);
    const editorRef = useRef<DocumentEditorRef>(null);
    const [documents, setDocuments] = useState<DocumentWithApproverEmails[]>([]);

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
        try {
            // Fetch fresh document content regardless of whether it's already selected
            const freshDocument = await getDocument(document._id);
            
            // If user is reviewer and document status is new or pending, update to with_reviewer
            if (user?.role === 'reviewer' && 
                (freshDocument.status === 'new' || freshDocument.status === 'pending')) {
                try {
                    await updateDocument(freshDocument._id, {
                        status: 'with_reviewer',
                        notes: 'Document opened for review'
                    });
                    // Fetch the updated document after status change
                    const updatedDocument = await getDocument(freshDocument._id);
                    setCurrentDocument(updatedDocument);
                } catch (error) {
                    console.error('Failed to update document status:', error);
                    // Still set the original document if update fails
                    setCurrentDocument(freshDocument);
                }
            } else {
                // Set the fresh document if no status update needed
                setCurrentDocument(freshDocument);
            }
        } catch (error) {
            console.error('Failed to load document:', error);
            setSnackbar({
                open: true,
                message: 'Failed to load document',
                severity: 'error'
            });
        }
    };

    const handleSave = async () => {
        if (!currentDocument || !editorRef.current) return;

        setIsSaving(true);
        try {
            // Only save the document content without changing status
            await editorRef.current.save();

            setSnackbar({
                open: true,
                message: 'Document saved successfully',
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
            
            // Update document status and add note about sending to sathish@gmail.com
            await updateDocument(currentDocument._id, {
                status: 'with_approver'
            });

            // Refresh the document and trigger list refresh
            await refreshDocument(currentDocument._id);

            setSnackbar({
                open: true,
                message: 'Document Sent to Approver',
                severity: 'success'
            });
        } catch (error) {
            console.error('Failed to send document to approver:', error);
            setSnackbar({
                open: true,
                message: 'Failed to send document to approver',
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
                        variant="outlined"
                        color="primary"
                        onClick={handleOpenAssignDialog}
                    >
                        Assign Approver
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{ padding: 1, minWidth: 0, margin: 0 }}
                    >
                        {isSaving ? <CircularProgress size={24} /> : <SaveIcon />}
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleSendToApprover}
                        disabled={(user?.role === 'reviewer' && (currentDocument?.status === 'with_approver' || currentDocument?.status === 'approved'))}
                        sx={{ padding: 1, minWidth: 0, margin: 0 }}
                    >
                        <SendIcon fontSize="small" />
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
                        sx={{ padding: 1, minWidth: 0, margin: 0 }}
                    >
                        {isSaving ? <CircularProgress size={24} /> : <SaveIcon />}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={isSaving || isApproving || currentDocument?.status !== 'with_approver'}
                    >
                        {isSaving ? <CircularProgress size={24} /> : 'Send Back for Review'}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleApprove}
                        disabled={isApproving || isSaving || currentDocument?.status !== 'with_approver'}
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
            {/* Dashboard Navigation Tabs for Different Views */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                <Tabs 
                    value={dashboardTab} 
                    onChange={(_, newValue) => setDashboardTab(newValue)}
                    sx={{ px: 2 }}
                >
                    <Tab label="Documents Requiring Action" />
                    <Tab label="All Documents" />
                </Tabs>
            </Box>

            <TabPanel value={dashboardTab} index={0}>
                {/* Documents Requiring Action View */}
                <ResizableLayout
                    leftPanel={
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <DocumentList
                                onDocumentSelect={handleDocumentSelect}
                                selectedDocument={currentDocument}
                                documents={documents}
                                setDocuments={setDocuments}
                                refreshTrigger={refreshTrigger}
                                dashboardType="action-required"
                                userRole={user?.role}
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
                        <AIChatSidebar onToggle={() => setIsChatCollapsed(!isChatCollapsed)}/>
                    }
                    isRightPanelVisible={!!currentDocument}
                    isLeftPanelCollapsed={isDocumentListCollapsed}
                    isRightPanelCollapsed={isChatCollapsed}
                    onLeftToggle={() => setIsDocumentListCollapsed(!isDocumentListCollapsed)}
                    onRightToggle={() => setIsChatCollapsed(!isChatCollapsed)}
                />
            </TabPanel>

            <TabPanel value={dashboardTab} index={1}>
                {/* All Documents View */}
                <ResizableLayout
                    leftPanel={
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <DocumentList
                                onDocumentSelect={handleDocumentSelect}
                                selectedDocument={currentDocument}
                                documents={documents}
                                setDocuments={setDocuments}
                                refreshTrigger={refreshTrigger}
                                dashboardType="all-documents"
                                userRole={user?.role}
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
                        <AIChatSidebar onToggle={() => setIsChatCollapsed(!isChatCollapsed)}/>
                    }
                    isRightPanelVisible={!!currentDocument}
                    isLeftPanelCollapsed={isDocumentListCollapsed}
                    isRightPanelCollapsed={isChatCollapsed}
                    onLeftToggle={() => setIsDocumentListCollapsed(!isDocumentListCollapsed)}
                    onRightToggle={() => setIsChatCollapsed(!isChatCollapsed)}
                />
            </TabPanel>
            
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