import Resignation from '../models/Resignation.js';
import ExitInterview from '../models/ExitInterview.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Submit Resignation
export const submitResignation = async (req, res) => {
    try {
        const { reason, resignation_date, notice_period_start_date, last_working_day } = req.body;
        const employee_id = req.user.employee_id; // Assuming auth middleware adds user with employee_id
        const organization_id = req.user.organization_id;

        // Check if already resigned
        const existingResignation = await Resignation.findOne({
            where: {
                employee_id,
                status: ['pending', 'approved_by_manager', 'approved_by_hr']
            }
        });

        if (existingResignation) {
            return res.status(400).json({ message: 'You have already submitted a resignation request.' });
        }

        const resignation = await Resignation.create({
            organization_id,
            employee_id,
            reason,
            resignation_date,
            notice_period_start_date,
            last_working_day,
            status: 'pending'
        });

        // Notify Manager (Todo: logic to find manager)
        const employee = await Employee.findByPk(employee_id);
        if (employee && employee.manager_id) {
            const manager = await Employee.findByPk(employee.manager_id);
            if (manager && manager.user_id) {
                await Notification.create({
                    organization_id,
                    user_id: manager.user_id,
                    title: 'Resignation Submitted',
                    message: `Employee ${employee.employee_code} has submitted a resignation.`
                });
            }
        }

        res.status(201).json(resignation);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting resignation', error: error.message });
    }
};

// Update Resignation Status (Manager/HR)
export const updateResignationStatus = async (req, res) => {
    try {
        const { resignation_id } = req.params;
        const { status, comments } = req.body;
        const user_role = req.user.role.name; // Assuming role attached to req.user

        const resignation = await Resignation.findByPk(resignation_id);
        if (!resignation) {
            return res.status(404).json({ message: 'Resignation not found' });
        }

        // Logic for state transitions could be complex, keeping it simple
        if (user_role === 'Team Lead' || user_role === 'Manager') {
            if (status === 'approved_by_manager' || status === 'rejected_by_manager') {
                resignation.status = status;
                resignation.manager_comments = comments;
            } else {
                return res.status(403).json({ message: 'Manager can only approve or reject' });
            }
        } else if (user_role === 'HR' || user_role === 'Admin' || user_role === 'Super Admin') {
            resignation.status = status; // HR can set to anything, e.g., 'approved_by_hr', 'completed'
            resignation.hr_comments = comments;
        } else {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        await resignation.save();
        res.json(resignation);
    } catch (error) {
        res.status(500).json({ message: 'Error updating resignation', error: error.message });
    }
};

// Submit Exit Interview
export const submitExitInterview = async (req, res) => {
    try {
        const { resignation_id, feedback_on_management, feedback_on_company_culture, feedback_on_job_satisfaction, reasons_for_leaving, would_recommend, comments } = req.body;
        const user_id = req.user.user_id;
        const organization_id = req.user.organization_id;

        const resignation = await Resignation.findByPk(resignation_id);
        if (!resignation) {
            return res.status(404).json({ message: 'Resignation not found' });
        }

        const exitInterview = await ExitInterview.create({
            organization_id,
            resignation_id,
            conducted_by: user_id, // Or the employee themselves if self-service? Assuming interviewer for now or employee. Context implies "Exit Interviews" are usually conducted.
            feedback_on_management,
            feedback_on_company_culture,
            feedback_on_job_satisfaction,
            reasons_for_leaving,
            would_recommend,
            comments
        });

        resignation.is_exit_interview_completed = true;
        await resignation.save();

        res.status(201).json(exitInterview);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting exit interview', error: error.message });
    }
};

export const getResignations = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const { status } = req.query;

        const whereClause = { organization_id };
        if (status) whereClause.status = status;

        const resignations = await Resignation.findAll({
            where: whereClause,
            include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'employee_code'] }] // Add names if needed
        });
        res.json(resignations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resignations', error: error.message });
    }
};
