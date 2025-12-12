import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    MenuItem,
    Tabs,
    Tab,
    Button,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import payrollService from '../services/payrollService';
import { showError, extractErrorMessage } from '../utils/toast';

const StatutoryReports = () => {
    const [tabValue, setTabValue] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [pfData, setPfData] = useState(null);
    const [taxData, setTaxData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tabValue === 0) {
            fetchPFStatement();
        } else {
            fetchTaxStatement();
        }
    }, [tabValue, selectedYear]);

    const fetchPFStatement = async () => {
        setLoading(true);
        try {
            const response = await payrollService.getPFStatement({ year: selectedYear });
            if (response.success) {
                setPfData(response.data);
            }
        } catch (error) {
            showError(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const fetchTaxStatement = async () => {
        setLoading(true);
        try {
            const response = await payrollService.getTaxStatement({ year: selectedYear });
            if (response.success) {
                setTaxData(response.data);
            }
        } catch (error) {
            showError(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleExportPF = () => {
        // Export PF statement to Excel/CSV
        // Implementation similar to payroll export
    };

    const handleExportTax = () => {
        // Export Tax statement to Excel/CSV
        // Implementation similar to payroll export
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Statutory Reports</Typography>
                <TextField
                    type="number"
                    label="Year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    sx={{ width: 120 }}
                />
            </Box>

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                <Tab label="PF Statement" />
                <Tab label="Tax Statement" />
            </Tabs>

            {tabValue === 0 && (
                <Box>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportPF}
                            disabled={!pfData}
                        >
                            Export
                        </Button>
                    </Box>

                    {pfData && (
                        <>
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary">Total Employee PF</Typography>
                                            <Typography variant="h5">
                                                ₹{pfData.totals.total_employee_pf.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary">Total Employer PF</Typography>
                                            <Typography variant="h5">
                                                ₹{pfData.totals.total_employer_pf.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary">Total PF Contribution</Typography>
                                            <Typography variant="h5">
                                                ₹{pfData.totals.total_pf.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Month</TableCell>
                                            <TableCell>Employee Code</TableCell>
                                            <TableCell>Employee Name</TableCell>
                                            <TableCell>Basic Salary</TableCell>
                                            <TableCell>Employee PF (12%)</TableCell>
                                            <TableCell>Employer PF (12%)</TableCell>
                                            <TableCell>Total PF</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pfData.statements.map((stmt, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {new Date(stmt.year, stmt.month - 1).toLocaleString('default', { month: 'long' })}
                                                </TableCell>
                                                <TableCell>{stmt.employee_code}</TableCell>
                                                <TableCell>{stmt.employee_name}</TableCell>
                                                <TableCell>₹{stmt.basic_salary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell>₹{stmt.employee_pf.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell>₹{stmt.employer_pf.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell>₹{stmt.total_pf.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            )}

            {tabValue === 1 && (
                <Box>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportTax}
                            disabled={!taxData}
                        >
                            Export
                        </Button>
                    </Box>

                    {taxData && (
                        <>
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary">Total Gross Salary</Typography>
                                            <Typography variant="h6">
                                                ₹{taxData.totals.total_gross.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary">Total Deductions</Typography>
                                            <Typography variant="h6">
                                                ₹{taxData.totals.total_deductions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary">Total Taxable Income</Typography>
                                            <Typography variant="h6">
                                                ₹{taxData.totals.total_taxable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="text.secondary">Total Tax Deducted</Typography>
                                            <Typography variant="h6">
                                                ₹{taxData.totals.total_tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Month</TableCell>
                                            <TableCell>Employee Code</TableCell>
                                            <TableCell>Employee Name</TableCell>
                                            <TableCell>Gross Salary</TableCell>
                                            <TableCell>Deductions</TableCell>
                                            <TableCell>Taxable Income</TableCell>
                                            <TableCell>Tax Deducted</TableCell>
                                            <TableCell>Net Salary</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {taxData.statements.map((stmt, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {new Date(stmt.year, stmt.month - 1).toLocaleString('default', { month: 'long' })}
                                                </TableCell>
                                                <TableCell>{stmt.employee_code}</TableCell>
                                                <TableCell>{stmt.employee_name}</TableCell>
                                                <TableCell>₹{stmt.gross_salary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell>₹{stmt.deductions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell>₹{stmt.taxable_income.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell>₹{stmt.tax_deducted.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell>₹{stmt.net_salary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default StatutoryReports;

