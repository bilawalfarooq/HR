import Joi from 'joi';

/**
 * Validation schemas for authentication
 */

// Register organization schema
export const registerOrganizationSchema = Joi.object({
    organization_name: Joi.string().min(2).max(255).required(),
    subdomain: Joi.string().min(3).max(50).pattern(/^[a-z0-9-]+$/).required()
        .messages({
            'string.pattern.base': 'Subdomain must contain only lowercase letters, numbers, and hyphens'
        }),
    contact_email: Joi.string().email().required(),
    contact_phone: Joi.string().min(10).max(20).required(),
    address: Joi.string().min(5).max(500).required(),
    admin_first_name: Joi.string().min(2).max(100).required(),
    admin_last_name: Joi.string().min(2).max(100).required(),
    admin_email: Joi.string().email().required(),
    admin_password: Joi.string().min(8).max(100).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }),
    admin_phone: Joi.string().min(10).max(20).allow('', null).optional()
});

// Login schema
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    organization_subdomain: Joi.string().allow('', null).optional()
});

// Refresh token schema
export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

// Change password schema
export const changePasswordSchema = Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).max(100).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        })
});

// Forgot password schema
export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    organization_subdomain: Joi.string().allow('', null).optional()
});

// Reset password schema
export const resetPasswordSchema = Joi.object({
    new_password: Joi.string().min(8).max(100).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        })
});

export default {
    registerOrganizationSchema,
    loginSchema,
    refreshTokenSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};
