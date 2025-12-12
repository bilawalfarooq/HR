import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, TextField, MenuItem, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import leaveService from '../services/leaveService';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';

const LeaveDashboard = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [types, setTypes] = useState([]);
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const fetchData = async () => {
        try {
            const [leavesRes, typesRes] = await Promise.all([
                leaveService.getMyLeaves(),
                leaveService.getTypes()
            ]);
            if (leavesRes.data) setLeaves(leavesRes.data);
            if (typesRes.data) setTypes(typesRes.data);
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data) => {
        try {
            await leaveService.requestLeave(data);
            setOpen(false);
            reset();
            fetchData();
            showSuccess('Leave request submitted successfully');
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">My Leaves</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Apply Leave
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Mock balances for now, real implementation would fetch from /balance */}
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#e0f2f1' }}>
                        <CardContent>
                            <Typography color="text.secondary">Annual Leave</Typography>
                            <Typography variant="h4">12 / 15</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Typography color="text.secondary">Sick Leave</Typography>
                            <Typography variant="h4">5 / 10</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Days</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaves.map((leave) => (
                            <TableRow key={leave.id}>
                                <TableCell>{leave.leaveType?.name}</TableCell>
                                <TableCell>{leave.start_date}</TableCell>
                                <TableCell>{leave.end_date}</TableCell>
                                <TableCell>{leave.days_count}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={leave.status}
                                        color={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {leaves.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No leave history found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Apply for Leave</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
                        <TextField
                            select
                            label="Leave Type"
                            fullWidth
                            {...register('leave_type_id', { required: true })}
                            defaultValue=""
                        >
                            {types.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register('start_date', { required: true })}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register('end_date', { required: true })}
                        />
                        <TextField
                            label="Reason"
                            multiline
                            rows={3}
                            fullWidth
                            {...register('reason')}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default LeaveDashboard;
