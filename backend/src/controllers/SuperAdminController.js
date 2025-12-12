import { sequelize, Organization, User, Employee, Subscription, SubscriptionPlan, AttendanceRecord, LeaveRequest, Timesheet, Payroll } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';

/**
 * Get super admin dashboard
 */
export const getSuperAdminDashboard = async (req, res, next) => {
    try {
        // Total companies
        const totalCompanies = await Organization.count();

        // Active companies (with active subscriptions)
        const activeCompanies = await Organization.count({
            include: [{
                model: Subscription,
                as: 'subscription',
                where: {
                    status: 'ACTIVE'
                },
                required: true
            }]
        });

        // Total employees across all companies
        const totalEmployees = await Employee.count({
            where: { status: 'active' }
        });

        // Total users
        const totalUsers = await User.count();

        // Subscription statistics
        const subscriptionStats = await Subscription.findAll({
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('subscription_id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Recent companies (last 10)
        const recentCompanies = await Organization.findAll({
            include: [{
                model: Subscription,
                as: 'subscription',
                include: [{
                    model: SubscriptionPlan,
                    as: 'plan',
                    attributes: ['plan_name', 'max_employees']
                }]
            }],
            order: [['created_at', 'DESC']],
            limit: 10,
            attributes: ['organization_id', 'organization_name', 'subdomain', 'created_at']
        });

        // Monthly revenue (if applicable)
        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthlyRevenue = await Subscription.sum('amount', {
            where: {
                status: 'ACTIVE',
                created_at: { [Op.gte]: startOfMonth }
            }
        });

        // Usage statistics
        const usageStats = {
            total_attendance_records: await AttendanceRecord.count(),
            total_leave_requests: await LeaveRequest.count(),
            total_timesheets: await Timesheet.count(),
            total_payrolls: await Payroll.count()
        };

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    total_companies: totalCompanies,
                    active_companies: activeCompanies,
                    total_employees: totalEmployees,
                    total_users: totalUsers,
                    monthly_revenue: parseFloat(monthlyRevenue || 0)
                },
                subscriptions: subscriptionStats.reduce((acc, stat) => {
                    acc[stat.status] = parseInt(stat.count);
                    return acc;
                }, {}),
                recent_companies: recentCompanies,
                usage: usageStats
            }
        });
    } catch (error) {
        logger.error('Error fetching super admin dashboard:', error);
        next(error);
    }
};

/**
 * Get all companies
 */
