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
    IconButton,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../services/api';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';

const TimesheetManagement = () => {
    const [timesheets, setTimesheets] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [entries, setEntries] = useState([]);
    const [editingTimesheet, setEditingTimesheet] = useState(null);

    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

    useEffect(() => {
        fetchTimesheets();
    }, [selectedWeek]);

    const fetchTimesheets = async () => {
        try {
            const startDate = format(weekStart, 'yyyy-MM-dd');
            const endDate = format(weekEnd, 'yyyy-MM-dd');
            const response = await api.get(`/timesheets/my-timesheets?start_date=${startDate}&end_date=${endDate}`);
            if (response.data.success) {
                setTimesheets(response.data.data);
            }
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleOpen = (timesheet = null) => {
        if (timesheet) {
            setEditingTimesheet(timesheet);
            setEntries(timesheet.entries || []);
        } else {
            setEditingTimesheet(null);
            // Initialize entries for the week
            const weekEntries = [];
            let currentDate = new Date(weekStart);
            while (currentDate <= weekEnd) {
                weekEntries.push({
                    date: format(currentDate, 'yyyy-MM-dd'),
                    task_name: '',
                    hours: 0,
                    description: ''
                });
                currentDate = addDays(currentDate, 1);
            }
            setEntries(weekEntries);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingTimesheet(null);
        setEntries([]);
    };

    const updateEntry = (index, field, value) => {
        const updated = [...entries];
        updated[index][field] = value;
        setEntries(updated);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                week_start_date: format(weekStart, 'yyyy-MM-dd'),
                week_end_date: format(weekEnd, 'yyyy-MM-dd'),
                entries: entries.filter(e => e.hours > 0)
            };

            if (editingTimesheet) {
                await api.put(`/timesheets/my-timesheets/${editingTimesheet.timesheet_id}`, payload);
                showSuccess('Timesheet updated successfully');
            } else {
                await api.post('/timesheets/my-timesheets', payload);
                showSuccess('Timesheet created successfully');
            }

            handleClose();
            fetchTimesheets();
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleSubmitForApproval = async (timesheetId) => {
        try {
            await api.put(`/timesheets/my-timesheets/${timesheetId}/submit`);
            showSuccess('Timesheet submitted for approval');
            fetchTimesheets();
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            case 'SUBMITTED': return 'warning';
            default: return 'default';
        }
    };

    const currentTimesheet = timesheets.find(ts => 
        ts.week_start_date === format(weekStart, 'yyyy-MM-dd')
    );

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">My Timesheets</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        type="week"
                        label="Select Week"
                        value={format(weekStart, 'yyyy-\\WW')}
                        onChange={(e) => {
                            const [year, week] = e.target.value.split('-W');
                            const date = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
                            setSelectedWeek(date);
                        }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                        disabled={currentTimesheet?.status === 'APPROVED'}
                    >
                        {currentTimesheet ? 'Edit' : 'Create'} Timesheet
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary">Week</Typography>
                            <Typography variant="h6">
                                {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary">Status</Typography>
                            <Typography variant="h6">
                                {currentTimesheet ? (
                                    <Chip
                                        label={currentTimesheet.status}
                                        color={getStatusColor(currentTimesheet.status)}
                                        size="small"
                                    />
                                ) : (
                                    'No timesheet'
                                )}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary">Total Hours</Typography>
                            <Typography variant="h6">
                                {currentTimesheet?.total_hours || 0} hrs
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {currentTimesheet && (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Task</TableCell>
                                <TableCell>Hours</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentTimesheet.entries?.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell>{format(parseISO(entry.date), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>{entry.task_name || '-'}</TableCell>
                                    <TableCell>{entry.hours}</TableCell>
                                    <TableCell>{entry.description || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {currentTimesheet && currentTimesheet.status === 'DRAFT' && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={() => handleSubmitForApproval(currentTimesheet.timesheet_id)}
                    >
                        Submit for Approval
                    </Button>
                </Box>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingTimesheet ? 'Edit' : 'Create'} Timesheet - Week of {format(weekStart, 'MMM dd')}
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Task Name</TableCell>
                                    <TableCell>Hours</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {entries.map((entry, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{format(parseISO(entry.date), 'MMM dd')}</TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={entry.task_name}
                                                onChange={(e) => updateEntry(index, 'task_name', e.target.value)}
                                                placeholder="Task name (optional)"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={entry.hours}
                                                onChange={(e) => updateEntry(index, 'hours', parseFloat(e.target.value) || 0)}
                                                inputProps={{ min: 0, max: 24, step: 0.5 }}
                                                sx={{ width: 80 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={entry.description}
                                                onChange={(e) => updateEntry(index, 'description', e.target.value)}
                                                placeholder="Description (optional)"
                                                fullWidth
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Total Hours: {entries.reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0).toFixed(1)}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingTimesheet ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TimesheetManagement;

