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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../services/api';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';

const SalaryStructure = () => {
    const [structures, setStructures] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: '',
        basic_salary: '',
        allowances: {},
        deductions: {},
        effective_from: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchStructures();
        fetchEmployees();
    }, []);

    const fetchStructures = async () => {
        try {
            const response = await api.get('/payroll/salary-structures?is_active=true');
            if (response.data.success) {
                setStructures(response.data.data);
            }
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleOpen = (structure = null) => {
        if (structure) {
            setFormData({
                employee_id: structure.employee_id,
                basic_salary: structure.basic_salary,
                allowances: structure.allowances || {},
                deductions: structure.deductions || {},
                effective_from: structure.effective_from
            });
        } else {
            setFormData({
                employee_id: '',
                basic_salary: '',
                allowances: {},
                deductions: {},
                effective_from: new Date().toISOString().split('T')[0]
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({
            employee_id: '',
            basic_salary: '',
            allowances: {},
            deductions: {},
            effective_from: new Date().toISOString().split('T')[0]
        });
    };

    const handleSubmit = async () => {
        try {
            await api.post('/payroll/salary-structures', formData);
            showSuccess('Salary structure saved successfully');
            handleClose();
            fetchStructures();
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const updateAllowance = (key, value) => {
        setFormData({
            ...formData,
            allowances: {
                ...formData.allowances,
                [key]: parseFloat(value) || 0
            }
        });
    };

    const updateDeduction = (key, value) => {
        setFormData({
            ...formData,
            deductions: {
                ...formData.deductions,
                [key]: parseFloat(value) || 0
            }
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Salary Structures</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Salary Structure
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Basic Salary</TableCell>
                            <TableCell>Gross Salary</TableCell>
                            <TableCell>Net Salary</TableCell>
                            <TableCell>Effective From</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {structures.map((structure) => (
                            <TableRow key={structure.salary_structure_id}>
                                <TableCell>
                                    {structure.employee?.user?.first_name} {structure.employee?.user?.last_name}
                                    <br />
                                    <Typography variant="caption" color="text.secondary">
                                        {structure.employee?.employee_code}
                                    </Typography>
                                </TableCell>
                                <TableCell>₹{parseFloat(structure.basic_salary).toLocaleString('en-IN')}</TableCell>
                                <TableCell>₹{parseFloat(structure.gross_salary).toLocaleString('en-IN')}</TableCell>
                                <TableCell>₹{parseFloat(structure.net_salary).toLocaleString('en-IN')}</TableCell>
                                <TableCell>{new Date(structure.effective_from).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(structure)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Salary Structure</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        label="Employee"
                        fullWidth
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        sx={{ mb: 2, mt: 2 }}
                    >
                        {employees.map((emp) => (
                            <MenuItem key={emp.employee_id} value={emp.employee_id}>
                                {emp.user?.first_name} {emp.user?.last_name} ({emp.employee_code})
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Basic Salary"
                        type="number"
                        fullWidth
                        value={formData.basic_salary}
                        onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Effective From"
                        type="date"
                        fullWidth
                        value={formData.effective_from}
                        onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Allowances</Typography>
                    <TextField
                        label="HRA"
                        type="number"
                        fullWidth
                        value={formData.allowances.HRA || ''}
                        onChange={(e) => updateAllowance('HRA', e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        label="DA (Dearness Allowance)"
                        type="number"
                        fullWidth
                        value={formData.allowances.DA || ''}
                        onChange={(e) => updateAllowance('DA', e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        label="TA (Travel Allowance)"
                        type="number"
                        fullWidth
                        value={formData.allowances.TA || ''}
                        onChange={(e) => updateAllowance('TA', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Deductions</Typography>
                    <TextField
                        label="PF (Provident Fund)"
                        type="number"
                        fullWidth
                        value={formData.deductions.PF || ''}
                        onChange={(e) => updateDeduction('PF', e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        label="ESI"
                        type="number"
                        fullWidth
                        value={formData.deductions.ESI || ''}
                        onChange={(e) => updateDeduction('ESI', e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        label="Tax"
                        type="number"
                        fullWidth
                        value={formData.deductions.Tax || ''}
                        onChange={(e) => updateDeduction('Tax', e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SalaryStructure;

