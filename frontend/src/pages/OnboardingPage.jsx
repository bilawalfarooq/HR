import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon,
    Checkbox, Chip, LinearProgress, Divider
} from '@mui/material';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getEmployeeOnboardingStatus, updateTaskStatus } from '../services/onboardingService';

const OnboardingPage = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (user?.employee_id) fetchTasks();
    }, [user]);

    const fetchTasks = async () => {
        try {
            const data = await getEmployeeOnboardingStatus(user.employee_id);
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks", error);
        }
    };

    const handleToggle = async (task) => {
        // Only allow toggling if pending, and maybe only if it's "self-verify" type? 
        // For now assume employee marks as "completed" then HR verifies.
        if (task.status !== 'pending' && task.status !== 'in_progress') return;

        try {
            await updateTaskStatus(task.employee_onboarding_id, { status: 'completed' });
            fetchTasks();
        } catch (error) {
            alert("Error updating task");
        }
    };

    const completedCount = tasks.filter(t => t.status === 'completed' || t.status === 'verified').length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return (
        <Layout>
            <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>Onboarding Checklist</Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Complete your onboarding tasks to get started.
                </Typography>

                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">Progress</Typography>
                        <Typography variant="h6">{Math.round(progress)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
                </Paper>

                <Paper>
                    <List>
                        {tasks.map((item, index) => (
                            <React.Fragment key={item.employee_onboarding_id}>
                                <ListItem
                                    secondaryAction={
                                        <Chip
                                            label={item.status}
                                            color={item.status === 'verified' ? 'success' : item.status === 'completed' ? 'info' : 'default'}
                                            size="small"
                                        />
                                    }
                                    disablePadding
                                    sx={{ p: 2 }}
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={item.status === 'completed' || item.status === 'verified'}
                                            onChange={() => handleToggle(item)}
                                            disabled={item.status === 'verified'}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.task.title}
                                        secondary={item.task.description}
                                        sx={{ textDecoration: (item.status === 'completed' || item.status === 'verified') ? 'line-through' : 'none' }}
                                    />
                                </ListItem>
                                {index < tasks.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Layout>
    );
};

export default OnboardingPage;
