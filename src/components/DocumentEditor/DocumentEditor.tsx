import React, { forwardRef, useImperativeHandle } from 'react';
import { 
    DocumentEditorContainerComponent, 
    Toolbar, 
    Inject,
    WordExport,
    SfdtExport,
    Selection,
    Editor,
    EditorHistory
} from '@syncfusion/ej2-react-documenteditor';
import { updateDocument } from '../../services/api';
import { Box, Paper, Typography } from '@mui/material';
import '../../App.css';

interface DocumentEditorProps {
    documentId?: string;
    content?: string;
    onSaveSuccess?: () => void;
    onSaveError?: (error: any) => void;
    userRole?: string;
    documentStatus?: string;
}

export interface DocumentEditorRef {
    save: () => Promise<void>;
}

const DocumentEditor = forwardRef<DocumentEditorRef, DocumentEditorProps>(({ 
    documentId, 
    content,
    onSaveSuccess,
    onSaveError,
    userRole,
    documentStatus
}, ref) => {
    const editorRef = React.useRef<DocumentEditorContainerComponent | null>(null);

    const isReadOnly = React.useMemo(() => {
        if (!userRole || !documentStatus) return true;
        if (documentStatus === 'approved') return true;
        if (userRole === 'approver') {
            return documentStatus !== 'changes_made';
        }
        if (userRole === 'reviewer') {
            return documentStatus === 'changes_made';
        }

        return false;
    }, [userRole, documentStatus]);

    useImperativeHandle(ref, () => ({
        save: async () => {
            const editor = editorRef.current;
            if (!editor || !documentId) return;

            try {
                console.log('Starting document save...');
                const sfdt = editor.documentEditor.serialize();
                console.log('Document serialized, length:', sfdt.length);
                
                // Save the SFDT content directly (it will be base64 encoded on the server)
                await updateDocument(documentId, {
                    content: sfdt
                });
                console.log('Document saved successfully');

                if (onSaveSuccess) {
                    onSaveSuccess();
                }
            } catch (error) {
                console.error('Failed to save document:', error);
                if (onSaveError) {
                    onSaveError(error);
                }
                throw error;
            }
        }
    }));

    React.useEffect(() => {
        const editor = editorRef.current;
        if (editor && content) {
            try {
                console.log('Loading document...');
                editor.documentEditor.open(content);
                editor.documentEditor.isReadOnly = isReadOnly;
                editor.enableToolbar = !isReadOnly;
                console.log('Document loaded successfully');
            } catch (error) {
                console.error('Failed to load document:', error);
                if (onSaveError) {
                    onSaveError(error);
                }
            }
        }
    }, [content, isReadOnly, onSaveError]);

    return (
        <Box sx={{ height: '100%', position: 'relative' }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    height: '100%',
                    backgroundColor: 'grey.50',
                    position: 'relative'
                }}
            >
                {isReadOnly && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            padding: 1,
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            zIndex: 1,
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="caption">
                            Read-only Mode
                        </Typography>
                    </Box>
                )}

                <div className="document-editor-wrapper">
                    <DocumentEditorContainerComponent
                        ref={editorRef}
                        height="100vh"
                        enableToolbar={!isReadOnly}
                        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
                    >
                        <Inject services={[Toolbar, WordExport, SfdtExport, Selection, Editor, EditorHistory]} />
                    </DocumentEditorContainerComponent>
                </div>
            </Paper>
        </Box>
    );
});

export default DocumentEditor;