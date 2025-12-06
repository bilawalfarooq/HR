import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Welcome, {user?.first_name} {user?.last_name}!
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Role: {user?.role?.role_name}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Organization: {user?.organization?.organization_name}
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <Button variant="contained" color="secondary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Dashboard;
