import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, Chip } from '@mui/material';
import attendanceService from '../services/attendanceService';
import { format } from 'date-fns';
import { showError, extractErrorMessage } from '../utils/toast';

const AttendanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [date, setDate] = useState(new Date());

    const fetchLogs = async () => {
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const response = await attendanceService.getLogs(formattedDate);
            if (response.data) setLogs(response.data);
        } catch (error) {
            showError(extractErrorMessage(error));
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [date]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">Attendance Logs</Typography>
                <TextField
                    type="date"
                    size="small"
                    value={format(date, 'yyyy-MM-dd')}
                    onChange={(e) => setDate(new Date(e.target.value))}
                    sx={{ bgcolor: 'white' }}
                />
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Device ID</TableCell>
                            <TableCell>Method</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} hover>
                                <TableCell>{format(new Date(log.timestamp), 'HH:mm:ss')}</TableCell>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {log.employee?.user?.first_name} {log.employee?.user?.last_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {log.employee?.employee_code}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={log.source} size="small" color={log.source === 'BIOMETRIC' ? 'primary' : 'default'} />
                                </TableCell>
                                <TableCell>{log.biometric_device_id || '-'}</TableCell>
                                <TableCell>{log.verification_mode}</TableCell>
                            </TableRow>
                        ))}
                        {logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No logs found for this date.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AttendanceLogs;
