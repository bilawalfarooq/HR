import { sequelize, Organization, User, Role, Employee } from '../models/index.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { sendEmail } from '../services/emailService.js';

/**
 * Register a new organization and admin user
 */
export const registerOrganization = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            organization_name,
            subdomain,
            contact_email,
            contact_phone,
            address,
            admin_first_name,
            admin_last_name,
            admin_email,
            admin_password,
            admin_phone
        } = req.body;

        // Check if subdomain already exists
        const existingOrg = await Organization.findOne({ where: { subdomain } });
        if (existingOrg) {
            throw new AppError('Subdomain already taken', 409);
        }

        // Create Organization
        const organization = await Organization.create({
            organization_name,
            subdomain,
            contact_email,
            contact_phone,
            address,
            subscription_plan: 'trial',
            subscription_status: 'trial',
            subscription_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
        }, { transaction });

        // Create Default Roles for this Organization
        const rolesData = [
            { organization_id: organization.organization_id, role_name: 'Super Admin', role_type: 'super_admin', permissions: { all: true } },
            { organization_id: organization.organization_id, role_name: 'HR Manager', role_type: 'admin', permissions: { attendance: 'all', employees: 'all', payroll: 'all', timesheets: 'all' } },
            { organization_id: organization.organization_id, role_name: 'Team Lead', role_type: 'team_lead', permissions: { attendance: 'team', timesheets: 'team', leave: 'team' } },
            { organization_id: organization.organization_id, role_name: 'Employee', role_type: 'employee', permissions: { attendance: 'self', timesheets: 'self', leave: 'self' } }
        ];

        const createdRoles = await Role.bulkCreate(rolesData, { transaction });
        const adminRole = createdRoles.find(r => r.role_type === 'admin'); // Assign HR Manager role initially (or super_admin if SaaS owner)

        // For SaaS, the first user is usually the Admin of that organization
        // Let's assign 'admin' role type (HR Manager) as the primary admin for the org
        // If this was the SaaS platform owner, they would be 'super_admin'

        // Create Admin User
        const user = await User.create({
            organization_id: organization.organization_id,
            email: admin_email,
            password_hash: admin_password, // Will be hashed by hook
            first_name: admin_first_name,
            last_name: admin_last_name,
            phone: admin_phone,
            role_id: adminRole.role_id,
            is_active: true,
            email_verified: false
        }, { transaction });

        // Create Employee record for the admin
        await Employee.create({
            organization_id: organization.organization_id,
            user_id: user.user_id,
            employee_code: 'ADMIN-001',
            first_name: admin_first_name,
            last_name: admin_last_name,
            date_of_joining: new Date(),
            employment_type: 'full_time',
            status: 'active'
        }, { transaction });

        await transaction.commit();

        // Generate tokens
        const tokens = generateTokens(user);

        res.status(201).json({
            success: true,
            message: 'Organization registered successfully',
            data: {
                organization: {
                    id: organization.organization_id,
                    name: organization.organization_name,
                    subdomain: organization.subdomain
                },
                user: {
                    id: user.user_id,
                    email: user.email,
                    role: adminRole.role_name
                },
                tokens
            }
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
    try {
        const { email, password, organization_subdomain } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        // Find organization if subdomain provided
        let organizationId = null;
        if (organization_subdomain) {
            const org = await Organization.findOne({ where: { subdomain: organization_subdomain } });
            if (!org) {
                throw new AppError('Organization not found', 404);
            }
            organizationId = org.organization_id;
        }

        // Find user
        const query = { email, is_active: true };
        if (organizationId) {
            query.organization_id = organizationId;
        }

        const user = await User.findOne({
            where: query,
            include: [
                { model: Role, as: 'role' },
                { model: Organization, as: 'organization' }
            ]
        });

        if (!user) {
            logger.warn(`Login attempt failed: User not found - ${email} (org: ${organization_subdomain || 'any'})`);
            throw new AppError('Invalid email or password', 401);
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger.warn(`Login attempt failed: Invalid password - ${email} (user_id: ${user.user_id})`);
            throw new AppError('Invalid email or password', 401);
        }

        // Check organization status
        if (user.organization.subscription_status === 'suspended' || user.organization.subscription_status === 'cancelled') {
            throw new AppError('Organization account is suspended or cancelled', 403);
        }

        // Update last login
        await user.update({ last_login_at: new Date() });

        // Generate tokens
        const tokens = generateTokens(user);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.user_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role.role_name,
                    role_type: user.role.role_type,
                    permissions: user.role.permissions
                },
                organization: {
                    id: user.organization.organization_id,
                    name: user.organization.organization_name,
                    subdomain: user.organization.subdomain
                },
                tokens
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Refresh token required', 400);
        }

        // Verify token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findOne({
            where: { user_id: decoded.user_id, is_active: true }
        });

        if (!user) {
            throw new AppError('User not found or inactive', 401);
        }

        // Generate new access token
        const tokens = generateTokens(user);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: tokens.accessToken
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * Optimized to reuse user from auth middleware and only fetch missing associations
 */
