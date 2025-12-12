import OnboardingTask from '../models/OnboardingTask.js';
import EmployeeOnboarding from '../models/EmployeeOnboarding.js';
import Employee from '../models/Employee.js';

// Create a new task definition
export const createOnboardingTask = async (req, res) => {
    try {
        const { title, description, required_for_department_id, assigned_by_role, is_mandatory } = req.body;
        const organization_id = req.user.organization_id;

        const task = await OnboardingTask.create({
            organization_id,
            title,
            description,
            required_for_department_id,
            assigned_by_role,
            is_mandatory
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

// Assign tasks to an employee (triggered when hired or manually)
export const assignTasksToEmployee = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const organization_id = req.user.organization_id;

        const employee = await Employee.findByPk(employee_id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Find applicable tasks
        const tasks = await OnboardingTask.findAll({
            where: {
                organization_id,
                // Logic: Global tasks (dept_id null) OR tasks for this employee's department
                required_for_department_id: [null, employee.department_id]
            }
        });

        const assignments = [];
        for (const task of tasks) {
            // Check if already assigned
            const existing = await EmployeeOnboarding.findOne({
                where: { employee_id, task_id: task.task_id }
            });
            if (!existing) {
                assignments.push({
                    organization_id,
                    employee_id,
                    task_id: task.task_id,
                    status: 'pending'
                });
            }
        }

        await EmployeeOnboarding.bulkCreate(assignments);
        res.json({ message: `Assigned ${assignments.length} tasks to employee` });

    } catch (error) {
        res.status(500).json({ message: 'Error assigning tasks', error: error.message });
    }
};

// Get Employee Progress
export const getEmployeeOnboardingStatus = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const organization_id = req.user.organization_id;

        const progress = await EmployeeOnboarding.findAll({
            where: { employee_id, organization_id },
            include: [{ model: OnboardingTask, as: 'task' }]
        });
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress', error: error.message });
    }
};

// Update Task Status
export const updateTaskStatus = async (req, res) => {
    try {
        const { employee_onboarding_id } = req.params;
        const { status, remarks } = req.body;

        const record = await EmployeeOnboarding.findByPk(employee_onboarding_id);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        record.status = status;
        if (status === 'completed') record.completed_at = new Date();
        if (status === 'verified') record.verified_by = req.user.user_id; // HR verifies

        record.remarks = remarks;
        await record.save();

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};
