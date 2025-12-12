import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Logout,
    Person,
    Description,
    Notifications as NotificationsIcon,
    AccountCircle,
    AccessTime,
    Event,
    Work,
    AttachMoney,
    Settings,
    Business,
    CalendarMonth,
    Schedule,
    AdminPanelSettings,
    ExitToApp,
    AssignmentInd,
    Inventory,
    MoneyOff
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const drawerWidth = 240;

const Layout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Show loading state while auth is being checked
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get user role to show appropriate menu items
    const userRole = (user?.role_type ? user.role_type.replace('_', ' ') : '') ||
        (user?.role?.role_name ? user.role.role_name.toLowerCase() : '') ||
        (typeof user?.role === 'string' ? user.role.toLowerCase() : '');
    const isAdmin = userRole === 'admin' || userRole === 'hr' || userRole === 'super admin';
    const isEmployee = userRole === 'employee' || userRole === 'team lead';

    // Safety check - if user is not loaded, show minimal UI
    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    // Define role-based color schemes
    const getRoleColors = () => {
        if (userRole === 'super admin') {
            return {
                primary: '#dc2626', // Red
                secondary: '#f97316', // Orange
                gradient: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
            };
        } else if (isAdmin) {
            return {
                primary: '#2563eb', // Blue
                secondary: '#7c3aed', // Purple
                gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            };
        } else {
            return {
                primary: '#059669', // Green
                secondary: '#0d9488', // Teal
                gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
            };
        }
    };

    const roleColors = getRoleColors();

    const menuItems = [
        // Main Dashboard - different for each role
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['all'] },
        // Employee-specific items
        { text: 'Employee Dashboard', icon: <Person />, path: '/employee/dashboard', roles: ['employee', 'team lead'] },
        { text: 'My Profile', icon: <AccountCircle />, path: '/employee/profile', roles: ['all'] },
        { text: 'Documents', icon: <Description />, path: '/employee/documents', roles: ['employee', 'team lead'] },
        // Attendance - different paths for employees vs admins
        { text: 'My Attendance', icon: <AccessTime />, path: '/employee/dashboard', roles: ['employee', 'team lead'] },
        { text: 'Attendance Dashboard', icon: <AccessTime />, path: '/attendance/dashboard', roles: ['admin', 'hr', 'super admin'] },
        { text: 'Attendance Logs', icon: <Schedule />, path: '/attendance/logs', roles: ['admin', 'hr', 'super admin'] },
        { text: 'Shifts', icon: <Work />, path: '/attendance/shifts', roles: ['admin', 'hr', 'super admin'] },
        // Common items
        { text: 'Leaves', icon: <Event />, path: '/leaves', roles: ['all'] },
        { text: 'Holidays', icon: <CalendarMonth />, path: '/holidays', roles: ['all'] },
        { text: 'Roster', icon: <Schedule />, path: '/roster', roles: ['all'] },
        { text: 'Timesheets', icon: <Description />, path: '/timesheets', roles: ['all'] },
        { text: 'Payroll', icon: <AttachMoney />, path: '/payroll', roles: ['all'] },
        // Admin items
        { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin/dashboard', roles: ['admin', 'hr', 'super admin'] },
        { text: 'Super Admin', icon: <Business />, path: '/super-admin/dashboard', roles: ['super admin'] },
        { text: 'Geo Fences', icon: <Settings />, path: '/geo-fences', roles: ['admin', 'hr', 'super admin'] },

        // Phase 11 & 12 Items
        { text: 'Onboarding', icon: <AssignmentInd />, path: '/onboarding', roles: ['employee', 'team lead'] },
        { text: 'Onboarding Admin', icon: <AssignmentInd />, path: '/onboarding/manage', roles: ['admin', 'hr', 'super admin'] },
        { text: 'Resignation', icon: <ExitToApp />, path: '/resignation', roles: ['employee', 'team lead'] },
        { text: 'Resignations List', icon: <ExitToApp />, path: '/resignations/manage', roles: ['admin', 'hr', 'super admin', 'manager'] },
        { text: 'Assets', icon: <Inventory />, path: '/assets', roles: ['all'] }, // Simplified access for now
        { text: 'FnF Settlement', icon: <MoneyOff />, path: '/payroll/fnf', roles: ['admin', 'hr', 'super admin'] },
    ].filter(item => {
        if (item.roles.includes('all')) return true;
        if (isAdmin && (item.roles.includes('admin') || item.roles.includes('hr'))) return true;
        if (isEmployee && (item.roles.includes('employee') || item.roles.includes('team lead'))) return true;
        if (userRole === 'super admin' && item.roles.includes('super admin')) return true;
        return false;
    });

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar
                sx={{
                    background: roleColors.gradient,
                    color: 'white',
                    minHeight: '64px !important',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business sx={{ fontSize: 28 }} />
                    <Typography variant="h6" noWrap component="div" fontWeight="bold">
                        HRMS
                    </Typography>
                </Box>
            </Toolbar>
            <Divider />
            <List sx={{ flexGrow: 1, pt: 1 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                        onClick={() => {
                            navigate(item.path);
                            setMobileOpen(false);
                        }}
                        sx={{
                            transition: 'all 0.2s ease-in-out',
                            '&.Mui-selected': {
                                backgroundColor: `${roleColors.primary}15`,
                                borderLeft: '4px solid',
                                borderColor: roleColors.primary,
                                '& .MuiListItemIcon-root': {
                                    color: roleColors.primary,
                                },
                                '& .MuiListItemText-primary': {
                                    fontWeight: 600,
                                    color: roleColors.primary,
                                },
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                color: location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                                    ? roleColors.primary
                                    : 'inherit',
                                minWidth: 40,
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontSize: '0.95rem',
                                fontWeight: location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                                    ? 600
                                    : 400,
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: roleColors.primary }}>
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            {user?.first_name} {user?.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {user?.role?.role_name}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                elevation={1}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar sx={{ minHeight: '64px !important' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            fontSize: '1.25rem',
                        }}
                    >
                        {menuItems.find(item => item.path === location.pathname || location.pathname.startsWith(item.path + '/'))?.text || 'HR Management System'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationBell />
                        <IconButton
                            onClick={handleMenuOpen}
                            size="small"
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: roleColors.primary,
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                }}
                            >
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </Avatar>
                        </IconButton>
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => { navigate('/employee/profile'); handleMenuClose(); }}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Profile</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            position: 'fixed',
                            height: '100vh',
                            overflowY: 'auto',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    backgroundColor: 'background.default',
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;

