import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import attendanceService from '../services/attendanceService';
import { useForm } from 'react-hook-form';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';

const ShiftManagement = () => {
    const [shifts, setShifts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const { register, handleSubmit, reset, setValue } = useForm();

    const fetchShifts = async () => {
        try {
            const response = await attendanceService.getShifts();
            if (response.data) setShifts(response.data);
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleOpen = (shift = null) => {
        setEditingShift(shift);
        if (shift) {
            setValue('name', shift.name);
            setValue('startTime', shift.startTime);
            setValue('endTime', shift.endTime);
            setValue('lateBuffer', shift.lateBuffer);
        } else {
            reset();
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingShift(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (editingShift) {
                await attendanceService.updateShift(editingShift.id, data);
            } else {
                await attendanceService.createShift(data);
            }
            fetchShifts();
            handleClose();
            showSuccess(editingShift ? 'Shift updated successfully' : 'Shift created successfully');
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this shift?')) {
            try {
                await attendanceService.deleteShift(id);
                fetchShifts();
                showSuccess('Shift deleted successfully');
            } catch (error) {
                showError(extractErrorMessage(error));
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Shift Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Shift
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Start Time</TableCell>
                            <TableCell>End Time</TableCell>
                            <TableCell>Late Buffer (mins)</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shifts.map((shift) => (
                            <TableRow key={shift.id}>
                                <TableCell>{shift.name}</TableCell>
                                <TableCell>{shift.startTime}</TableCell>
                                <TableCell>{shift.endTime}</TableCell>
                                <TableCell>{shift.lateBuffer}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(shift)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(shift.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editingShift ? 'Edit Shift' : 'New Shift'}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
                        <TextField label="Shift Name" fullWidth {...register('name', { required: true })} />
                        <TextField label="Start Time" type="time" fullWidth InputLabelProps={{ shrink: true }} {...register('startTime', { required: true })} />
                        <TextField label="End Time" type="time" fullWidth InputLabelProps={{ shrink: true }} {...register('endTime', { required: true })} />
                        <TextField label="Late Buffer (minutes)" type="number" fullWidth {...register('lateBuffer')} defaultValue={15} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ShiftManagement;
