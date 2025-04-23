import React, { forwardRef, useImperativeHandle } from 'react';
import { DocumentEditorContainerComponent, Toolbar, Inject } from '@syncfusion/ej2-react-documenteditor';
import { updateDocument } from '../../services/api';
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

    // Determine if the editor should be read-only
    const isReadOnly = React.useMemo(() => {
        if (!userRole || !documentStatus) return true;
        
        if (documentStatus === 'approved') return true;
        
        if (userRole === 'approver') {
            // Approvers can only edit when status is 'changes_made'
            return documentStatus !== 'changes_made';
        }
        
        return false;
    }, [userRole, documentStatus]);

    useImperativeHandle(ref, () => ({
        save: async () => {
            const editor = editorRef.current;
            if (!editor || !documentId) return;

            try {
                // Get the document content in SFDT format
                const sfdt = editor.documentEditor.serialize();
                const encodedContent = btoa(sfdt);
                
                // Save to MongoDB through API
                await updateDocument(documentId, {
                    content: encodedContent
                });

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
                const decodedContent = atob(content);
                editor.documentEditor.open(decodedContent);
            } catch (error) {
                console.error('Failed to load document:', error);
            }
        }
    }, [content]);

    React.useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            editor.documentEditor.isReadOnly = isReadOnly;
            editor.enableToolbar = !isReadOnly;
        }
    }, [isReadOnly]);

    return (
        <div className="document-editor-wrapper">
            <DocumentEditorContainerComponent
                ref={editorRef}
                height="100vh"
                enableToolbar={!isReadOnly}
                serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
            >
                <Inject services={[Toolbar]} />
            </DocumentEditorContainerComponent>
        </div>
    );
});

export default DocumentEditor;