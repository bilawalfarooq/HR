import { Notification, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

/**
 * Get user notifications
 */
export const getNotifications = async (req, res, next) => {
    try {
        const { user } = req;
        const { is_read, limit = 50, offset = 0 } = req.query;

        const where = {
            user_id: user.user_id,
            organization_id: user.organization_id
        };

        if (is_read !== undefined) {
            where.is_read = is_read === 'true';
        }

        const notifications = await Notification.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: {
                notifications: notifications.rows,
                total: notifications.count,
                unread_count: await Notification.count({
                    where: {
                        user_id: user.user_id,
                        organization_id: user.organization_id,
                        is_read: false
                    }
                })
            }
        });
    } catch (error) {
        logger.error('Error fetching notifications:', error);
        next(error);
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user } = req;

        const notification = await Notification.findOne({
            where: {
                notification_id: id,
                user_id: user.user_id
            }
        });

        if (!notification) {
            return next(new AppError('Notification not found.', 404));
        }

        notification.is_read = true;
        notification.read_at = new Date();
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read.',
            data: notification
        });
    } catch (error) {
        logger.error('Error marking notification as read:', error);
        next(error);
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        const { user } = req;

        await Notification.update(
            {
                is_read: true,
                read_at: new Date()
            },
            {
                where: {
                    user_id: user.user_id,
                    organization_id: user.organization_id,
                    is_read: false
                }
            }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read.'
        });
    } catch (error) {
        logger.error('Error marking all notifications as read:', error);
        next(error);
    }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user } = req;

        const notification = await Notification.findOne({
            where: {
                notification_id: id,
                user_id: user.user_id
            }
        });

        if (!notification) {
            return next(new AppError('Notification not found.', 404));
        }

        await notification.destroy();

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully.'
        });
    } catch (error) {
        logger.error('Error deleting notification:', error);
        next(error);
    }
};

export default {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};

