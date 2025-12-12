import { Shift, Organization } from '../models/index.js';
import logger from '../utils/logger.js';

export const createShift = async (req, res) => {
    try {
        const { name, startTime, endTime, lateBuffer, earlyExitBuffer, overtimeRule } = req.body;
        const organization_id = req.user.organization_id;

        const shift = await Shift.create({
            organization_id,
            name,
            startTime,
            endTime,
            lateBuffer,
            earlyExitBuffer,
            overtimeRule
        });

        res.status(201).json({
            message: 'Shift created successfully',
            data: shift
        });
    } catch (error) {
        logger.error('Error creating shift:', error);
        res.status(500).json({ message: 'Error creating shift', error: error.message });
    }
};

export const getShifts = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const shifts = await Shift.findAll({
            where: { organization_id },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: 'Shifts retrieved successfully',
            data: shifts
        });
    } catch (error) {
        logger.error('Error fetching shifts:', error);
        res.status(500).json({ message: 'Error fetching shifts', error: error.message });
    }
};

export const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const organization_id = req.user.organization_id;
        const updates = req.body;

        const shift = await Shift.findOne({ where: { id, organization_id } });
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        await shift.update(updates);

        res.status(200).json({
            message: 'Shift updated successfully',
            data: shift
        });
    } catch (error) {
        logger.error('Error updating shift:', error);
        res.status(500).json({ message: 'Error updating shift', error: error.message });
    }
};

export const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        const organization_id = req.user.organization_id;

        const shift = await Shift.findOne({ where: { id, organization_id } });
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        await shift.destroy();

        res.status(200).json({ message: 'Shift deleted successfully' });
    } catch (error) {
        logger.error('Error deleting shift:', error);
        res.status(500).json({ message: 'Error deleting shift', error: error.message });
    }
};
