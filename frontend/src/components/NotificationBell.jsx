import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Popover,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Divider,
    Chip
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/employeeService';
import { showError } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getNotifications({ limit: 10 });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            // Silently fail for notification polling
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            try {
                await markNotificationAsRead(notification.notification_id);
                setNotifications(prev =>
                    prev.map(n =>
                        n.notification_id === notification.notification_id
                            ? { ...n, is_read: true }
                            : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                showError('Failed to mark notification as read');
            }
        }

        if (notification.action_url) {
            navigate(notification.action_url);
        }
        handleClose();
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            showError('Failed to mark all as read');
        }
    };

    const open = Boolean(anchorEl);
    const id = open ? 'notification-popover' : undefined;

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ width: 360, maxHeight: 500, overflow: 'auto' }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Notifications</Typography>
                        {unreadCount > 0 && (
                            <Button size="small" onClick={handleMarkAllRead}>
                                Mark all read
                            </Button>
                        )}
                    </Box>
                    <Divider />
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography color="textSecondary">No notifications</Typography>
                        </Box>
                    ) : (
                        <List>
                            {notifications.map((notification) => (
                                <ListItem
                                    key={notification.notification_id}
                                    button
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        bgcolor: notification.is_read ? 'transparent' : 'action.selected',
                                        borderLeft: notification.is_read ? 'none' : '4px solid',
                                        borderColor: 'primary.main',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle2" fontWeight={notification.is_read ? 'normal' : 'bold'}>
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    label={notification.type.replace('_', ' ')}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textSecondary">
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default NotificationBell;

