import { Organization } from '../models/index.js';
import { AppError } from './errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Middleware to enforce multi-tenant isolation
 * Ensures all queries are scoped to the user's organization
 */
export const multiTenant = async (req, res, next) => {
    try {
        // If user is authenticated, use their organization_id
        if (req.user && req.organizationId) {
            // Verify organization is active
            const organization = await Organization.findOne({
                where: {
                    organization_id: req.organizationId,
                    subscription_status: ['active', 'trial']
                }
            });

            if (!organization) {
                throw new AppError('Organization not found or subscription inactive', 403);
            }

            // Attach organization to request
            req.organization = organization;

            logger.debug(`Multi-tenant: Request scoped to organization ${organization.organization_name} (ID: ${organization.organization_id})`);

            return next();
        }

        // For public endpoints (like registration), check subdomain or header
        const subdomain = req.headers['x-organization-subdomain'] || req.query.subdomain;

        if (subdomain) {
            const organization = await Organization.findOne({
                where: { subdomain }
            });

            if (!organization) {
                throw new AppError('Organization not found', 404);
            }

            req.organizationId = organization.organization_id;
            req.organization = organization;

            return next();
        }

        // If no organization context, continue (for super admin endpoints)
        next();

    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to ensure data belongs to user's organization
 * Use this in routes that access specific resources
 */
export const ensureOrganizationAccess = (resourceOrgIdField = 'organization_id') => {
    return (req, res, next) => {
        if (!req.organizationId) {
            return next(new AppError('Organization context required', 400));
        }

        // This will be used in controllers to filter queries
        req.orgFilter = {
            [resourceOrgIdField]: req.organizationId
        };

        next();
    };
};

/**
 * Middleware to check organization subscription status
 * @param {...String} allowedStatuses - Allowed subscription statuses
 */
export const checkSubscription = (...allowedStatuses) => {
    return async (req, res, next) => {
        if (!req.organizationId) {
            return next(new AppError('Organization context required', 400));
        }

        const organization = await Organization.findByPk(req.organizationId);

        if (!organization) {
            return next(new AppError('Organization not found', 404));
        }

        if (!allowedStatuses.includes(organization.subscription_status)) {
            logger.warn(`Subscription check failed for organization ${organization.organization_id}: ${organization.subscription_status}`);
            return next(new AppError('Subscription inactive or expired', 403));
        }

        // Check if subscription has expired
        if (organization.subscription_expires_at && new Date() > organization.subscription_expires_at) {
            return next(new AppError('Subscription expired', 403));
        }

        next();
    };
};

/**
 * Middleware for super admin only endpoints
 * These endpoints can access data across all organizations
 */
export const superAdminOnly = (req, res, next) => {
    if (!req.user || req.user.role.role_type !== 'super_admin') {
        return next(new AppError('Super admin access required', 403));
    }
    next();
};

export default {
    multiTenant,
    ensureOrganizationAccess,
    checkSubscription,
    superAdminOnly
};
