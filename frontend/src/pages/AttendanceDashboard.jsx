import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    IconButton, 
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    LinearProgress,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import attendanceService from '../services/attendanceService';
import { format } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';
import Layout from '../components/Layout';

const AttendanceDashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        onLeave: 0
    });
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const response = await attendanceService.getDashboardStats(formattedDate);
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            showError(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [date]);

    const handleImportFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImportFile(file);
            setImportResult(null);
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            showError('Please select a file');
            return;
        }

        setImporting(true);
        try {
            const response = await attendanceService.importAttendance(importFile);
            setImportResult(response.data);
            if (response.data.errors && response.data.errors.length > 0) {
                showError(`Import completed with ${response.data.errors.length} errors`);
            } else {
                showSuccess(`Successfully imported ${response.data.success} attendance records`);
            }
            fetchStats(); // Refresh stats
        } catch (error) {
            showError(extractErrorMessage(error));
        } finally {
            setImporting(false);
        }
    };

    const handleCloseImportDialog = () => {
        setImportDialogOpen(false);
        setImportFile(null);
        setImportResult(null);
    };

    const data = [
        { name: 'Present', value: stats.present, color: '#10B981' },
        { name: 'Absent', value: stats.absent, color: '#EF4444' },
        { name: 'Late', value: stats.late, color: '#F59E0B' },
        { name: 'On Leave', value: stats.onLeave, color: '#3B82F6' },
    ];

    return (
        <Layout>
            <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Attendance Dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        type="date"
                        size="small"
                        value={format(date, 'yyyy-MM-dd')}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                    <IconButton onClick={fetchStats} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Employees" value={stats.total} color="#4F46E5" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Present" value={stats.present} color="#10B981" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Absent" value={stats.absent} color="#EF4444" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Late" value={stats.late} color="#F59E0B" />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: 400, borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Attendance Overview</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: 400, borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
                            <Button 
                                variant="contained" 
                                fullWidth 
                                sx={{ mb: 2 }}
                                startIcon={<UploadFileIcon />}
                                onClick={() => setImportDialogOpen(true)}
                            >
                                Import from Excel
                            </Button>
                            <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                                View Logs
                            </Button>
                            <Button variant="outlined" fullWidth>
                                Manage Shifts
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Import Dialog */}
            <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="md" fullWidth>
                <DialogTitle>Import Attendance from Excel</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2" component="div">
                            <strong>Excel Format:</strong>
                            <br />
                            Column A: Employee Code
                            <br />
                            Column B: Date (YYYY-MM-DD or MM/DD/YYYY)
                            <br />
                            Column C: Check-in Time (HH:MM) - Optional
                            <br />
                            Column D: Check-out Time (HH:MM) - Optional
                            <br />
                            Column E: Status (PRESENT/ABSENT/LATE/HALF_DAY/LEAVE) - Optional
                            <br />
                            Column F: Shift Name - Optional
                        </Typography>
                    </Alert>

                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<UploadFileIcon />}
                        >
                            {importFile ? importFile.name : 'Select Excel File'}
                            <input
                                type="file"
                                hidden
                                accept=".xlsx,.xls"
                                onChange={handleImportFile}
                            />
                        </Button>
                    </Box>

                    {importing && (
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress />
                            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                                Importing attendance records...
                            </Typography>
                        </Box>
                    )}

                    {importResult && (
                        <Box sx={{ mt: 2 }}>
                            <Alert 
                                severity={importResult.errors && importResult.errors.length > 0 ? "warning" : "success"}
                                sx={{ mb: 2 }}
                            >
                                <Typography variant="body2">
                                    <strong>Import Summary:</strong>
                                    <br />
                                    Success: {importResult.success}
                                    <br />
                                    Skipped: {importResult.skipped}
                                    <br />
                                    Total: {importResult.total}
                                    {importResult.errors && importResult.errors.length > 0 && (
                                        <>
                                            <br />
                                            Errors: {importResult.errors.length}
                                        </>
                                    )}
                                </Typography>
                            </Alert>

                            {importResult.errors && importResult.errors.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Errors:
                                    </Typography>
                                    <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'background.paper' }}>
                                        {importResult.errors.slice(0, 10).map((error, index) => (
                                            <ListItem key={index}>
                                                <ListItemText 
                                                    primary={error}
                                                    primaryTypographyProps={{ variant: 'body2' }}
                                                />
                                            </ListItem>
                                        ))}
                                        {importResult.errors.length > 10 && (
                                            <ListItem>
                                                <ListItemText 
                                                    primary={`... and ${importResult.errors.length - 10} more errors`}
                                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseImportDialog}>Close</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleImport}
                        disabled={!importFile || importing}
                    >
                        {importing ? 'Importing...' : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>
            </Box>
        </Layout>
    );
};

const StatCard = ({ title, value, color }) => (
    <Card sx={{ borderRadius: 2, boxShadow: 2, borderLeft: `5px solid ${color}` }}>
        <CardContent>
            <Typography color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
                {value}
            </Typography>
        </CardContent>
    </Card>
);

export default AttendanceDashboard;
