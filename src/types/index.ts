export type UserRole = 'reviewer' | 'approver';

export interface User {
    _id: string;
    email: string;
    role: UserRole;
}

export type DocumentStatus = 'new' | 'pending' | 'with_reviewer' | 'with_approver' | 'approved';

export type Priority = 'urgent' | 'normal';

export interface Document {
    _id: string;
    title: string;
    filename: string;
    status: DocumentStatus;
    priority: Priority;
    reviewer_id: string;
    approvers: string[];
    date_received: string;
    date_review_due: string;
    content?: string;
    changes_summary?: string;
    notes?: string;
    last_reviewed_by?: string;
    created_at: string;
    last_modified: string;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

export interface ClauseMatch {
    title: string;
    compliant: boolean;
    score: number;
    explanation: string;
    recommendation?: string;
}

export interface ComplianceData {
    domain: string;
    score: number;
    analysis: string;
    clause_matches: ClauseMatch[];
} 