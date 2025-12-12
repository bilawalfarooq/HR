import { sequelize, Employee, User, AttendanceRecord, LeaveRequest, Timesheet, Payroll, Payslip, LeaveBalance, LeaveType, Document, Notification } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';

/**
 * Get employee dashboard data
 */
export const getDashboard = async (req, res, next) => {
    try {
        const { user } = req;
        const { organization_id } = user;

        let employee = user.employee;

        if (!employee) {
            employee = await Employee.findOne({
                where: { user_id: user.user_id }
            });
        }

        if (!employee) {
            // If user is Admin/Super Admin, they might not have an employee profile. 
            // We can return a specific code or empty data, but 404 is technically correct for "Employee Dashboard".
            return next(new AppError('Employee profile not found.', 404));
        }

        const employeeId = employee.employee_id;
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        // Get attendance summary
        const attendanceSummary = await AttendanceRecord.findAll({
            where: {
                employee_id: employeeId,
                date: {
                    [Op.gte]: startOfMonth
                }
            },
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_days'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END")), 'present_days'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END")), 'absent_days'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'LATE' THEN 1 ELSE 0 END")), 'late_days']
            ],
            raw: true
        });

        // Get leave balance
        const leaveBalances = await LeaveBalance.findAll({
            where: { employee_id: employeeId },
            include: [{
                model: LeaveType,
                as: 'leaveType',
                attributes: ['id', 'name', 'days_allowed'] // Adjusted to match LeaveType model
            }],
            attributes: ['id', 'total', 'used', 'pending'] // Adjusted to match LeaveBalance model
        });

        // Get pending leave requests
        const pendingLeaves = await LeaveRequest.count({
            where: {
                employee_id: employeeId,
                status: 'PENDING'
            }
        });

        // Get recent timesheets
        const recentTimesheets = await Timesheet.findAll({
            where: {
                employee_id: employeeId
            },
            order: [['week_start_date', 'DESC']],
            limit: 5,
            attributes: ['timesheet_id', 'week_start_date', 'week_end_date', 'total_hours', 'status']
        });

        // Get recent payroll
        const recentPayroll = await Payroll.findAll({
            where: {
                employee_id: employeeId
            },
            order: [['year', 'DESC'], ['month', 'DESC']],
            limit: 3,
            attributes: ['payroll_id', 'month', 'year', 'net_salary', 'payment_status']
        });

        // Get unread notifications count
        const unreadNotifications = await Notification.count({
            where: {
                user_id: user.user_id,
                is_read: false
            }
        });

        // Get recent notifications
        const recentNotifications = await Notification.findAll({
            where: {
                user_id: user.user_id
            },
            order: [['created_at', 'DESC']],
            limit: 5,
            attributes: ['notification_id', 'type', 'title', 'message', 'is_read', 'created_at', 'action_url']
        });

        res.status(200).json({
            success: true,
            data: {
                attendance: {
                    total_days: parseInt(attendanceSummary[0]?.total_days || 0),
                    present_days: parseInt(attendanceSummary[0]?.present_days || 0),
                    absent_days: parseInt(attendanceSummary[0]?.absent_days || 0),
                    late_days: parseInt(attendanceSummary[0]?.late_days || 0)
                },
                leave_balances: leaveBalances,
                pending_leaves: pendingLeaves,
                recent_timesheets: recentTimesheets,
                recent_payroll: recentPayroll,
                notifications: {
                    unread_count: unreadNotifications,
                    recent: recentNotifications
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching employee dashboard:', error);
        next(error);
    }
};

export default {
    getDashboard
};

