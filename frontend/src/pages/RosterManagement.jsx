import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@mui/material';
import rosterService from '../services/rosterService';
import { format, startOfWeek, addDays } from 'date-fns';
import { showError, extractErrorMessage } from '../utils/toast';

const RosterManagement = () => {
    const [roster, setRoster] = useState([]);
    const [startDate, setStartDate] = useState(new Date());

    const fetchRoster = async () => {
        const start = format(startOfWeek(startDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const end = format(addDays(new Date(start), 6), 'yyyy-MM-dd');

        try {
            const response = await rosterService.getRoster(start, end);
            if (response.data) setRoster(response.data);
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    useEffect(() => {
        fetchRoster();
    }, [startDate]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Roster Management</Typography>
                <TextField
                    type="date"
                    label="Week Of"
                    InputLabelProps={{ shrink: true }}
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                />
            </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Shift</TableCell>
                            <TableCell>Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roster.map((r, i) => (
                            <TableRow key={i}>
                                <TableCell>{r.date}</TableCell>
                                <TableCell>{r.employee?.user?.first_name} {r.employee?.user?.last_name}</TableCell>
                                <TableCell>{r.is_rest_day ? 'Rest Day' : r.shift?.name || '-'}</TableCell>
                                <TableCell>{r.is_rest_day ? 'Rest' : 'Work'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default RosterManagement;
