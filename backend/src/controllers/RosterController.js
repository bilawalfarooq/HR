import { EmployeeSchedule, Employee, User, Shift } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export const getRoster = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const { start_date, end_date } = req.query;

        // Get schedules
        const schedules = await EmployeeSchedule.findAll({
            where: {
                organization_id,
                date: { [Op.between]: [start_date, end_date] }
            },
            include: [
                { model: Employee, as: 'employee', include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }] },
                { model: Shift, as: 'shift' }
            ]
        });

        res.status(200).json({ data: schedules });
    } catch (error) {
        logger.error('Error fetching roster:', error);
        res.status(500).json({ message: 'Error fetching roster', error: error.message });
    }
};

export const assignShift = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const { employee_id, shift_id, date, is_rest_day } = req.body;

        // Using upsert
        const [schedule, created] = await EmployeeSchedule.upsert({
            organization_id,
            employee_id,
            shift_id: is_rest_day ? null : shift_id,
            date,
            is_rest_day
        }); // Note: upsert returns array [instance, boolean] in Postgres, but simple object/boolean depends on dialect. 
        // Sequelize upsert returns [instance, created] for MySQL usually.

        res.status(200).json({ message: 'Shift assigned', data: schedule });

    } catch (error) {
        logger.error('Error assigning shift:', error);
        res.status(500).json({ message: 'Error assigning shift', error: error.message });
    }
};

export const bulkAssignShift = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const { employee_ids, shift_id, start_date, end_date, days_of_week } = req.body;
        // days_of_week: [0, 1, 2, 3, 4] for Mon-Fri (0=Sun?) NO, JS Date 0=Sun.

        const start = new Date(start_date);
        const end = new Date(end_date);
        let current = new Date(start);

        const assignments = [];

        while (current <= end) {
            const day = current.getDay();
            if (days_of_week.includes(day)) {
                for (const empId of employee_ids) {
                    assignments.push({
                        organization_id,
                        employee_id: empId,
                        shift_id,
                        date: current.toISOString().split('T')[0],
                        is_rest_day: false
                    });
                }
            }
            current.setDate(current.getDate() + 1);
        }

        // Use bulkCreate with updateOnDuplicate
        await EmployeeSchedule.bulkCreate(assignments, {
            updateOnDuplicate: ['shift_id', 'is_rest_day', 'updated_at']
        });

        res.status(200).json({ message: `Assigned ${assignments.length} shifts successfully` });

    } catch (error) {
        logger.error('Error bulk assigning shifts:', error);
        res.status(500).json({ message: 'Error assigning shifts', error: error.message });
    }
};
