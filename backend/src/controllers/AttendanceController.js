import { AttendanceRecord, AttendanceLog, Employee, Shift, sequelize, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Stats from AttendanceRecord
        const records = await AttendanceRecord.findAll({
            where: { organization_id, date }
        });

        const stats = {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            onLeave: 0
        };

        // Get total active employees
        const totalEmployees = await Employee.count({
            where: { organization_id, status: 'active' }
        });
        stats.total = totalEmployees;

        records.forEach(r => {
            if (r.status === 'PRESENT') stats.present++;
            if (r.status === 'LATE') { stats.present++; stats.late++; } // Late is also present usually
            if (r.status === 'ABSENT') stats.absent++;
            if (r.status === 'LEAVE') stats.onLeave++;
        });

        res.status(200).json({
            message: 'Stats retrieved',
            data: stats
        });

    } catch (error) {
        logger.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

export const getLogs = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const { date, employee_id } = req.query;

        const where = { organization_id };
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            where.timestamp = { [Op.gte]: start, [Op.lt]: end };
        }
        if (employee_id) where.employee_id = employee_id;

        const logs = await AttendanceLog.findAll({
            where,
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['employee_code'],
                include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
            }],
            order: [['timestamp', 'DESC']],
            limit: 100
        });

        res.status(200).json({
            message: 'Logs retrieved',
            data: logs
        });

    } catch (error) {
        logger.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
};

export const processDailyAttendance = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const date = req.body.date || new Date().toISOString().split('T')[0];

        // This is a simplified logic. Real logic needs to consider Shift start/end times.
        // 1. Get all employees
        const employees = await Employee.findAll({
            where: { organization_id, status: 'active' },
            include: [{ model: Shift, as: 'currentShift' }]
        });

        let processed = 0;

        for (const emp of employees) {
            // Find logs for this day
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const logs = await AttendanceLog.findAll({
                where: {
                    employee_id: emp.employee_id,
                    timestamp: { [Op.between]: [startOfDay, endOfDay] }
                },
                order: [['timestamp', 'ASC']]
            });

            if (logs.length > 0) {
                const firstLog = logs[0];
                const lastLog = logs[logs.length - 1];

                // Determine Check-in / Check-out
                const checkIn = firstLog.timestamp;
                let checkOut = null;
                if (logs.length > 1) {
                    checkOut = lastLog.timestamp;
                }

                // Determine status based on Shift
                let status = 'PRESENT';
                let lateDuration = 0;
                let overtimeDuration = 0;

                if (emp.currentShift) {
                    // Calculate late
                    const [sh, sm] = emp.currentShift.startTime.split(':');
                    const shiftStart = new Date(date);
                    shiftStart.setHours(parseInt(sh), parseInt(sm), 0);

                    // Add buffer
                    shiftStart.setMinutes(shiftStart.getMinutes() + emp.currentShift.lateBuffer);

                    if (checkIn > shiftStart) {
                        status = 'LATE';
                        lateDuration = Math.floor((checkIn - shiftStart) / 60000); // minutes
                    }

                    // Calculate Overtime
                    if (checkOut) {
                        const shiftEnd = new Date(date);
                        const [eh, em] = emp.currentShift.endTime.split(':');
                        shiftEnd.setHours(parseInt(eh), parseInt(em), 0);

                        if (checkOut > shiftEnd) {
                            // Simple overtime: time worked after shift end
                            const otMinutes = Math.floor((checkOut - shiftEnd) / 60000);
                            if (otMinutes > 0) {
                                overtimeDuration = otMinutes;
                            }
                        }
                    }
                }

                // Create/Update Record
                await AttendanceRecord.upsert({
                    organization_id,
                    employee_id: emp.employee_id,
                    shift_id: emp.current_shift_id,
                    date: date,
                    check_in_time: checkIn,
                    check_out_time: checkOut,
                    status,
                    late_duration: lateDuration,
                    overtime_duration: overtimeDuration
                });
                processed++;
            } else {
                // Mark Absent
                await AttendanceRecord.upsert({
                    organization_id,
                    employee_id: emp.employee_id,
                    shift_id: emp.current_shift_id,
                    date: date,
                    status: 'ABSENT'
                });
            }
        }

        res.status(200).json({
            message: 'Attendance processed',
            processed
        });

    } catch (error) {
        logger.error('Error processing attendance:', error);
        res.status(500).json({ message: 'Error processing attendance', error: error.message });
    }
};

export const mobileCheckIn = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;
        const user_id = req.user.user_id;
        const { 
            location_lat, 
            location_long, 
            verification_mode, 
            skip_geo_validation,
            device_os,
            device_type,
            device_key
        } = req.body;

        // Find employee
        const employee = await Employee.findOne({ where: { user_id, organization_id } });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        // Extract device information from request
        const { getDeviceInfo, getDeviceKey } = await import('../utils/deviceUtils.js');
        const deviceInfo = getDeviceInfo(req);
        
        // Use provided device details or extract from request
        const finalDeviceOs = device_os || deviceInfo.os;
        const finalDeviceType = device_type || deviceInfo.deviceType;
        const finalDeviceKey = getDeviceKey(req, device_key);
        const ipAddress = deviceInfo.ipAddress;
        const userAgent = deviceInfo.userAgent;

        // Validate geo-fence if location is provided and validation is not skipped
        // Use employee-specific geo-fence validation
        if (location_lat && location_long && !skip_geo_validation) {
            const { validateLocation } = await import('../services/geoFenceService.js');
            const validation = await validateLocation(
                organization_id, 
                location_lat, 
                location_long, 
                employee.employee_id // Pass employee_id for employee-specific validation
            );

            if (!validation.isValid) {
                return res.status(400).json({
                    message: 'Check-in location is outside allowed area',
                    error: validation.error,
                    data: {
                        location: {
                            latitude: location_lat,
                            longitude: location_long
                        },
                        nearest_fence: validation.nearestFence ? {
                            name: validation.nearestFence.name,
                            distance: validation.distance
                        } : null
                    }
                });
            }
        }

        // Create Log with comprehensive device details
        const log = await AttendanceLog.create({
            organization_id,
            employee_id: employee.employee_id,
            timestamp: new Date(),
            source: 'MOBILE',
            location_lat,
            location_long,
            verification_mode: verification_mode || 'GPS',
            device_os: finalDeviceOs,
            device_type: finalDeviceType,
            ip_address: ipAddress,
            device_key: finalDeviceKey,
            user_agent: userAgent
        });

        res.status(201).json({
            message: 'Check-in successful',
            data: log
        });

    } catch (error) {
        logger.error('Error mobile check-in:', error);
        res.status(500).json({ message: 'Error checking in', error: error.message });
    }
};

/**
 * Import attendance from Excel file
 */
export const importAttendance = async (req, res) => {
    try {
        const organization_id = req.user.organization_id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' });
        }

        const { parseAttendanceExcel, importAttendanceRecords } = await import('../services/excelImportService.js');

        // Parse Excel file
        const parsedData = await parseAttendanceExcel(req.file.buffer);

        if (parsedData.errors.length > 0 && parsedData.rows.length === 0) {
            return res.status(400).json({
                message: 'Failed to parse Excel file',
                errors: parsedData.errors
            });
        }

        // Import attendance records
        const result = await importAttendanceRecords(organization_id, parsedData);

        res.status(200).json({
            message: 'Attendance import completed',
            data: {
                success: result.success,
                skipped: result.skipped,
                total: result.total,
                errors: result.errors
            }
        });

    } catch (error) {
        logger.error('Error importing attendance:', error);
        res.status(500).json({ message: 'Error importing attendance', error: error.message });
    }
};