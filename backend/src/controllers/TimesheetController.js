import { sequelize, Timesheet, TimesheetEntry, Employee, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import { notifyTimesheetApproval, notifyTimesheetRejection } from '../services/notificationService.js';

/**
 * Get my timesheets (Employee)
 */
export const getMyTimesheets = async (req, res, next) => {
    try {
        // Get employee_id
        let employee_id;
        if (req.user.employee?.employee_id) {
            employee_id = req.user.employee.employee_id;
        } else {
            const employee = await Employee.findOne({
                where: { user_id: req.user.user_id, organization_id: req.user.organization_id }
            });
            if (!employee) {
                throw new AppError('Employee profile not found', 404);
            }
            employee_id = employee.employee_id;
        }

        const { status, start_date, end_date } = req.query;

        const whereClause = {
            employee_id,
            organization_id: req.user.organization_id
        };

        if (status) whereClause.status = status;
        if (start_date && end_date) {
            whereClause.week_start_date = { [Op.gte]: start_date };
            whereClause.week_end_date = { [Op.lte]: end_date };
        }

        const timesheets = await Timesheet.findAll({
            where: whereClause,
            include: [
                {
                    model: TimesheetEntry,
                    as: 'entries',
                    order: [['date', 'ASC']]
                }
            ],
            order: [['week_start_date', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: timesheets
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get timesheet by ID
 */
export const getTimesheetById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const timesheet = await Timesheet.findOne({
            where: {
                timesheet_id: id,
                organization_id: req.user.organization_id
            },
            include: [
                {
                    model: TimesheetEntry,
                    as: 'entries',
                    order: [['date', 'ASC']]
                },
                {
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
                }
            ]
        });

        if (!timesheet) {
            throw new AppError('Timesheet not found', 404);
        }

        res.status(200).json({
            success: true,
            data: timesheet
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create or update timesheet
 */
export const createOrUpdateTimesheet = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Get employee_id
        let employee_id;
        if (req.user.employee?.employee_id) {
            employee_id = req.user.employee.employee_id;
        } else {
            const employee = await Employee.findOne({
                where: { user_id: req.user.user_id, organization_id: req.user.organization_id }
            });
            if (!employee) {
                throw new AppError('Employee profile not found', 404);
            }
            employee_id = employee.employee_id;
        }

        const { week_start_date, week_end_date, entries } = req.body;

        // Calculate total hours
        const totalHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);

        // Find or create timesheet
        const [timesheet, created] = await Timesheet.findOrCreate({
            where: {
                employee_id,
                organization_id: req.user.organization_id,
                week_start_date,
                week_end_date
            },
            defaults: {
                employee_id,
                organization_id: req.user.organization_id,
                week_start_date,
                week_end_date,
                total_hours: totalHours,
                status: 'DRAFT'
            },
            transaction
        });

        if (!created) {
            // Update existing timesheet
            await timesheet.update({
                total_hours: totalHours,
                status: 'DRAFT'
            }, { transaction });
        }

        // Delete existing entries
        await TimesheetEntry.destroy({
            where: { timesheet_id: timesheet.timesheet_id },
            transaction
        });

        // Create new entries
        const timesheetEntries = await TimesheetEntry.bulkCreate(
            entries.map(entry => ({
                timesheet_id: timesheet.timesheet_id,
                date: entry.date,
                task_name: entry.task_name,
                hours: entry.hours,
                description: entry.description
            })),
            { transaction }
        );

        await transaction.commit();

        // Reload with entries
        await timesheet.reload({
            include: [{ model: TimesheetEntry, as: 'entries' }]
        });

        res.status(created ? 201 : 200).json({
            success: true,
            message: created ? 'Timesheet created successfully' : 'Timesheet updated successfully',
            data: timesheet
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Submit timesheet for approval
 */
export const submitTimesheet = async (req, res, next) => {
    try {
        const { id } = req.params;

        const timesheet = await Timesheet.findOne({
            where: {
                timesheet_id: id,
                organization_id: req.user.organization_id
            }
        });

        if (!timesheet) {
            throw new AppError('Timesheet not found', 404);
        }

        if (timesheet.status !== 'DRAFT') {
            throw new AppError('Timesheet can only be submitted from DRAFT status', 400);
        }

        await timesheet.update({ status: 'SUBMITTED' });

        res.status(200).json({
            success: true,
            message: 'Timesheet submitted for approval',
            data: timesheet
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve or reject timesheet (Manager/Admin)
 */
export const approveTimesheet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            throw new AppError('Invalid status. Must be APPROVED or REJECTED', 400);
        }

        // Get approver employee_id
        let approver_id;
        if (req.user.employee?.employee_id) {
            approver_id = req.user.employee.employee_id;
        } else {
            const employee = await Employee.findOne({
                where: { user_id: req.user.user_id, organization_id: req.user.organization_id }
            });
            if (employee) {
                approver_id = employee.employee_id;
            }
        }

        const timesheet = await Timesheet.findOne({
            where: {
                timesheet_id: id,
                organization_id: req.user.organization_id
            }
        });

        if (!timesheet) {
            throw new AppError('Timesheet not found', 404);
        }

        if (timesheet.status !== 'SUBMITTED') {
            throw new AppError('Timesheet must be in SUBMITTED status', 400);
        }

        await timesheet.update({
            status,
            approved_by: approver_id,
            rejection_reason: status === 'REJECTED' ? rejection_reason : null
        });

        // Send notification
        try {
            if (status === 'APPROVED') {
                await notifyTimesheetApproval(timesheet, req.user);
            } else if (status === 'REJECTED') {
                await notifyTimesheetRejection(timesheet, req.user, rejection_reason);
            }
        } catch (notifError) {
            logger.error('Error sending timesheet notification:', notifError);
        }

        res.status(200).json({
            success: true,
            message: `Timesheet ${status.toLowerCase()}`,
            data: timesheet
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get pending timesheets for approval (Manager/Admin)
 */
export const getPendingTimesheets = async (req, res, next) => {
    try {
        const timesheets = await Timesheet.findAll({
            where: {
                organization_id: req.user.organization_id,
                status: 'SUBMITTED'
            },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
                },
                {
                    model: TimesheetEntry,
                    as: 'entries'
                }
            ],
            order: [['week_start_date', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: timesheets
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getMyTimesheets,
    getTimesheetById,
    createOrUpdateTimesheet,
    submitTimesheet,
    approveTimesheet,
    getPendingTimesheets
};

