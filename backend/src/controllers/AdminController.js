import { Employee, User, AttendanceRecord, LeaveRequest, Timesheet, Payroll, Department, Shift, LeaveType, Holiday, Organization } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';

/**
 * Get admin dashboard statistics
 */
export const getAdminDashboard = async (req, res, next) => {
    try {
        const { organization_id } = req.user;

        // Total employees
        const totalEmployees = await Employee.count({
            where: { organization_id, status: 'active' }
        });

        // Total departments
        const totalDepartments = await Department.count({
            where: { organization_id }
        });

        // Today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAttendance = await AttendanceRecord.count({
            where: {
                organization_id,
                date: today,
                status: 'PRESENT'
            }
        });

        // Pending leave requests
        const pendingLeaves = await LeaveRequest.count({
            where: {
                organization_id,
                status: 'PENDING'
            }
        });

        // Pending timesheet approvals
        const pendingTimesheets = await Timesheet.count({
            where: {
                organization_id,
                status: 'SUBMITTED'
            }
        });

        // Monthly attendance summary
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyAttendance = await AttendanceRecord.findAll({
            where: {
                organization_id,
                date: { [Op.gte]: startOfMonth }
            },
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('attendance_record_id')), 'total_records'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END")), 'present_count'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END")), 'absent_count'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'LATE' THEN 1 ELSE 0 END")), 'late_count']
            ],
            raw: true
        });

        // Recent activities (last 10)
        const recentLeaves = await LeaveRequest.findAll({
            where: { organization_id },
            include: [{
                model: Employee,
                as: 'employee',
                include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
            }],
            order: [['created_at', 'DESC']],
            limit: 10,
            attributes: ['leave_request_id', 'start_date', 'end_date', 'status', 'created_at']
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    total_employees: totalEmployees,
                    total_departments: totalDepartments,
                    today_attendance: todayAttendance,
                    pending_leaves: pendingLeaves,
                    pending_timesheets: pendingTimesheets
                },
                monthly_attendance: {
                    total_records: parseInt(monthlyAttendance[0]?.total_records || 0),
                    present_count: parseInt(monthlyAttendance[0]?.present_count || 0),
                    absent_count: parseInt(monthlyAttendance[0]?.absent_count || 0),
                    late_count: parseInt(monthlyAttendance[0]?.late_count || 0)
                },
                recent_leaves: recentLeaves
            }
        });
    } catch (error) {
        logger.error('Error fetching admin dashboard:', error);
        next(error);
    }
};

/**
 * Get all employees (with filters)
 */
export const getAllEmployees = async (req, res, next) => {
    try {
        const { organization_id } = req.user;
        const { department_id, status, search, page = 1, limit = 20 } = req.query;

        const where = { organization_id };
        if (department_id) where.department_id = department_id;
        if (status) where.status = status;

        const include = [{
            model: User,
            as: 'user',
            attributes: ['user_id', 'email', 'first_name', 'last_name', 'phone']
        }, {
            model: Department,
            as: 'department',
            attributes: ['department_id', 'department_name']
        }];

        if (search) {
            include[0].where = {
                [Op.or]: [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Employee.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: {
                employees: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching employees:', error);
        next(error);
    }
};

/**
 * Get employee details
 */
export const getEmployeeDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organization_id } = req.user;

        const employee = await Employee.findOne({
            where: {
                employee_id: id,
                organization_id
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'email', 'first_name', 'last_name', 'phone', 'created_at']
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['department_id', 'department_name']
                }
            ]
        });

        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }

        // Get attendance summary
        const attendanceSummary = await AttendanceRecord.findAll({
            where: { employee_id: id },
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('attendance_record_id')), 'total_days'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END")), 'present_days'],
                [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END")), 'absent_days']
            ],
            raw: true
        });

        res.status(200).json({
            success: true,
            data: {
                employee,
                attendance_summary: {
                    total_days: parseInt(attendanceSummary[0]?.total_days || 0),
                    present_days: parseInt(attendanceSummary[0]?.present_days || 0),
                    absent_days: parseInt(attendanceSummary[0]?.absent_days || 0)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching employee details:', error);
        next(error);
    }
};

/**
 * Update employee status
 */
export const updateEmployeeStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, termination_date } = req.body;
        const { organization_id } = req.user;

        const employee = await Employee.findOne({
            where: {
                employee_id: id,
                organization_id
            }
        });

        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }

        await employee.update({
            status,
            ...(termination_date && { termination_date })
        });

        res.status(200).json({
            success: true,
            message: 'Employee status updated successfully',
            data: employee
        });
    } catch (error) {
        logger.error('Error updating employee status:', error);
        next(error);
    }
};

/**
 * Get all pending approvals
 */
export const getPendingApprovals = async (req, res, next) => {
    try {
        const { organization_id } = req.user;

        const [pendingLeaves, pendingTimesheets] = await Promise.all([
            LeaveRequest.findAll({
                where: {
                    organization_id,
                    status: 'PENDING'
                },
                include: [{
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
                }],
                order: [['created_at', 'DESC']]
            }),
            Timesheet.findAll({
                where: {
                    organization_id,
                    status: 'SUBMITTED'
                },
                include: [{
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
                }],
                order: [['created_at', 'DESC']]
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                pending_leaves: pendingLeaves,
                pending_timesheets: pendingTimesheets
            }
        });
    } catch (error) {
        logger.error('Error fetching pending approvals:', error);
        next(error);
    }
};

export default {
    getAdminDashboard,
    getAllEmployees,
    getEmployeeDetails,
    updateEmployeeStatus,
    getPendingApprovals
};

