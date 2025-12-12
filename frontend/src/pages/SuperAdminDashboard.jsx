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
    Business,
    People,
    AccountBalance,
    TrendingUp,
    CheckCircle,
    Cancel,
    Schedule
} from '@mui/icons-material';
import {
    getSuperAdminDashboard,
    getAllCompanies,
    getSubscriptionPlans,
    getAllSubscriptions,
    assignSubscription,
    updateCompanyStatus
} from '../services/superAdminService';
import { showSuccess, showError } from '../utils/toast';
import Layout from '../components/Layout';

const SuperAdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [assignData, setAssignData] = useState({ organization_id: '', plan_id: '', billing_cycle: 'MONTHLY', start_date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        fetchDashboard();
        fetchCompanies();
        fetchPlans();
        fetchSubscriptions();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await getSuperAdminDashboard();
            setDashboardData(response.data);
        } catch (error) {
            showError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await getAllCompanies({ limit: 50 });
            setCompanies(response.data.companies);
        } catch (error) {
            showError('Failed to load companies');
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await getSubscriptionPlans();
            setPlans(response.data);
        } catch (error) {
            showError('Failed to load subscription plans');
        }
    };

    const fetchSubscriptions = async () => {
        try {
            const response = await getAllSubscriptions({ limit: 50 });
            setSubscriptions(response.data.subscriptions);
        } catch (error) {
            showError('Failed to load subscriptions');
        }
    };

    const handleAssignSubscription = async () => {
        try {
            await assignSubscription(assignData);
            showSuccess('Subscription assigned successfully');
            setAssignDialogOpen(false);
            fetchSubscriptions();
            fetchCompanies();
        } catch (error) {
            showError('Failed to assign subscription');
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            await updateCompanyStatus(selectedCompany.organization_id, status);
            showSuccess('Company status updated successfully');
            setStatusDialogOpen(false);
            fetchCompanies();
        } catch (error) {
            showError('Failed to update company status');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    const StatCard = ({ icon, title, value, color = 'primary' }) => (
        <Card>
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
                    Super Admin Dashboard
                </Typography>

            {dashboardData && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<Business sx={{ fontSize: 40 }} />}
                            title="Total Companies"
                            value={dashboardData.overview.total_companies}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<CheckCircle sx={{ fontSize: 40 }} />}
                            title="Active Companies"
                            value={dashboardData.overview.active_companies}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<People sx={{ fontSize: 40 }} />}
                            title="Total Employees"
                            value={dashboardData.overview.total_employees}
                            color="info"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<People sx={{ fontSize: 40 }} />}
                            title="Total Users"
                            value={dashboardData.overview.total_users}
                            color="info"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard
                            icon={<AccountBalance sx={{ fontSize: 40 }} />}
                            title="Monthly Revenue"
                            value={`₹${parseFloat(dashboardData.overview.monthly_revenue || 0).toFixed(2)}`}
                            color="success"
                        />
                    </Grid>

                    {/* Subscription Statistics */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Subscription Statistics
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {Object.entries(dashboardData.subscriptions).map(([status, count]) => (
                                        <Box key={status} display="flex" justifyContent="space-between" mb={1}>
                                            <Typography>{status}:</Typography>
                                            <Chip
                                                label={count}
                                                size="small"
                                                color={
                                                    status === 'ACTIVE' ? 'success' :
                                                    status === 'TRIAL' ? 'warning' :
                                                    status === 'SUSPENDED' ? 'error' : 'default'
                                                }
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Usage Statistics */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Usage Statistics
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography>Attendance Records:</Typography>
                                        <Typography fontWeight="bold">{dashboardData.usage.total_attendance_records}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography>Leave Requests:</Typography>
                                        <Typography fontWeight="bold">{dashboardData.usage.total_leave_requests}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography>Timesheets:</Typography>
                                        <Typography fontWeight="bold">{dashboardData.usage.total_timesheets}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography>Payrolls:</Typography>
                                        <Typography fontWeight="bold">{dashboardData.usage.total_payrolls}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tabs */}
            <Box sx={{ mt: 4 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="Overview" />
                    <Tab label="Companies" />
                    <Tab label="Subscriptions" />
                </Tabs>

                {tabValue === 1 && (
                    <Box sx={{ mt: 2 }}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">
                                        All Companies
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setAssignData({ organization_id: '', plan_id: '', billing_cycle: 'MONTHLY', start_date: new Date().toISOString().split('T')[0] });
                                            setAssignDialogOpen(true);
                                        }}
                                    >
                                        Assign Subscription
                                    </Button>
                                </Box>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Company Name</TableCell>
                                                <TableCell>Subdomain</TableCell>
                                                <TableCell>Employees</TableCell>
                                                <TableCell>Plan</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {companies.map((company) => (
                                                <TableRow key={company.organization_id}>
                                                    <TableCell>{company.organization_name}</TableCell>
                                                    <TableCell>{company.subdomain}</TableCell>
                                                    <TableCell>{company.employee_count || 0}</TableCell>
                                                    <TableCell>
                                                        {company.subscription?.plan?.plan_name || 'No Plan'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={company.status}
                                                            size="small"
                                                            color={company.status === 'active' ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedCompany(company);
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

                {tabValue === 2 && (
                    <Box sx={{ mt: 2 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    All Subscriptions
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Company</TableCell>
                                                <TableCell>Plan</TableCell>
                                                <TableCell>Billing Cycle</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Amount</TableCell>
                                                <TableCell>Next Billing</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {subscriptions.map((sub) => (
                                                <TableRow key={sub.subscription_id}>
                                                    <TableCell>{sub.organization?.organization_name}</TableCell>
                                                    <TableCell>{sub.plan?.plan_name}</TableCell>
                                                    <TableCell>{sub.billing_cycle}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={sub.status}
                                                            size="small"
                                                            color={
                                                                sub.status === 'ACTIVE' ? 'success' :
                                                                sub.status === 'TRIAL' ? 'warning' :
                                                                sub.status === 'SUSPENDED' ? 'error' : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>₹{parseFloat(sub.amount || 0).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : 'N/A'}
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
            </Box>

            {/* Assign Subscription Dialog */}
            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Subscription</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        select
                        label="Company"
                        value={assignData.organization_id}
                        onChange={(e) => setAssignData({ ...assignData, organization_id: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    >
                        {companies.map((company) => (
                            <MenuItem key={company.organization_id} value={company.organization_id}>
                                {company.organization_name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        select
                        label="Plan"
                        value={assignData.plan_id}
                        onChange={(e) => setAssignData({ ...assignData, plan_id: e.target.value })}
                        sx={{ mb: 2 }}
                    >
                        {plans.map((plan) => (
                            <MenuItem key={plan.plan_id} value={plan.plan_id}>
                                {plan.plan_name} - ₹{plan.price_per_month}/month
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        select
                        label="Billing Cycle"
                        value={assignData.billing_cycle}
                        onChange={(e) => setAssignData({ ...assignData, billing_cycle: e.target.value })}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="MONTHLY">Monthly</MenuItem>
                        <MenuItem value="YEARLY">Yearly</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        type="date"
                        label="Start Date"
                        value={assignData.start_date}
                        onChange={(e) => setAssignData({ ...assignData, start_date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAssignSubscription}>Assign</Button>
                </DialogActions>
            </Dialog>

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
                <DialogTitle>Update Company Status</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Company: {selectedCompany?.organization_name}
                    </Typography>
                    <Box display="flex" gap={2}>
                        <Button
                            variant={selectedCompany?.status === 'active' ? 'contained' : 'outlined'}
                            onClick={() => handleStatusUpdate('active')}
                        >
                            Active
                        </Button>
                        <Button
                            variant={selectedCompany?.status === 'inactive' ? 'contained' : 'outlined'}
                            onClick={() => handleStatusUpdate('inactive')}
                        >
                            Inactive
                        </Button>
                        <Button
                            variant={selectedCompany?.status === 'suspended' ? 'contained' : 'outlined'}
                            onClick={() => handleStatusUpdate('suspended')}
                        >
                            Suspended
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            </Box>
        </Layout>
    );
};

export default SuperAdminDashboard;

