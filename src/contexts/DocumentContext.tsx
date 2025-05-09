import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Document } from '../types';

interface DocumentContextType {
    currentDocument: Document | null;
    setCurrentDocument: (document: Document | null) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocument = () => {
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error('useDocument must be used within a DocumentProvider');
    }
    return context;
};

interface DocumentProviderProps {
    children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
    const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

    return (
        <DocumentContext.Provider value={{ currentDocument, setCurrentDocument }}>
            {children}
        </DocumentContext.Provider>
    );
}; 