import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, loading } = useAuth();

    // Show loading state
    if (loading) {
        return null;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect based on user role
    const userRole = (user?.role_type ? user.role_type.replace('_', ' ') : '') ||
        (user?.role?.role_name ? user.role.role_name.toLowerCase() : '') ||
        (typeof user?.role === 'string' ? user.role.toLowerCase() : '');
    const isAdmin = userRole === 'admin' || userRole === 'hr' || userRole === 'super admin';
    const isEmployee = userRole === 'employee' || userRole === 'team lead';

    if (userRole === 'super admin') {
        return <Navigate to="/super-admin/dashboard" replace />;
    } else if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    } else if (isEmployee) {
        return <Navigate to="/employee/dashboard" replace />;
    }

    // Fallback - should not reach here
    return <Navigate to="/login" replace />;

    const quickActions = [
        {
            title: 'Attendance',
            icon: <AccessTime sx={{ fontSize: 32 }} />,
            path: '/attendance/dashboard',
            color: '#667eea',
            description: 'View attendance records',
        },
        {
            title: 'Leaves',
            icon: <Event sx={{ fontSize: 32 }} />,
            path: '/leaves',
            color: '#10b981',
            description: 'Manage leave requests',
        },
        {
            title: 'Timesheets',
            icon: <Description sx={{ fontSize: 32 }} />,
            path: '/timesheets',
            color: '#3b82f6',
            description: 'Submit timesheets',
        },
        {
            title: 'Payroll',
            icon: <AttachMoney sx={{ fontSize: 32 }} />,
            path: '/payroll',
            color: '#f59e0b',
            description: 'View salary details',
        },
        {
            title: 'Holidays',
            icon: <CalendarMonth sx={{ fontSize: 32 }} />,
            path: '/holidays',
            color: '#8b5cf6',
            description: 'View holiday calendar',
        },
        {
            title: 'Roster',
            icon: <Schedule sx={{ fontSize: 32 }} />,
            path: '/roster',
            color: '#ec4899',
            description: 'View work schedule',
        },
    ];

    const adminActions = [
        {
            title: 'Admin Panel',
            icon: <Work sx={{ fontSize: 32 }} />,
            path: '/admin/dashboard',
            color: '#ef4444',
            description: 'Manage employees',
        },
        {
            title: 'Attendance Logs',
            icon: <AccessTime sx={{ fontSize: 32 }} />,
            path: '/attendance/logs',
            color: '#06b6d4',
            description: 'View all attendance',
        },
        {
            title: 'Shifts',
            icon: <Schedule sx={{ fontSize: 32 }} />,
            path: '/attendance/shifts',
            color: '#14b8a6',
            description: 'Manage shifts',
        },
    ];

    const ActionCard = ({ action }) => (
        <Card
            sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}05 100%)`,
                border: `1px solid ${action.color}20`,
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0px 12px 24px -8px ${action.color}40`,
                    borderColor: action.color,
                },
            }}
            onClick={() => navigate(action.path)}
        >
            <CardContent sx={{ p: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <Avatar
                        sx={{
                            width: 64,
                            height: 64,
                            bgcolor: action.color,
                            mb: 2,
                            boxShadow: `0px 4px 12px ${action.color}40`,
                        }}
                    >
                        {action.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {action.description}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Layout>
            <Box>
                {/* Welcome Section */}
                <Paper
                    sx={{
                        p: 4,
                        mb: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: 3,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                fontSize: '2rem',
                                fontWeight: 600,
                            }}
                        >
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Welcome back, {user?.first_name} {user?.last_name}! 👋
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<Person />}
                                    label={user?.role?.role_name}
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        fontWeight: 600,
                                    }}
                                />
                                <Chip
                                    icon={<Business />}
                                    label={user?.organization?.organization_name}
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Quick Actions */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={3}>
                        {quickActions.map((action) => (
                            <Grid item xs={12} sm={6} md={4} key={action.title}>
                                <ActionCard action={action} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Admin Actions */}
                {isAdmin && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                            Admin Tools
                        </Typography>
                        <Grid container spacing={3}>
                            {adminActions.map((action) => (
                                <Grid item xs={12} sm={6} md={4} key={action.title}>
                                    <ActionCard action={action} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Quick Stats */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <TrendingUp />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight={600}>
                                        Quick Stats
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: 'action.hover',
                                        }}
                                    >
                                        <Typography variant="body1">Today's Date</Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {new Date().toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: 'action.hover',
                                        }}
                                    >
                                        <Typography variant="body1">Current Time</Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {new Date().toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'info.main' }}>
                                        <Notifications />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight={600}>
                                        Get Started
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<AccessTime />}
                                        onClick={() => navigate('/attendance/dashboard')}
                                        sx={{ py: 1.5 }}
                                    >
                                        Check Attendance
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<Event />}
                                        onClick={() => navigate('/leaves')}
                                        sx={{ py: 1.5 }}
                                    >
                                        Apply for Leave
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<Description />}
                                        onClick={() => navigate('/timesheets')}
                                        sx={{ py: 1.5 }}
                                    >
                                        Submit Timesheet
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default Dashboard;
