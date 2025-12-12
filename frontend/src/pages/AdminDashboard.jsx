import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Tabs,
    Tab
} from '@mui/material';
import {
    People,
    Business,
    Today,
    PendingActions,
    CheckCircle,
    Cancel,
    Schedule
} from '@mui/icons-material';
import { getAdminDashboard, getAllEmployees, getPendingApprovals, updateEmployeeStatus } from '../services/adminService';
import { showSuccess, showError } from '../utils/toast';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [statusData, setStatusData] = useState({ status: '', termination_date: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
        fetchEmployees();
        fetchPendingApprovals();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await getAdminDashboard();
            setDashboardData(response.data);
        } catch (error) {
            showError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await getAllEmployees({ limit: 50 });
            setEmployees(response.data.employees);
        } catch (error) {
            showError('Failed to load employees');
        }
    };

    const fetchPendingApprovals = async () => {
        try {
            const response = await getPendingApprovals();
            setPendingApprovals(response.data);
        } catch (error) {
            showError('Failed to load pending approvals');
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await updateEmployeeStatus(selectedEmployee.employee_id, statusData);
            showSuccess('Employee status updated successfully');
            setStatusDialogOpen(false);
            fetchEmployees();
        } catch (error) {
            showError('Failed to update employee status');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    const StatCard = ({ icon, title, value, color = 'primary', onClick }) => (
        <Card sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div">
                            {value}
                        </Typography>
                    </Box>
                    <Box color={`${color}.main`}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Layout>
            <Box>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>

            {dashboardData && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<People sx={{ fontSize: 40 }} />}
                            title="Total Employees"
                            value={dashboardData.overview.total_employees}
                            onClick={() => setTabValue(1)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<Business sx={{ fontSize: 40 }} />}
                            title="Departments"
                            value={dashboardData.overview.total_departments}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<Today sx={{ fontSize: 40 }} />}
                            title="Today's Attendance"
                            value={dashboardData.overview.today_attendance}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<PendingActions sx={{ fontSize: 40 }} />}
                            title="Pending Leaves"
                            value={dashboardData.overview.pending_leaves}
                            color="warning"
                            onClick={() => setTabValue(2)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<Schedule sx={{ fontSize: 40 }} />}
                            title="Pending Timesheets"
                            value={dashboardData.overview.pending_timesheets}
                            color="warning"
                            onClick={() => setTabValue(2)}
                        />
                    </Grid>

                    {/* Monthly Attendance Summary */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Monthly Attendance Summary
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography>Total Records:</Typography>
                                        <Typography fontWeight="bold">{dashboardData.monthly_attendance.total_records}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography>Present:</Typography>
                                        <Chip label={dashboardData.monthly_attendance.present_count} color="success" size="small" />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography>Absent:</Typography>
                                        <Chip label={dashboardData.monthly_attendance.absent_count} color="error" size="small" />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography>Late:</Typography>
                                        <Chip label={dashboardData.monthly_attendance.late_count} color="warning" size="small" />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Leaves */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Recent Leave Requests
                                </Typography>
                                {dashboardData.recent_leaves.length > 0 ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Employee</TableCell>
                                                    <TableCell>Dates</TableCell>
                                                    <TableCell>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dashboardData.recent_leaves.slice(0, 5).map((leave) => (
                                                    <TableRow key={leave.leave_request_id}>
                                                        <TableCell>
                                                            {leave.employee?.user?.first_name} {leave.employee?.user?.last_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={leave.status}
                                                                size="small"
                                                                color={
                                                                    leave.status === 'APPROVED' ? 'success' :
                                                                    leave.status === 'REJECTED' ? 'error' : 'warning'
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography color="textSecondary">No recent leave requests</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tabs for Employees and Approvals */}
            <Box sx={{ mt: 4 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="Overview" />
                    <Tab label="Employees" />
                    <Tab label="Pending Approvals" />
                </Tabs>

                {tabValue === 1 && (
                    <Box sx={{ mt: 2 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    All Employees
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Department</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {employees.map((emp) => (
                                                <TableRow key={emp.employee_id}>
                                                    <TableCell>
                                                        {emp.user?.first_name} {emp.user?.last_name}
                                                    </TableCell>
                                                    <TableCell>{emp.user?.email}</TableCell>
                                                    <TableCell>{emp.department?.department_name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={emp.status}
                                                            size="small"
                                                            color={emp.status === 'active' ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedEmployee(emp);
                                                                setStatusData({ status: emp.status, termination_date: '' });
                                                                setStatusDialogOpen(true);
                                                            }}
                                                        >
                                                            Update Status
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {tabValue === 2 && pendingApprovals && (
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Pending Leave Requests
                                        </Typography>
                                        {pendingApprovals.pending_leaves.length > 0 ? (
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Employee</TableCell>
                                                            <TableCell>Dates</TableCell>
                                                            <TableCell>Action</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {pendingApprovals.pending_leaves.map((leave) => (
                                                            <TableRow key={leave.leave_request_id}>
                                                                <TableCell>
                                                                    {leave.employee?.user?.first_name} {leave.employee?.user?.last_name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        size="small"
                                                                        onClick={() => navigate(`/leaves?approve=${leave.leave_request_id}`)}
                                                                    >
                                                                        Review
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography color="textSecondary">No pending leave requests</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Pending Timesheet Approvals
                                        </Typography>
                                        {pendingApprovals.pending_timesheets.length > 0 ? (
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Employee</TableCell>
                                                            <TableCell>Week</TableCell>
                                                            <TableCell>Action</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {pendingApprovals.pending_timesheets.map((timesheet) => (
                                                            <TableRow key={timesheet.timesheet_id}>
                                                                <TableCell>
                                                                    {timesheet.employee?.user?.first_name} {timesheet.employee?.user?.last_name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {new Date(timesheet.week_start_date).toLocaleDateString()} - {new Date(timesheet.week_end_date).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        size="small"
                                                                        onClick={() => navigate(`/timesheets?approve=${timesheet.timesheet_id}`)}
                                                                    >
                                                                        Review
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography color="textSecondary">No pending timesheet approvals</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
                <DialogTitle>Update Employee Status</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        select
                        label="Status"
                        value={statusData.status}
                        onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="terminated">Terminated</MenuItem>
                        <MenuItem value="resigned">Resigned</MenuItem>
                    </TextField>
                    {statusData.status === 'terminated' && (
                        <TextField
                            fullWidth
                            type="date"
                            label="Termination Date"
                            value={statusData.termination_date}
                            onChange={(e) => setStatusData({ ...statusData, termination_date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleStatusUpdate}>Update</Button>
                </DialogActions>
            </Dialog>
            </Box>
        </Layout>
    );
};

export default AdminDashboard;

