import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Alert,
    Skeleton,
    Avatar,
    LinearProgress,
} from '@mui/material';
import {
    TrendingUp,
    CalendarToday,
    AccessTime,
    AccountBalance,
    Notifications,
    CheckCircle,
    Cancel,
    Schedule,
    Description,
    AttachMoney,
    Event
} from '@mui/icons-material';
import { getDashboard } from '../services/employeeService';
import { showError } from '../utils/toast';
import Layout from '../components/Layout';

const EmployeeDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await getDashboard();
            setDashboardData(response.data);
        } catch (error) {
            showError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Skeleton variant="text" width="60%" height={20} />
                                            <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
                                        </Box>
                                        <Skeleton variant="circular" width={48} height={48} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    if (!dashboardData) {
        return (
            <Alert severity="error">Failed to load dashboard data</Alert>
        );
    }

    const { attendance, leave_balances, pending_leaves, recent_timesheets, recent_payroll, notifications } = dashboardData;

    const StatCard = ({ icon, title, value, color = 'primary', subtitle }) => (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea' : color === 'success' ? '#10b981' : color === 'error' ? '#ef4444' : '#f59e0b'}15 0%, ${color === 'primary' ? '#667eea' : color === 'success' ? '#10b981' : color === 'error' ? '#ef4444' : '#f59e0b'}05 100%)`,
                border: `1px solid ${color === 'primary' ? '#667eea' : color === 'success' ? '#10b981' : color === 'error' ? '#ef4444' : '#f59e0b'}20`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0px 8px 16px -4px ${color === 'primary' ? '#667eea' : color === 'success' ? '#10b981' : color === 'error' ? '#ef4444' : '#f59e0b'}40`,
                },
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography color="textSecondary" gutterBottom variant="body2" fontWeight={500}>
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" fontWeight={700} sx={{ mb: 0.5 }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="textSecondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: `${color}.main`,
                            boxShadow: `0px 4px 12px ${color === 'primary' ? '#667eea' : color === 'success' ? '#10b981' : color === 'error' ? '#ef4444' : '#f59e0b'}40`,
                        }}
                    >
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    const attendancePercentage = attendance.total_days > 0
        ? Math.round((attendance.present_days / attendance.total_days) * 100)
        : 0;

    return (
        <Layout>
            <Box>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Employee Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Overview of your attendance, leaves, and work activities
                    </Typography>
                </Box>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {/* Attendance Stats */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<CalendarToday sx={{ fontSize: 28 }} />}
                            title="Total Days"
                            value={attendance.total_days}
                            color="primary"
                            subtitle="This month"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<CheckCircle sx={{ fontSize: 28 }} />}
                            title="Present Days"
                            value={attendance.present_days}
                            color="success"
                            subtitle={`${attendancePercentage}% attendance`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<Cancel sx={{ fontSize: 28 }} />}
                            title="Absent Days"
                            value={attendance.absent_days}
                            color="error"
                            subtitle="This month"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<Schedule sx={{ fontSize: 28 }} />}
                            title="Late Days"
                            value={attendance.late_days}
                            color="warning"
                            subtitle="This month"
                        />
                    </Grid>

                    {/* Leave Balances */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Event color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Leave Balances
                                    </Typography>
                                </Box>
                                {leave_balances.length > 0 ? (
                                    <Box sx={{ mt: 2 }}>
                                        {leave_balances.map((balance) => {
                                            const percentage = (balance.available_balance / balance.total_balance) * 100;
                                            return (
                                                <Box
                                                    key={balance.leave_balance_id}
                                                    sx={{
                                                        mb: 3,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        bgcolor: 'action.hover',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {balance.leaveType.leave_type_name}
                                                        </Typography>
                                                        <Chip
                                                            label={`${balance.available_balance} / ${balance.total_balance} days`}
                                                            color={balance.available_balance < 5 ? 'warning' : 'primary'}
                                                            size="small"
                                                        />
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percentage}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            bgcolor: 'action.selected',
                                                            '& .MuiLinearProgress-bar': {
                                                                borderRadius: 4,
                                                                bgcolor: balance.available_balance < 5 ? 'warning.main' : 'primary.main',
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                ) : (
                                    <Typography color="textSecondary">No leave balances available</Typography>
                                )}
                                {pending_leaves > 0 && (
                                    <Alert severity="info" sx={{ mt: 2 }} icon={<Notifications />}>
                                        {pending_leaves} pending leave request(s)
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Notifications */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Notifications color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Recent Notifications
                                        </Typography>
                                    </Box>
                                    {notifications.unread_count > 0 && (
                                        <Chip
                                            icon={<Notifications />}
                                            label={`${notifications.unread_count} unread`}
                                            color="primary"
                                            size="small"
                                        />
                                    )}
                                </Box>
                                {notifications.recent.length > 0 ? (
                                    <Box>
                                        {notifications.recent.map((notification) => (
                                            <Box
                                                key={notification.notification_id}
                                                sx={{
                                                    p: 2,
                                                    mb: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: notification.is_read ? 'background.default' : 'action.selected',
                                                    borderLeft: notification.is_read ? 'none' : '4px solid',
                                                    borderColor: 'primary.main',
                                                    transition: 'all 0.2s ease-in-out',
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                        transform: 'translateX(4px)',
                                                    },
                                                }}
                                            >
                                                <Typography variant="subtitle2" fontWeight={notification.is_read ? 'normal' : 'bold'} gutterBottom>
                                                    {notification.title}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Notifications sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                        <Typography color="textSecondary">No notifications</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Timesheets */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Description color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Recent Timesheets
                                    </Typography>
                                </Box>
                                {recent_timesheets.length > 0 ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Week</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {recent_timesheets.map((timesheet) => (
                                                    <TableRow
                                                        key={timesheet.timesheet_id}
                                                        sx={{
                                                            '&:hover': {
                                                                bgcolor: 'action.hover',
                                                            },
                                                        }}
                                                    >
                                                        <TableCell>
                                                            {new Date(timesheet.week_start_date).toLocaleDateString()} - {new Date(timesheet.week_end_date).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography fontWeight={600}>{timesheet.total_hours || 0}h</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={timesheet.status}
                                                                size="small"
                                                                color={
                                                                    timesheet.status === 'APPROVED' ? 'success' :
                                                                        timesheet.status === 'REJECTED' ? 'error' :
                                                                            timesheet.status === 'SUBMITTED' ? 'warning' : 'default'
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Description sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                        <Typography color="textSecondary">No timesheets yet</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Payroll */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AttachMoney color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Recent Payroll
                                    </Typography>
                                </Box>
                                {recent_payroll.length > 0 ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600 }}>Month/Year</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Net Salary</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {recent_payroll.map((payroll) => (
                                                    <TableRow
                                                        key={payroll.payroll_id}
                                                        sx={{
                                                            '&:hover': {
                                                                bgcolor: 'action.hover',
                                                            },
                                                        }}
                                                    >
                                                        <TableCell>
                                                            {payroll.month}/{payroll.year}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography fontWeight={600} color="success.main">
                                                                ₹{parseFloat(payroll.net_salary).toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={payroll.payment_status}
                                                                size="small"
                                                                color={payroll.payment_status === 'paid' ? 'success' : 'warning'}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <AttachMoney sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                        <Typography color="textSecondary">No payroll records yet</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
};

export default EmployeeDashboard;

