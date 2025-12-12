import ExcelJS from 'exceljs';
import { AttendanceRecord, Employee, Shift, Organization } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

/**
 * Parse Excel file and extract attendance data
 * Expected format:
 * - Column A: Employee Code/ID
 * - Column B: Date (YYYY-MM-DD)
 * - Column C: Check-in Time (HH:MM)
 * - Column D: Check-out Time (HH:MM) (optional)
 * - Column E: Status (PRESENT/ABSENT/LATE/HALF_DAY/LEAVE) (optional)
 * - Column F: Shift Name (optional)
 */
export const parseAttendanceExcel = async (fileBuffer) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    
    const worksheet = workbook.getWorksheet(1); // Get first sheet
    if (!worksheet) {
        throw new Error('Excel file must contain at least one worksheet');
    }

    const rows = [];
    const errors = [];
    
    // Skip header row (row 1)
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        
        const values = row.values;
        const employeeCode = values[1]?.toString().trim();
        const dateStr = values[2]?.toString().trim();
        const checkInTime = values[3]?.toString().trim();
        const checkOutTime = values[4]?.toString().trim();
        const status = values[5]?.toString().trim().toUpperCase();
        const shiftName = values[6]?.toString().trim();

        // Validate required fields
        if (!employeeCode || !dateStr) {
            errors.push(`Row ${rowNumber}: Missing employee code or date`);
            return;
        }

        // Parse date
        let date;
        try {
            // Try parsing as Excel date number first
            if (typeof dateStr === 'number') {
                // Excel date serial number
                const excelEpoch = new Date(1899, 11, 30);
                date = new Date(excelEpoch.getTime() + dateStr * 86400000);
            } else {
                // Try parsing as date string
                date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                    // Try common date formats
                    date = new Date(dateStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'));
                }
            }
            
            if (isNaN(date.getTime())) {
                errors.push(`Row ${rowNumber}: Invalid date format: ${dateStr}`);
                return;
            }
        } catch (error) {
            errors.push(`Row ${rowNumber}: Error parsing date: ${dateStr}`);
            return;
        }

        // Parse check-in time
        let checkInDateTime = null;
        if (checkInTime) {
            try {
                const [hours, minutes] = checkInTime.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    checkInDateTime = new Date(date);
                    checkInDateTime.setHours(hours, minutes, 0, 0);
                }
            } catch (error) {
                errors.push(`Row ${rowNumber}: Invalid check-in time format: ${checkInTime}`);
            }
        }

        // Parse check-out time
        let checkOutDateTime = null;
        if (checkOutTime) {
            try {
                const [hours, minutes] = checkOutTime.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    checkOutDateTime = new Date(date);
                    checkOutDateTime.setHours(hours, minutes, 0, 0);
                }
            } catch (error) {
                errors.push(`Row ${rowNumber}: Invalid check-out time format: ${checkOutTime}`);
            }
        }

        // Validate status
        const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'HOLIDAY'];
        const finalStatus = status && validStatuses.includes(status) ? status : null;

        rows.push({
            rowNumber,
            employeeCode,
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            checkInTime: checkInDateTime,
            checkOutTime: checkOutDateTime,
            status: finalStatus,
            shiftName
        });
    });

    return { rows, errors };
};

/**
 * Import attendance records from parsed Excel data
 */
export const importAttendanceRecords = async (organizationId, parsedData) => {
    const { rows, errors: parseErrors } = parsedData;
    const importErrors = [];
    let skippedCount = 0;

    // Get all employees for this organization
    const employees = await Employee.findAll({
        where: { organization_id: organizationId },
        attributes: ['employee_id', 'employee_code', 'current_shift_id']
    });

    const employeeMap = new Map();
    employees.forEach(emp => {
        employeeMap.set(emp.employee_code?.toLowerCase(), emp);
    });

    // Get all shifts for this organization
    const shifts = await Shift.findAll({
        where: { organization_id: organizationId },
        attributes: ['id', 'name']
    });

    const shiftMap = new Map();
    shifts.forEach(shift => {
        shiftMap.set(shift.name?.toLowerCase(), shift);
    });

    const recordsToCreate = [];

    for (const row of rows) {
        try {
            // Find employee
            const employee = employeeMap.get(row.employeeCode.toLowerCase());
            if (!employee) {
                importErrors.push(`Row ${row.rowNumber}: Employee not found: ${row.employeeCode}`);
                skippedCount++;
                continue;
            }

            // Check if record already exists
            const existingRecord = await AttendanceRecord.findOne({
                where: {
                    organization_id: organizationId,
                    employee_id: employee.employee_id,
                    date: row.date
                }
            });

            if (existingRecord) {
                importErrors.push(`Row ${row.rowNumber}: Attendance record already exists for ${row.employeeCode} on ${row.date}`);
                skippedCount++;
                continue;
            }

            // Find shift
            let shiftId = employee.current_shift_id;
            if (row.shiftName) {
                const shift = shiftMap.get(row.shiftName.toLowerCase());
                if (shift) {
                    shiftId = shift.id;
                }
            }

            // Determine status
            let status = row.status;
            if (!status) {
                if (row.checkInTime) {
                    status = 'PRESENT';
                } else {
                    status = 'ABSENT';
                }
            }

            // Calculate work duration if both check-in and check-out are provided
            let workDuration = 0;
            if (row.checkInTime && row.checkOutTime) {
                workDuration = Math.max(0, Math.floor((row.checkOutTime - row.checkInTime) / 1000 / 60)); // minutes
            }

            recordsToCreate.push({
                organization_id: organizationId,
                employee_id: employee.employee_id,
                shift_id: shiftId,
                date: row.date,
                check_in_time: row.checkInTime,
                check_out_time: row.checkOutTime,
                status: status,
                work_duration: workDuration
            });
        } catch (error) {
            importErrors.push(`Row ${row.rowNumber}: ${error.message}`);
            skippedCount++;
        }
    }

    // Bulk create records
    let createdCount = 0;
    if (recordsToCreate.length > 0) {
        try {
            await AttendanceRecord.bulkCreate(recordsToCreate, {
                validate: true,
                ignoreDuplicates: true
            });
            createdCount = recordsToCreate.length;
        } catch (error) {
            logger.error('Error bulk creating attendance records:', error);
            importErrors.push(`Bulk create error: ${error.message}`);
        }
    }

    return {
        success: createdCount,
        skipped: skippedCount,
        errors: [...parseErrors, ...importErrors],
        total: rows.length
    };
};

export default {
    parseAttendanceExcel,
    importAttendanceRecords
};

