import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 * - Logs all errors with full details server-side
 * - Returns user-friendly messages to clients
 * - Never exposes stack traces or technical details in production
 */
export const errorHandler = (err, req, res, next) => {
    // ALWAYS log full error details server-side (for all environments)
    logger.error('Error occurred:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        statusCode: err.statusCode,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        body: process.env.NODE_ENV === 'development' ? req.body : undefined, // Don't log sensitive data in production
        headers: process.env.NODE_ENV === 'development' ? req.headers : undefined,
        isOperational: err.isOperational
    });

    // Default error status and message
    let statusCode = err.statusCode || 500;
    let userMessage = err.message || 'Internal Server Error';

    // User-friendly messages for common errors
    const errorMessagesMap = {
        // Database errors
        'SequelizeUniqueConstraintError': 'This record already exists. Please use different values.',
        'SequelizeForeignKeyConstraintError': 'Cannot perform this operation due to related records.',
        'SequelizeValidationError': 'Invalid data provided. Please check your input.',
        'SequelizeDatabaseError': 'A database error occurred. Please try again later.',
        'SequelizeConnectionError': 'Unable to connect to the database. Please try again later.',

        // JWT errors
        'JsonWebTokenError': 'Invalid authentication token. Please login again.',
        'TokenExpiredError': 'Your session has expired. Please login again.',
        'NotBeforeError': 'Token not active yet.',

        // Validation errors
        'ValidationError': 'Invalid request. Please check your input.',
        'CastError': 'Invalid data format provided.',

        // HTTP errors
        'BadRequestError': 'Invalid request.',
        'UnauthorizedError': 'Authentication required.',
        'ForbiddenError': 'You do not have permission to perform this action.',
        'NotFoundError': 'The requested resource was not found.',
        'ConflictError': 'A conflict occurred. Please try again.',

        // Network errors
        'TimeoutError': 'The request took too long. Please try again.',
        'NetworkError': 'A network error occurred. Please check your connection.'
    };

    // For non-operational errors or unknown errors
    if (!err.isOperational) {
        // Check if we have a user-friendly message for this error type
        if (errorMessagesMap[err.name]) {
            userMessage = errorMessagesMap[err.name];
        } else {
            // For completely unknown errors, use generic message
            if (statusCode === 500) {
                userMessage = 'Something went wrong. Please try again later.';
            } else if (statusCode >= 400 && statusCode < 500) {
                userMessage = 'Invalid request. Please check your input and try again.';
            } else {
                userMessage = 'An error occurred. Please try again later.';
            }
        }
    }

    // Prepare response object
    const errorResponse = {
        success: false,
        message: userMessage,
        errors: err.errors || []
    };

    // ONLY in development mode, add technical details for debugging
    // NEVER send these in production
    if (process.env.NODE_ENV === 'development') {
        errorResponse.debug = {
            originalMessage: err.message,
            errorName: err.name,
            stack: err.stack,
            statusCode: statusCode
        };
    }

    // Send response
    res.status(statusCode).json(errorResponse);
};

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true; // Mark as operational/expected error

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
