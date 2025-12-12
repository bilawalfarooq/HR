import { Holiday } from '../models/index.js';
import logger from '../utils/logger.js';

export const getHolidays = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const holidays = await Holiday.findAll({
            where: { organization_id },
            order: [['date', 'ASC']]
        });
        res.status(200).json({ data: holidays });
    } catch (error) {
        logger.error('Error fetching holidays:', error);
        res.status(500).json({ message: 'Error fetching holidays', error: error.message });
    }
};

export const createHoliday = async (req, res) => {
    try {
        const { name, date, description, is_recurring } = req.body;
        const organization_id = req.user.organization_id;

        const holiday = await Holiday.create({
            organization_id,
            name,
            date,
            description,
            is_recurring
        });

        res.status(201).json({ message: 'Holiday created', data: holiday });
    } catch (error) {
        logger.error('Error creating holiday:', error);
        res.status(500).json({ message: 'Error creating holiday', error: error.message });
    }
};

export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const organization_id = req.user.organization_id;

        const holiday = await Holiday.findOne({ where: { id, organization_id } });
        if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

        await holiday.destroy();
        res.status(200).json({ message: 'Holiday deleted' });
    } catch (error) {
        logger.error('Error deleting holiday:', error);
        res.status(500).json({ message: 'Error deleting holiday', error: error.message });
    }
};
