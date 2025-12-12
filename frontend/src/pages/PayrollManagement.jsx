import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tabs,
    Tab
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import api from '../services/api';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';
import { format } from 'date-fns';

const PayrollManagement = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [openProcess, setOpenProcess] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        fetchPayrolls();
        fetchSummary();
    }, [selectedMonth, selectedYear]);

    const fetchPayrolls = async () => {
        try {
            const response = await api.get(`/payroll?month=${selectedMonth}&year=${selectedYear}`);
            if (response.data.success) {
                setPayrolls(response.data.data);
            }
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await api.get(`/payroll/summary?month=${selectedMonth}&year=${selectedYear}`);
            if (response.data.success) {
                setSummary(response.data.data.summary);
            }
        } catch (error) {
            // Summary might not exist yet
        }
    };

    const handleProcessPayroll = async () => {
        try {
            await api.post('/payroll/process', { month: selectedMonth, year: selectedYear });
            showSuccess('Payroll processed successfully');
            setOpenProcess(false);
            fetchPayrolls();
            fetchSummary();
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await api.get(`/payroll/export/excel?month=${selectedMonth}&year=${selectedYear}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payroll_${selectedMonth}_${selectedYear}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showSuccess('Excel file downloaded');
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await api.get(`/payroll/export/csv?month=${selectedMonth}&year=${selectedYear}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payroll_${selectedMonth}_${selectedYear}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showSuccess('CSV file downloaded');
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleGeneratePayslip = async (payrollId, sendEmail = false) => {
        try {
            const response = await api.post(`/payroll/${payrollId}/generate-payslip`, { sendEmail });
            if (response.data.success) {
                showSuccess(sendEmail ? 'Payslip generated and emailed' : 'Payslip generated successfully');
                if (response.data.data.download_url) {
                    window.open(response.data.data.download_url, '_blank');
                }
            }
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleMarkAsPaid = async (payrollId) => {
        try {
            await api.put(`/payroll/${payrollId}/mark-paid`, {
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'Bank Transfer'
            });
            showSuccess('Payroll marked as paid');
            fetchPayrolls();
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'processed': return 'info';
            default: return 'warning';
        }
    };

    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Payroll Management</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        select
                        label="Month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        sx={{ minWidth: 120 }}
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <MenuItem key={month} value={month}>
                                {new Date(selectedYear, month - 1).toLocaleString('default', { month: 'long' })}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        type="number"
                        label="Year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        sx={{ width: 100 }}
                    />
                    <Button variant="contained" onClick={() => setOpenProcess(true)}>
                        Process Payroll
                    </Button>
                </Box>
            </Box>

            {summary && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">Total Employees</Typography>
                                <Typography variant="h4">{summary.total_employees}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">Total Gross Salary</Typography>
                                <Typography variant="h4">
                                    ₹{summary.total_gross.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary">Total Net Salary</Typography>
                                <Typography variant="h4">
                                    ₹{summary.total_net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportExcel}
                    disabled={payrolls.length === 0}
                >
                    Export Excel
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportCSV}
                    disabled={payrolls.length === 0}
                >
                    Export CSV
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee Code</TableCell>
                            <TableCell>Employee Name</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Present Days</TableCell>
                            <TableCell>Gross Salary</TableCell>
                            <TableCell>Net Salary</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payrolls.map((payroll) => (
                            <TableRow key={payroll.payroll_id}>
                                <TableCell>{payroll.employee?.employee_code}</TableCell>
                                <TableCell>
                                    {payroll.employee?.user?.first_name} {payroll.employee?.user?.last_name}
                                </TableCell>
                                <TableCell>{payroll.employee?.department?.department_name || 'N/A'}</TableCell>
                                <TableCell>{payroll.present_days}</TableCell>
                                <TableCell>₹{parseFloat(payroll.gross_salary).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell>₹{parseFloat(payroll.net_salary).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={payroll.payment_status}
                                        color={getStatusColor(payroll.payment_status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleGeneratePayslip(payroll.payroll_id)}
                                        title="Generate Payslip"
                                    >
                                        <PrintIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleGeneratePayslip(payroll.payroll_id, true)}
                                        title="Generate & Email Payslip"
                                    >
                                        <EmailIcon />
                                    </IconButton>
                                    {payroll.payment_status !== 'paid' && (
                                        <Button
                                            size="small"
                                            onClick={() => handleMarkAsPaid(payroll.payroll_id)}
                                        >
                                            Mark Paid
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {payrolls.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No payroll records found. Process payroll for {monthName} {selectedYear}.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openProcess} onClose={() => setOpenProcess(false)}>
                <DialogTitle>Process Payroll</DialogTitle>
                <DialogContent>
                    <Typography>
                        Process payroll for <strong>{monthName} {selectedYear}</strong>?
                        <br />
                        This will generate payroll records for all employees with active salary structures.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenProcess(false)}>Cancel</Button>
                    <Button onClick={handleProcessPayroll} variant="contained">
                        Process
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PayrollManagement;

