import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem
} from '@mui/material';
import Layout from '../components/Layout';
import { getResignations, updateResignationStatus } from '../services/resignationService';

const ResignationManagement = () => {
    const [resignations, setResignations] = useState([]);
    const [selectedResignation, setSelectedResignation] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [action, setAction] = useState({ status: '', comments: '' });

    useEffect(() => {
        fetchResignations();
    }, []);

    const fetchResignations = async () => {
        try {
            const data = await getResignations();
            setResignations(data);
        } catch (error) {
            console.error("Error", error);
        }
    };

    const handleActionClick = (resignation) => {
        setSelectedResignation(resignation);
        setOpenDialog(true);
    };

    const handleSubmitAction = async () => {
        try {
            await updateResignationStatus(selectedResignation.resignation_id, action);
            setOpenDialog(false);
            fetchResignations();
        } catch (error) {
            alert("Error updating status");
        }
    };

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>Resignation Management</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Last Working Day</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {resignations.map((row) => (
                                <TableRow key={row.resignation_id}>
                                    <TableCell>{row.employee?.employee_code}</TableCell>
                                    <TableCell>{new Date(row.resignation_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(row.last_working_day).toLocaleDateString()}</TableCell>
                                    <TableCell>{row.reason}</TableCell>
                                    <TableCell>
                                        <Chip label={row.status} color={row.status === 'pending' ? 'warning' : 'default'} />
                                    </TableCell>
                                    <TableCell>
                                        <Button size="small" variant="outlined" onClick={() => handleActionClick(row)}>Manage</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>Update Resignation Status</DialogTitle>
                    <DialogContent sx={{ minWidth: 400, mt: 1 }}>
                        <TextField
                            select
                            label="Action"
                            fullWidth
                            value={action.status}
                            onChange={(e) => setAction({ ...action, status: e.target.value })}
                            sx={{ mb: 2, mt: 1 }}
                        >
                            <MenuItem value="approved_by_manager">Approve (Manager)</MenuItem>
                            <MenuItem value="rejected_by_manager">Reject (Manager)</MenuItem>
                            <MenuItem value="approved_by_hr">Approve (HR)</MenuItem>
                            <MenuItem value="completed">Mark as Completed</MenuItem>
                        </TextField>
                        <TextField
                            label="Comments"
                            fullWidth
                            multiline
                            rows={3}
                            value={action.comments}
                            onChange={(e) => setAction({ ...action, comments: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmitAction} variant="contained">Update</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default ResignationManagement;
