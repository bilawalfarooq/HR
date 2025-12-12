import { Notification, User, Employee } from '../models/index.js';
import { sendEmail } from './emailService.js';
import logger from '../utils/logger.js';

/**
 * Create and send notification
 */
export const createNotification = async (organizationId, userId, type, title, message, relatedEntityType = null, relatedEntityId = null, actionUrl = null) => {
    try {
        const notification = await Notification.create({
            organization_id: organizationId,
            user_id: userId,
            type,
            title,
            message,
            related_entity_type: relatedEntityType,
            related_entity_id: relatedEntityId,
            action_url: actionUrl
        });

        // Send email notification
        const user = await User.findByPk(userId, {
            include: [{
                model: Employee,
                as: 'employee',
                required: false
            }]
        });

        if (user && user.email) {
            try {
                await sendEmail({
                    to: user.email,
                    subject: title,
                    html: `
                        <h2>${title}</h2>
                        <p>${message}</p>
                        ${actionUrl ? `<p><a href="${actionUrl}">View Details</a></p>` : ''}
                    `
                });
            } catch (emailError) {
                logger.error('Error sending notification email:', emailError);
                // Don't fail notification creation if email fails
            }
        }

        return notification;
    } catch (error) {
        logger.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Notify leave approval
 */
export const notifyLeaveApproval = async (leaveRequest, approver) => {
    const employee = await Employee.findByPk(leaveRequest.employee_id, {
        include: [{ model: User, as: 'user' }]
    });

    if (employee && employee.user) {
        await createNotification(
            leaveRequest.organization_id,
            employee.user.user_id,
            'LEAVE_APPROVAL',
            'Leave Request Approved',
            `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been approved by ${approver.first_name} ${approver.last_name}.`,
            'leave_request',
            leaveRequest.leave_request_id,
            `/leaves/${leaveRequest.leave_request_id}`
        );
    }
};

/**
 * Notify leave rejection
 */
export const notifyLeaveRejection = async (leaveRequest, approver, reason) => {
    const employee = await Employee.findByPk(leaveRequest.employee_id, {
        include: [{ model: User, as: 'user' }]
    });

    if (employee && employee.user) {
        await createNotification(
            leaveRequest.organization_id,
            employee.user.user_id,
            'LEAVE_REJECTED',
            'Leave Request Rejected',
            `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been rejected by ${approver.first_name} ${approver.last_name}.${reason ? ` Reason: ${reason}` : ''}`,
            'leave_request',
            leaveRequest.leave_request_id,
            `/leaves/${leaveRequest.leave_request_id}`
        );
    }
};

/**
 * Notify timesheet approval
 */
export const notifyTimesheetApproval = async (timesheet, approver) => {
    const employee = await Employee.findByPk(timesheet.employee_id, {
        include: [{ model: User, as: 'user' }]
    });

    if (employee && employee.user) {
        await createNotification(
            timesheet.organization_id,
            employee.user.user_id,
            'TIMESHEET_APPROVAL',
            'Timesheet Approved',
            `Your timesheet for week ${timesheet.week_start_date} to ${timesheet.week_end_date} has been approved by ${approver.first_name} ${approver.last_name}.`,
            'timesheet',
            timesheet.timesheet_id,
            `/timesheets/${timesheet.timesheet_id}`
        );
    }
};

/**
 * Notify timesheet rejection
 */
export const notifyTimesheetRejection = async (timesheet, approver, reason) => {
    const employee = await Employee.findByPk(timesheet.employee_id, {
        include: [{ model: User, as: 'user' }]
    });

    if (employee && employee.user) {
        await createNotification(
            timesheet.organization_id,
            employee.user.user_id,
            'TIMESHEET_REJECTED',
            'Timesheet Rejected',
            `Your timesheet for week ${timesheet.week_start_date} to ${timesheet.week_end_date} has been rejected by ${approver.first_name} ${approver.last_name}.${reason ? ` Reason: ${reason}` : ''}`,
            'timesheet',
            timesheet.timesheet_id,
            `/timesheets/${timesheet.timesheet_id}`
        );
    }
};

/**
 * Notify payroll processed
 */
export const notifyPayrollProcessed = async (payroll) => {
    const employee = await Employee.findByPk(payroll.employee_id, {
        include: [{ model: User, as: 'user' }]
    });

    if (employee && employee.user) {
        await createNotification(
            payroll.organization_id,
            employee.user.user_id,
            'PAYROLL_PROCESSED',
            'Payroll Processed',
            `Your payroll for ${payroll.month}/${payroll.year} has been processed. Net Salary: ₹${payroll.net_salary.toFixed(2)}`,
            'payroll',
            payroll.payroll_id,
            `/payroll/${payroll.payroll_id}`
        );
    }
};

/**
 * Notify payslip generated
 */
export const notifyPayslipGenerated = async (payslip) => {
    const employee = await Employee.findByPk(payslip.employee_id, {
        include: [{ model: User, as: 'user' }]
    });

    if (employee && employee.user) {
        await createNotification(
            payslip.organization_id,
            employee.user.user_id,
            'PAYSLIP_GENERATED',
            'Payslip Generated',
            `Your payslip for ${payslip.month}/${payslip.year} has been generated and is available for download.`,
            'payslip',
            payslip.payslip_id,
            `/payroll/payslip/${payslip.payslip_id}`
        );
    }
};

/**
 * Notify low leave balance
 */
export const notifyLowLeaveBalance = async (employee, leaveType, availableBalance) => {
    const employeeRecord = await Employee.findByPk(employee.employee_id, {
        include: [{ model: User, as: 'user' }]
    });

    if (employeeRecord && employeeRecord.user) {
        await createNotification(
            employee.organization_id,
            employeeRecord.user.user_id,
            'LEAVE_BALANCE_LOW',
            'Low Leave Balance',
            `Your ${leaveType.leave_type_name} balance is low. Available: ${availableBalance} days.`,
            'leave_balance',
            null,
            '/leaves/balance'
        );
    }
};

export default {
    createNotification,
    notifyLeaveApproval,
    notifyLeaveRejection,
    notifyTimesheetApproval,
    notifyTimesheetRejection,
    notifyPayrollProcessed,
    notifyPayslipGenerated,
    notifyLowLeaveBalance
};