export const getMe = async (req, res, next) => {
    try {
        // User is already loaded by authenticate middleware with Role
        const user = req.user;

        // Fetch additional associations only if not already loaded
        // Use a single optimized query to get all needed associations
        if (!user.organization || !user.employee) {
            const includes = [
                { model: Role, as: 'role' } // Preserve existing Role association
            ];
            
            if (!user.organization) {
                includes.push({ model: Organization, as: 'organization' });
            }
            if (!user.employee) {
                includes.push({ model: Employee, as: 'employee' });
            }

            // Reload with all needed associations in a single query
            await user.reload({ include: includes });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Change password
 */
export const changePassword = async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;
        const user = await User.findByPk(req.user.user_id);

        // Verify current password
        const isMatch = await user.comparePassword(current_password);
        if (!isMatch) {
            throw new AppError('Incorrect current password', 401);
        }

        // Update password
        user.password_hash = new_password; // Will be hashed by hook
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Check if subdomain is available
 */
export const checkSubdomainAvailability = async (req, res, next) => {
    try {
        const { subdomain } = req.params;

        const existingOrg = await Organization.findOne({ where: { subdomain } });

        res.status(200).json({
            success: true,
            available: !existingOrg,
            message: existingOrg ? 'Subdomain is already taken' : 'Subdomain is available'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check if email is available
 */
export const checkEmailAvailability = async (req, res, next) => {
    try {
        const { email } = req.params;

        const existingUser = await User.findOne({ where: { email } });

        res.status(200).json({
            success: true,
            available: !existingUser,
            message: existingUser ? 'Email is already registered' : 'Email is available'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Forgot Password - Send reset link
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            // For security, don't reveal if user exists
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save token and expiration (1 hour)
        user.password_reset_token = resetTokenHash;
        user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        // Create reset URL
        // Assuming frontend runs on port 5173 or configured URL
        const resetUrl = `${req.protocol}://${req.get('host').replace('5000', '5173')}/reset-password/${resetToken}`;

        const message = `
            You are receiving this email because you (or someone else) have requested the reset of the password for your account.
            Please make a PUT request to: \n\n ${resetUrl} \n\n
            If you did not request this, please ignore this email and your password will remain unchanged.
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                text: message,
                html: `<p>You requested a password reset.</p><p>Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
            });

            res.status(200).json({
                success: true,
                message: 'Token sent to email!'
            });
        } catch (error) {
            user.password_reset_token = null;
            user.password_reset_expires = null;
            await user.save();

            throw new AppError('There was an error sending the email. Try again later!', 500);
        }

    } catch (error) {
        next(error);
    }
};

/**
 * Reset Password - Update password with token
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { new_password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                password_reset_token: hashedToken,
                password_reset_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            throw new AppError('Token is invalid or has expired', 400);
        }

        // Set new password
        user.password_hash = new_password; // Hook will hash it
        user.password_reset_token = null;
        user.password_reset_expires = null;
        await user.save();

        // Log user in immediately (optional, but good UX)
        const tokens = generateTokens(user);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            data: {
                tokens
            }
        });

    } catch (error) {
        next(error);
    }
};

export default {
    registerOrganization,
    login,
    refreshToken,
    getMe,
    changePassword,
    checkSubdomainAvailability,
    checkEmailAvailability,
    forgotPassword,
    resetPassword
};
