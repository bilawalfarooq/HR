import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * Role-based route protection component
 * Redirects users to appropriate dashboard based on their role
 */
const RoleProtectedRoute = ({ children, allowedRoles = [], redirectTo = null }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = (user?.role_type ? user.role_type.replace('_', ' ') : '') ||
        (user?.role?.role_name ? user.role.role_name.toLowerCase() : '') ||
        (typeof user?.role === 'string' ? user.role.toLowerCase() : '');
    const isAdmin = userRole === 'admin' || userRole === 'hr' || userRole === 'super admin';
    const isEmployee = userRole === 'employee' || userRole === 'team lead';

    // If specific roles are required, check them
    if (allowedRoles.length > 0) {
        const hasAccess = allowedRoles.some(role => {
            if (role === 'admin' && isAdmin) return true;
            if (role === 'employee' && isEmployee) return true;
            if (role === 'super admin' && userRole === 'super admin') return true;
            if (role === 'all') return true;
            return false;
        });

        if (!hasAccess) {
            // Redirect based on user role
            if (userRole === 'super admin') {
                return <Navigate to="/super-admin/dashboard" replace />;
            } else if (isAdmin) {
                return <Navigate to="/admin/dashboard" replace />;
            } else {
                return <Navigate to="/employee/dashboard" replace />;
            }
        }
    }

    // If redirectTo is specified, use it
    if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default RoleProtectedRoute;



