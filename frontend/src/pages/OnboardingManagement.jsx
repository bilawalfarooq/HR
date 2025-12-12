import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, FormControlLabel, Checkbox
} from '@mui/material';
import Layout from '../components/Layout';
import { createOnboardingTask, assignTasksToEmployee } from '../services/onboardingService';

const OnboardingManagement = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', is_mandatory: true });
    // This page ideally lists tasks and allows creating new ones.
    // For simplicity, I'll just put the "Create Task" button and maybe a list placeholder.

    const handleCreateTask = async () => {
        try {
            await createOnboardingTask(newTask);
            setOpenDialog(false);
            setNewTask({ title: '', description: '', is_mandatory: true });
            alert("Task Created");
        } catch (error) {
            alert("Error creating task");
        }
    };

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4">Onboarding Configuration</Typography>
                    <Button variant="contained" onClick={() => setOpenDialog(true)}>Add New Task</Button>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="body1" color="textSecondary">
                        Manage global onboarding tasks here. These will be assigned to new employees automatically or manually.
                    </Typography>
                    {/* List of tasks would go here */}
                </Paper>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>New Onboarding Task</DialogTitle>
                    <DialogContent sx={{ minWidth: 400, mt: 1 }}>
                        <TextField
                            label="Task Title"
                            fullWidth
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            sx={{ mb: 2, mt: 1 }}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={newTask.is_mandatory} onChange={(e) => setNewTask({ ...newTask, is_mandatory: e.target.checked })} />}
                            label="Mandatory"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateTask} variant="contained">Create</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default OnboardingManagement;
