import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    Chip,
    Button,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Description as DocumentIcon,
    CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getDocuments } from '../services/api';
import { Document } from '../types';
import { useNavigate } from 'react-router-dom';
import StatusPill from '../components/common/StatusPill';

interface DashboardStats {
    totalDocuments: number;
    documentsWithReviewer: number;
    documentsWithApprover: number;
    approvedDocuments: number;
    pendingDocuments: number;
    myDocuments: number;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'alphabetical'>('deadline');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [stats, setStats] = useState<DashboardStats>({
        totalDocuments: 0,
        documentsWithReviewer: 0,
        documentsWithApprover: 0,
        approvedDocuments: 0,
        pendingDocuments: 0,
        myDocuments: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const allDocuments = await getDocuments();
                setDocuments(allDocuments);

                // Calculate stats
                const stats: DashboardStats = {
                    totalDocuments: allDocuments.length,
                    documentsWithReviewer: allDocuments.filter(doc => doc.status === 'with_reviewer').length,
                    documentsWithApprover: allDocuments.filter(doc => doc.status === 'with_approver').length,
                    approvedDocuments: allDocuments.filter(doc => doc.status === 'approved').length,
                    pendingDocuments: allDocuments.filter(doc => doc.status === 'pending').length,
                    myDocuments: user?.role === 'reviewer' 
                        ? allDocuments.filter(doc => doc.reviewer_id === user._id).length
                        : allDocuments.filter(doc => doc.approvers?.includes(user?._id || '')).length,
                };

                setStats(stats);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const sortDocuments = (docs: Document[], sortType: string, order: string) => {
        return [...docs].sort((a, b) => {
            let comparison = 0;
            
            switch (sortType) {
                case 'priority':
                    const priorityOrder = { 'urgent': 0, 'normal': 1 };
                    comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                                (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
                    break;
                case 'deadline':
                    const aDeadline = new Date(a.date_review_due || a.created_at).getTime();
                    const bDeadline = new Date(b.date_review_due || b.created_at).getTime();
                    comparison = aDeadline - bDeadline;
                    break;
                case 'alphabetical':
                    comparison = a.title.localeCompare(b.title);
                    break;
                default:
                    comparison = 0;
            }
            
            return order === 'desc' ? -comparison : comparison;
        });
    };

    const getMyDocuments = () => {
        let filtered: Document[] = [];
        if (user?.role === 'reviewer') {
            filtered = documents.filter(doc => 
                doc.reviewer_id === user._id && 
                (doc.status === 'new' || doc.status === 'pending' || doc.status === 'with_reviewer')
            );
        } else if (user?.role === 'approver') {
            filtered = documents.filter(doc => 
                doc.approvers?.includes(user._id) && 
                doc.status === 'with_approver'
            );
        }
        return sortDocuments(filtered, sortBy, sortOrder);
    };

    const getNewDocuments = () => {
        const newDocs = documents.filter(doc => doc.status === 'new');
        return sortDocuments(newDocs, sortBy, sortOrder);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            p: 3, 
            height: '100%', 
            backgroundColor: 'background.default',
            overflow: 'auto'
        }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700, 
                            color: 'text.primary',
                            mb: 1,
                            fontSize: { xs: '1.75rem', md: '2.125rem' },
                        }}
                    >
                        {getGreeting()}, {user?.email?.split('@')[0]}!
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: 'text.secondary',
                            fontSize: '1.1rem'
                        }}
                    >
                        Welcome to your Document Review Dashboard
                    </Typography>
                </Box>

            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: '#1c1c1c',
                            transition: '0.5s',
                            '&:hover .cloud': {
                                opacity: 0.6,
                                transform: 'scale(1)',
                            },
                        }}
                    >
                        <Box
                            className="cloud"
                            sx={{
                                position: 'absolute',
                                top: '-10%',
                                left: '-10%',
                                width: '150%',
                                height: '150%',
                                background: 'linear-gradient(to right, #a855f7, #ec4899, #ef4444)',
                                opacity: 0.3,
                                filter: 'blur(80px)',
                                transform: 'scale(0.75)',
                                transition: 'all 0.7s',
                                zIndex: 0,
                            }}
                        />
                        <Box sx={{ position: 'relative', zIndex: 1, color: '#fff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body1">Total Documents</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.totalDocuments}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: '#1c1c1c',
                            transition: '0.5s',
                            '&:hover .cloud': {
                                opacity: 0.6,
                                transform: 'scale(1)',
                            },
                        }}
                    >
                        <Box
                            className="cloud"
                            sx={{
                                position: 'absolute',
                                top: '-10%',
                                left: '-10%',
                                width: '150%',
                                height: '150%',
                                background: 'linear-gradient(to right,rgb(75, 192, 192),rgb(135, 206, 235),rgb(243, 156, 18))',
                                opacity: 0.3,
                                filter: 'blur(80px)',
                                transform: 'scale(0.75)',
                                transition: 'all 0.7s',
                                zIndex: 0,
                            }}
                        />
                        <Box sx={{ position: 'relative', zIndex: 1, color: '#fff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body1">With Reviewer</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.documentsWithReviewer}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: '#1c1c1c',
                            transition: '0.5s',
                            '&:hover .cloud': {
                                opacity: 0.6,
                                transform: 'scale(1)',
                            },
                        }}
                    >
                        <Box
                            className="cloud"
                            sx={{
                                position: 'absolute',
                                top: '-10%',
                                left: '-10%',
                                width: '150%',
                                height: '150%',
                                background: 'linear-gradient(to right,rgb(85, 109, 247),rgb(72, 178, 236),rgb(152, 252, 254))',
                                opacity: 0.3,
                                filter: 'blur(80px)',
                                transform: 'scale(0.75)',
                                transition: 'all 0.7s',
                                zIndex: 0,
                            }}
                        />
                        <Box sx={{ position: 'relative', zIndex: 1, color: '#fff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body1">With Approver</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.documentsWithApprover}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: '#1c1c1c',
                            transition: '0.5s',
                            '&:hover .cloud': {
                                opacity: 0.6,
                                transform: 'scale(1)',
                            },
                        }}
                    >
                        <Box
                            className="cloud"
                            sx={{
                                position: 'absolute',
                                top: '-10%',
                                left: '-10%',
                                width: '150%',
                                height: '150%',
                                background: 'linear-gradient(to right,rgb(0, 255, 42),rgb(135, 235, 232),rgb(0, 72, 35))',
                                opacity: 0.3,
                                filter: 'blur(80px)',
                                transform: 'scale(0.75)',
                                transition: 'all 0.7s',
                                zIndex: 0,
                            }}
                        />
                        <Box sx={{ position: 'relative', zIndex: 1, color: '#fff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body1">Approved</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.approvedDocuments}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: '#1c1c1c',
                            transition: '0.5s',
                            '&:hover .cloud': {
                                opacity: 0.6,
                                transform: 'scale(1)',
                            },
                        }}
                    >
                        <Box
                            className="cloud"
                            sx={{
                                position: 'absolute',
                                top: '-10%',
                                left: '-10%',
                                width: '150%',
                                height: '150%',
                                background: 'linear-gradient(to right,rgb(192, 118, 75),rgb(235, 212, 135),rgb(242, 254, 152))',
                                opacity: 0.3,
                                filter: 'blur(80px)',
                                transform: 'scale(0.75)',
                                transition: 'all 0.7s',
                                zIndex: 0,
                            }}
                        />
                        <Box sx={{ position: 'relative', zIndex: 1, color: '#fff' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="body1">My Documents</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.myDocuments}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* My Documents Section - Full Width */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        My Documents
                    </Typography>
                    <Chip 
                        label={`${getMyDocuments().length} ${getMyDocuments().length === 1 ? 'Document' : 'Documents'}`}
                        color="primary" 
                        size="medium"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>

                {/* Sort Filters */}
                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value as 'priority' | 'deadline' | 'alphabetical')}
                        >
                            <MenuItem value="deadline">Deadline</MenuItem>
                            <MenuItem value="priority">Priority</MenuItem>
                            <MenuItem value="alphabetical">Alphabetical</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Order</InputLabel>
                        <Select
                            value={sortOrder}
                            label="Order"
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        >
                            <MenuItem value="asc">Ascending</MenuItem>
                            <MenuItem value="desc">Descending</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {getMyDocuments().length === 0 ? (
                    <Paper sx={{ 
                        p: 6, 
                        borderRadius: 2, 
                        backgroundColor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        textAlign: 'center'
                    }}>
                        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            No documents requiring action
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={2}>
                        {getMyDocuments().map((doc) => {
                            const dueDate = new Date(doc.date_review_due || doc.created_at);
                            const today = new Date();
                            const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                            const isOverdue = daysOverdue > 0;
                            
                            return (
                                <Grid item xs={12} sm={6} md={4} key={doc._id}>
                                    <Paper
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            backgroundColor: 'background.paper',
                                            border: 1,
                                            borderColor: isOverdue ? 'error.main' : 'divider',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                transform: 'translateY(-4px)',
                                                boxShadow: 3,
                                            }
                                        }}
                                        onClick={() => navigate('/document-review')}
                                    >
                                        {isOverdue && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    color: 'error.main',
                                                }}
                                            >
                                                ⚠️
                                            </Box>
                                        )}
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                            <DocumentIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                                                {doc.title.split('.')[0]}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ mb: 1.5 }}>
                                            <StatusPill status={doc.status} />
                                            {doc.priority && (
                                                <Chip 
                                                    label={doc.priority.toUpperCase()} 
                                                    size="small" 
                                                    sx={{ 
                                                        ml: 1,
                                                        fontSize: '0.65rem', 
                                                        height: '22px',
                                                        backgroundColor: doc.priority === 'urgent' ? '#ff5722' : '#4caf50',
                                                        color: '#ffffff',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        <Box sx={{ mt: 'auto' }}>
                                            {doc.date_review_due && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        color={isOverdue ? 'error.main' : 'text.secondary'}
                                                        sx={{ fontWeight: isOverdue ? 600 : 400 }}
                                                    >
                                                        📅 Due: {dueDate.toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                            
                                            {isOverdue && (
                                                <Typography 
                                                    variant="caption" 
                                                    color="error.main"
                                                    sx={{ 
                                                        display: 'block',
                                                        fontWeight: 600 
                                                    }}
                                                >
                                                    {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                                                </Typography>
                                            )}

                                            {doc.reviewer_id && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    👤 Assigned: {doc.reviewer_id}
                                                </Typography>
                                            )}
                                            
                                            {doc.created_at && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    📝 Created: {new Date(doc.created_at).toLocaleDateString()}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}

                {getMyDocuments().length > 0 && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{ px: 4 }}
                            onClick={() => navigate('/document-review')}
                        >
                            Go to Document Review
                        </Button>
                    </Box>
                )}
            </Box>

        </Box>
    );
};

export default Dashboard;