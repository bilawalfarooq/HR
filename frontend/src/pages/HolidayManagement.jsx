import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import holidayService from '../services/holidayService';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';

const HolidayManagement = () => {
    const [holidays, setHolidays] = useState([]);
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const fetchHolidays = async () => {
        try {
            const response = await holidayService.getHolidays();
            if (response.data) setHolidays(response.data);
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const onSubmit = async (data) => {
        try {
            await holidayService.createHoliday(data);
            setOpen(false);
            reset();
            fetchHolidays();
            showSuccess('Holiday added successfully');
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this holiday?")) {
            try {
                await holidayService.deleteHoliday(id);
                fetchHolidays();
                showSuccess('Holiday deleted successfully');
            } catch (error) {
                showError(extractErrorMessage(error));
            }
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Holiday Calendar</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Add Holiday
                </Button>
            </Box>

            <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                {holidays.map((holiday) => (
                    <ListItem key={holiday.id} divider>
                        <ListItemText
                            primary={holiday.name}
                            secondary={`${format(new Date(holiday.date), 'MMMM do, yyyy')} • ${holiday.description || ''}`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" color="error" onClick={() => handleDelete(holiday.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Holiday</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
                        <TextField label="Holiday Name" fullWidth {...register('name', { required: true })} />
                        <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('date', { required: true })} />
                        <TextField label="Description" fullWidth {...register('description')} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default HolidayManagement;
