import { verifyAccessToken } from '../utils/jwt.js';
import { User, Role } from '../models/index.js';
import { AppError } from './errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate JWT token
 * Provides distinct error messages for different authentication failures
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required. Please provide a valid token.', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        let decoded;
        try {
            decoded = verifyAccessToken(token);
        } catch (jwtError) {
            // Handle specific JWT errors with distinct messages
            if (jwtError.name === 'TokenExpiredError') {
                throw new AppError('Your session has expired. Please log in again.', 401);
            } else if (jwtError.name === 'JsonWebTokenError') {
                throw new AppError('Invalid authentication token. Please log in again.', 401);
            } else if (jwtError.name === 'NotBeforeError') {
                throw new AppError('Token not yet active.', 401);
            } else {
                throw new AppError('Authentication failed. Please log in again.', 401);
            }
        }

        // Get user from database
        const user = await User.findOne({
            where: {
                user_id: decoded.user_id,
                is_active: true
            },
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['role_id', 'role_name', 'role_type', 'permissions']
                }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            throw new AppError('User account not found or has been deactivated. Please contact support.', 401);
        }

        // Attach user to request
        req.user = user;
        req.userId = user.user_id;
        req.organizationId = user.organization_id;
        req.roleType = user.role.role_type;

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to check if user has required role
 * @param {...String} allowedRoles - Allowed role types
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }

        const userRoleType = req.user.role.role_type;

        if (!allowedRoles.includes(userRoleType)) {
            logger.warn(`Unauthorized access attempt by user ${req.user.user_id} with role ${userRoleType}`);
            return next(new AppError('You do not have permission to access this resource.', 403));
        }

        next();
    };
};

/**
 * Middleware to check specific permissions
 * @param {String} resource - Resource name (e.g., 'attendance', 'payroll')
 * @param {String} action - Action name (e.g., 'create', 'read', 'update', 'delete')
 */
export const checkPermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }

        let permissions = req.user.role.permissions || {};

        // Ensure permissions is an object
        if (typeof permissions === 'string') {
            try {
                permissions = JSON.parse(permissions);
            } catch (e) {
                logger.error('Failed to parse permissions JSON', e);
                permissions = {};
            }
        }

        // Super admin has all permissions
        if (req.user.role.role_type === 'super_admin') {
            return next();
        }

        // Check if user has permission for this resource and action
        if (permissions[resource] && permissions[resource].includes(action)) {
            return next();
        }

        // Check for wildcard permissions
        if (permissions[resource] === 'all' || permissions.all === true) {
            return next();
        }

        logger.warn(`Permission denied for user ${req.user.user_id}: ${resource}.${action}`);
        return next(new AppError(`You do not have permission to ${action} ${resource}.`, 403));
    };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated vs non-authenticated users
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        const user = await User.findOne({
            where: {
                user_id: decoded.user_id,
                is_active: true
            },
            include: [
                {
                    model: Role,
                    as: 'role'
                }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        if (user) {
            req.user = user;
            req.userId = user.user_id;
            req.organizationId = user.organization_id;
            req.roleType = user.role.role_type;
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

export default {
    authenticate,
    authorize,
    checkPermission,
    optionalAuth
};