export const getAllCompanies = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) {
            where.subscription_status = status;
        }
        if (search) {
            where[Op.or] = [
                { organization_name: { [Op.like]: `%${search}%` } },
                { subdomain: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Organization.findAndCountAll({
            where,
            include: [{
                model: Subscription,
                as: 'subscription',
                include: [{
                    model: SubscriptionPlan,
                    as: 'plan',
                    attributes: ['plan_name', 'max_employees', 'price_per_month']
                }],
                required: false
            }, {
                model: Employee,
                as: 'employees',
                attributes: ['employee_id'],
                required: false
            }],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            attributes: ['organization_id', 'organization_name', 'subdomain', 'subscription_status', 'created_at']
        });

        // Add employee count to each company
        const companiesWithCounts = await Promise.all(
            rows.map(async (org) => {
                const employeeCount = await Employee.count({
                    where: { organization_id: org.organization_id, status: 'active' }
                });
                return {
                    ...org.toJSON(),
                    employee_count: employeeCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                companies: companiesWithCounts,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching companies:', error);
        next(error);
    }
};

/**
 * Get company details
 */
export const getCompanyDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const organization = await Organization.findByPk(id, {
            include: [{
                model: Subscription,
                as: 'subscription',
                include: [{
                    model: SubscriptionPlan,
                    as: 'plan'
                }]
            }]
        });

        if (!organization) {
            return next(new AppError('Company not found', 404));
        }

        // Get company statistics
        const stats = {
            total_employees: await Employee.count({
                where: { organization_id: id, status: 'active' }
            }),
            total_departments: await Department.count({
                where: { organization_id: id }
            }),
            total_users: await User.count({
                where: { organization_id: id }
            })
        };

        res.status(200).json({
            success: true,
            data: {
                organization,
                statistics: stats
            }
        });
    } catch (error) {
        logger.error('Error fetching company details:', error);
        next(error);
    }
};

/**
 * Update company status
 */
export const updateCompanyStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const organization = await Organization.findByPk(id);

        if (!organization) {
            return next(new AppError('Company not found', 404));
        }

        await organization.update({ subscription_status: status });

        res.status(200).json({
            success: true,
            message: 'Company status updated successfully',
            data: organization
        });
    } catch (error) {
        logger.error('Error updating company status:', error);
        next(error);
    }
};

/**
 * Get all subscription plans
 */
export const getSubscriptionPlans = async (req, res, next) => {
    try {
        const plans = await SubscriptionPlan.findAll({
            where: { is_active: true },
            order: [['price_per_month', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (error) {
        logger.error('Error fetching subscription plans:', error);
        next(error);
    }
};

/**
 * Create subscription plan
 */
export const createSubscriptionPlan = async (req, res, next) => {
    try {
        const {
            plan_name,
            description,
            max_employees,
            max_storage_gb,
            price_per_month,
            price_per_year,
            features
        } = req.body;

        const plan = await SubscriptionPlan.create({
            plan_name,
            description,
            max_employees,
            max_storage_gb: max_storage_gb || 10,
            price_per_month,
            price_per_year,
            features: features || []
        });

        res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: plan
        });
    } catch (error) {
        logger.error('Error creating subscription plan:', error);
        next(error);
    }
};

/**
 * Update subscription plan
 */
export const updateSubscriptionPlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const plan = await SubscriptionPlan.findByPk(id);

        if (!plan) {
            return next(new AppError('Subscription plan not found', 404));
        }

        await plan.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: plan
        });
    } catch (error) {
        logger.error('Error updating subscription plan:', error);
        next(error);
    }
};

/**
 * Assign subscription to company
 */
export const assignSubscription = async (req, res, next) => {
    try {
        const { organization_id, plan_id, billing_cycle, start_date } = req.body;

        const organization = await Organization.findByPk(organization_id);
        if (!organization) {
            return next(new AppError('Company not found', 404));
        }

        const plan = await SubscriptionPlan.findByPk(plan_id);
        if (!plan) {
            return next(new AppError('Subscription plan not found', 404));
        }

        // Check if subscription already exists
        let subscription = await Subscription.findOne({
            where: { organization_id }
        });

        const amount = billing_cycle === 'YEARLY' ? plan.price_per_year : plan.price_per_month;
        const endDate = new Date(start_date);
        if (billing_cycle === 'YEARLY') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        if (subscription) {
            await subscription.update({
                plan_id,
                billing_cycle,
                status: 'ACTIVE',
                start_date,
                end_date: endDate,
                next_billing_date: endDate,
                amount
            });
        } else {
            subscription = await Subscription.create({
                organization_id,
                plan_id,
                billing_cycle,
                status: 'ACTIVE',
                start_date: start_date || new Date(),
                end_date: endDate,
                next_billing_date: endDate,
                amount
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription assigned successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Error assigning subscription:', error);
        next(error);
    }
};

/**
 * Get all subscriptions
 */
export const getAllSubscriptions = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Subscription.findAndCountAll({
            where,
            include: [
                {
                    model: Organization,
                    as: 'organization',
                    attributes: ['organization_id', 'organization_name', 'subdomain']
                },
                {
                    model: SubscriptionPlan,
                    as: 'plan',
                    attributes: ['plan_name', 'max_employees', 'price_per_month', 'price_per_year']
                }
            ],
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: {
                subscriptions: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching subscriptions:', error);
        next(error);
    }
};

export default {
    getSuperAdminDashboard,
    getAllCompanies,
    getCompanyDetails,
    updateCompanyStatus,
    getSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    assignSubscription,
    getAllSubscriptions
};

