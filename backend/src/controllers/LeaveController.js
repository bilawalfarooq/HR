import { LeaveType, LeaveRequest, LeaveBalance, Employee, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import { notifyLeaveApproval, notifyLeaveRejection } from '../services/notificationService.js';

// --- Leave Types ---
export const createLeaveType = async (req, res) => {
    try {
        const { name, days_allowed, description } = req.body;
        const organization_id = req.user.organization_id;

        const leaveType = await LeaveType.create({
            organization_id,
            name,
            days_allowed,
            description
        });

        res.status(201).json({ message: 'Leave type created', data: leaveType });
    } catch (error) {
        logger.error('Error creating leave type:', error);
        res.status(500).json({ message: 'Error creating leave type', error: error.message });
    }
};

export const getLeaveTypes = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const types = await LeaveType.findAll({ where: { organization_id, is_active: true } });
        res.status(200).json({ data: types });
    } catch (error) {
        logger.error('Error fetching leave types:', error);
        res.status(500).json({ message: 'Error fetching leave types', error: error.message });
    }
};

// --- Leave Requests ---
export const requestLeave = async (req, res) => {
    try {
        const { leave_type_id, start_date, end_date, reason } = req.body;
        
        // Get employee_id - fetch employee if not already loaded
        let employee_id;
        if (req.user.employee?.employee_id) {
            employee_id = req.user.employee.employee_id;
        } else {
            const employee = await Employee.findOne({
                where: { user_id: req.user.user_id, organization_id: req.user.organization_id }
            });
            if (!employee) {
                return res.status(404).json({ message: 'Employee profile not found' });
            }
            employee_id = employee.employee_id;
        }
        
        const organization_id = req.user.organization_id;

        // Calculate days (simple logic, excluding weekends/holidays would be better)
        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffTime = Math.abs(end - start);
        const days_count = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Check balance
        const balance = await LeaveBalance.findOne({
            where: { employee_id, leave_type_id, year: new Date().getFullYear() }
        });

        // If balance exists validation (Optional: some policies allow negative balance)
        // For now, allow leave requests even if balance is insufficient (pending approval)
        if (balance && (balance.remaining < days_count)) {
            // Could add warning or validation here in the future
        }

        const request = await LeaveRequest.create({
            organization_id,
            employee_id,
            leave_type_id,
            start_date,
            end_date,
            days_count,
            reason,
            status: 'PENDING'
        });

        res.status(201).json({ message: 'Leave requested successfully', data: request });

    } catch (error) {
        logger.error('Error requesting leave:', error);
        res.status(500).json({ message: 'Error requesting leave', error: error.message });
    }
};

export const getMyLeaves = async (req, res) => {
    try {
        // Get employee_id - fetch employee if not already loaded
        let employee_id;
        if (req.user.employee?.employee_id) {
            employee_id = req.user.employee.employee_id;
        } else {
            const employee = await Employee.findOne({
                where: { user_id: req.user.user_id, organization_id: req.user.organization_id }
            });
            if (!employee) {
                return res.status(404).json({ message: 'Employee profile not found' });
            }
            employee_id = employee.employee_id;
        }

        const requests = await LeaveRequest.findAll({
            where: { employee_id },
            include: [{ model: LeaveType, as: 'leaveType' }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ data: requests });
    } catch (error) {
        logger.error('Error fetching my leaves:', error);
        res.status(500).json({ message: 'Error fetching leaves', error: error.message });
    }
};

export const getPendingLeaves = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        // Ideally filter by manager's team
        const requests = await LeaveRequest.findAll({
            where: { organization_id, status: 'PENDING' },
            include: [
                { model: Employee, as: 'employee', include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }] },
                { model: LeaveType, as: 'leaveType' }
            ]
        });
        res.status(200).json({ data: requests });
    } catch (error) {
        logger.error('Error fetching pending leaves:', error);
        res.status(500).json({ message: 'Error fetching pending leaves', error: error.message });
    }
};

export const approveLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body; // APPROVED or REJECTED
        
        // Get employee_id - fetch employee if not already loaded
        let approver_id;
        if (req.user.employee?.employee_id) {
            approver_id = req.user.employee.employee_id;
        } else {
            const employee = await Employee.findOne({
                where: { user_id: req.user.user_id, organization_id: req.user.organization_id }
            });
            if (!employee) {
                return res.status(404).json({ message: 'Employee profile not found' });
            }
            approver_id = employee.employee_id;
        }

        const request = await LeaveRequest.findByPk(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        await request.update({
            status,
            rejection_reason,
            approved_by: approver_id
        });

        // Update balance if approved
        if (status === 'APPROVED') {
            const year = new Date(request.start_date).getFullYear();
            const balance = await LeaveBalance.findOne({
                where: { employee_id: request.employee_id, leave_type_id: request.leave_type_id, year }
            });

            if (balance) {
                // Determine new used/remaining (simplified)
                // In real app, consider if 'pending' logic reserved it
                await balance.increment('used', { by: request.days_count });
            } else {
                // Create balance entry if missing?
                // For now, ignore.
            }

            // Send approval notification
            try {
                await notifyLeaveApproval(request, req.user);
            } catch (notifError) {
                logger.error('Error sending leave approval notification:', notifError);
            }
        } else if (status === 'REJECTED') {
            // Send rejection notification
            try {
                await notifyLeaveRejection(request, req.user, rejection_reason);
            } catch (notifError) {
                logger.error('Error sending leave rejection notification:', notifError);
            }
        }

        res.status(200).json({ message: `Leave ${status}`, data: request });

    } catch (error) {
        logger.error('Error approving leave:', error);
        res.status(500).json({ message: 'Error approving leave', error: error.message });
    }
};

// --- Balance ---
export const getMyBalance = async (req, res) => {
    try {
        // Get employee_id - fetch employee if not already loaded
        let employee_id;
        if (req.user.employee?.employee_id) {
            employee_id = req.user.employee.employee_id;
        } else {
            const employee = await Employee.findOne({
                where: { user_id: req.user.user_id, organization_id: req.user.organization_id }
            });
            if (!employee) {
                return res.status(404).json({ message: 'Employee profile not found' });
            }
            employee_id = employee.employee_id;
        }
        
        const year = new Date().getFullYear();
        const balances = await LeaveBalance.findAll({
            where: { employee_id, year },
            include: [{ model: LeaveType, as: 'leaveType' }]
        });
        res.status(200).json({ data: balances });
    } catch (error) {
        logger.error('Error fetching balance:', error);
        res.status(500).json({ message: 'Error fetching balance', error: error.message });
    }
};
