import { BiometricDevice, AttendanceLog, Employee } from '../models/index.js';
import logger from '../utils/logger.js';

export const registerDevice = async (req, res) => {
    try {
        const { name, serial_number, ip_address, location, port } = req.body;
        const organization_id = req.user.organization_id;

        const device = await BiometricDevice.create({
            organization_id,
            name,
            serial_number,
            ip_address,
            location,
            port
        });

        res.status(201).json({
            message: 'Device registered successfully',
            data: device
        });
    } catch (error) {
        logger.error('Error registering device:', error);
        res.status(500).json({ message: 'Error registering device', error: error.message });
    }
};

export const getDevices = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const devices = await BiometricDevice.findAll({
            where: { organization_id }
        });

        res.status(200).json({
            message: 'Devices retrieved successfully',
            data: devices
        });
    } catch (error) {
        logger.error('Error fetching devices:', error);
        res.status(500).json({ message: 'Error fetching devices', error: error.message });
    }
};

export const syncDeviceLogs = async (req, res) => {
    try {
        // This endpoint might be called by the device itself or a middleware service
        // We expect an array of logs
        const { serial_number, logs } = req.body;
        // logs: [{ user_id, timestamp, ... }]

        const device = await BiometricDevice.findOne({ where: { serial_number } });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        const organization_id = device.organization_id;
        let processedCount = 0;

        for (const log of logs) {
            // Find employee by user_id mapped in device (assuming employee_code or internal ID match)
            // Here we assume log.user_id matches Employee.id or Employee.employee_code
            // Let's assume matches Employee.id for simplicity if integer, or Employee.employee_code if string.
            // Adjust based on device config. For now, assume it sends employee_id (internal PK).

            const employee = await Employee.findOne({
                where: {
                    employee_id: log.user_id,
                    organization_id
                }
            });

            if (employee) {
                await AttendanceLog.create({
                    organization_id,
                    employee_id: employee.employee_id,
                    timestamp: log.timestamp,
                    source: 'BIOMETRIC',
                    biometric_device_id: device.id,
                    verification_mode: log.verification_mode || 'FINGERPRINT'
                });
                processedCount++;
            } else {
                // Log orphan record?
                logger.warn(`Device log skipped: User ID ${log.user_id} not found in org ${organization_id}`);
            }
        }

        // Update device last_sync
        await device.update({ last_sync: new Date() });

        res.status(200).json({
            message: 'Logs synced successfully',
            processed: processedCount
        });

    } catch (error) {
        logger.error('Error syncing logs:', error);
        res.status(500).json({ message: 'Error syncing logs', error: error.message });
    }
};
