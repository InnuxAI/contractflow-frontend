export type UserRole = 'reviewer' | 'approver';

export interface User {
    _id: string;
    email: string;
    role: UserRole;
}

export type DocumentStatus = 'new' | 'pending' | 'in_progress' | 'changes_made' | 'approved';

export interface Document {
    _id: string;
    title: string;
    filename: string;
    status: DocumentStatus;
    reviewer_id: string;
    approvers: string[];
    content?: string;
    changes_summary?: string;
    notes?: string;
    last_reviewed_by?: string;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
} 