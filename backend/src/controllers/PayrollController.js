import { sequelize, SalaryStructure, Payroll, Payslip, Employee, User, AttendanceRecord, LeaveRequest, Organization, Holiday, Department } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import { generatePayslipPDF } from '../services/pdfService.js';
import { sendEmail } from '../services/emailService.js';
import { exportPayrollToExcel, exportPayrollToCSV } from '../services/excelService.js';
import { notifyPayrollProcessed, notifyPayslipGenerated } from '../services/notificationService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

/**
 * Create or update salary structure for an employee
 */
export const createOrUpdateSalaryStructure = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { employee_id, basic_salary, allowances, deductions, effective_from, effective_to } = req.body;

        // Deactivate existing active structures for this employee
        await SalaryStructure.update(
            { is_active: false },
            {
                where: {
                    employee_id,
                    organization_id: req.user.organization_id,
                    is_active: true
                },
                transaction
            }
        );

        // Create new salary structure
        const salaryStructure = await SalaryStructure.create({
            organization_id: req.user.organization_id,
            employee_id,
            basic_salary,
            allowances: allowances || {},
            deductions: deductions || {},
            effective_from,
            effective_to,
            is_active: true
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Salary structure created successfully',
            data: salaryStructure
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Get salary structure for an employee
 */
export const getEmployeeSalaryStructure = async (req, res, next) => {
    try {
        const { employee_id } = req.params;

        const salaryStructure = await SalaryStructure.findOne({
            where: {
                employee_id: parseInt(employee_id),
                organization_id: req.user.organization_id,
                is_active: true
            },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
                }
            ]
        });

        if (!salaryStructure) {
            throw new AppError('Salary structure not found', 404);
        }

        res.status(200).json({
            success: true,
            data: salaryStructure
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all salary structures (Admin)
 */
export const getAllSalaryStructures = async (req, res, next) => {
    try {
        const { employee_id, is_active } = req.query;

        const whereClause = {
            organization_id: req.user.organization_id
        };

        if (employee_id) whereClause.employee_id = employee_id;
        if (is_active !== undefined) whereClause.is_active = is_active === 'true';

        const structures = await SalaryStructure.findAll({
            where: whereClause,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
                }
            ],
            order: [['effective_from', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: structures
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Process payroll for a specific month/year
 */
export const processPayroll = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { month, year } = req.body;

        if (!month || !year) {
            throw new AppError('Month and year are required', 400);
        }

        // Get all active employees with salary structures
        const employees = await Employee.findAll({
            where: {
                organization_id: req.user.organization_id,
                status: 'active'
            },
            include: [
                {
                    model: SalaryStructure,
                    as: 'salaryStructures',
                    where: { is_active: true },
                    required: true
                }
            ]
        });

        if (employees.length === 0) {
            throw new AppError('No employees with active salary structures found', 404);
        }

        const processedPayrolls = [];
        const errors = [];

        for (const employee of employees) {
            try {
                // Check if payroll already exists
                const existingPayroll = await Payroll.findOne({
                    where: {
                        employee_id: employee.employee_id,
                        month,
                        year,
                        organization_id: req.user.organization_id
                    },
                    transaction
                });

                if (existingPayroll) {
                    errors.push(`Payroll already exists for employee ${employee.employee_id}`);
                    continue;
                }

                const salaryStructure = employee.salaryStructures[0];

                // Calculate working days (excluding weekends and holidays)
                const workingDays = calculateWorkingDays(month, year, req.user.organization_id);

                // Get attendance records for the month
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                const attendanceRecords = await AttendanceRecord.findAll({
                    where: {
                        employee_id: employee.employee_id,
                        date: {
                            [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
                        }
                    },
                    transaction
                });

                // Calculate present days, leave days, overtime
                let presentDays = 0;
                let leaveDays = 0;
                let overtimeHours = 0;
                let latePenalties = 0;

                attendanceRecords.forEach(record => {
                    if (record.status === 'PRESENT' || record.status === 'LATE') {
                        presentDays += 1;
                        if (record.status === 'LATE') {
                            // Calculate late penalty (example: 100 per late occurrence)
                            latePenalties += 100;
                        }
                    } else if (record.status === 'LEAVE') {
                        leaveDays += parseFloat(record.days_count || 1);
                    }
                    if (record.overtime_duration) {
                        overtimeHours += parseFloat(record.overtime_duration) / 60; // Convert minutes to hours
                    }
                });

                // Calculate pro-rated salary based on attendance
                const basicSalary = parseFloat(salaryStructure.basic_salary);
                const dailyRate = basicSalary / workingDays;
                const proRatedBasic = dailyRate * presentDays;

                // Calculate allowances (can be pro-rated or fixed)
                const allowances = { ...salaryStructure.allowances };
                // Example: HRA is usually fixed, but you can pro-rate if needed
                // allowances.HRA = (allowances.HRA || 0) * (presentDays / workingDays);

                // Calculate deductions
                const deductions = { ...salaryStructure.deductions };
                deductions.Late_Penalties = latePenalties;

                // Calculate overtime pay (example: 1.5x hourly rate)
                const hourlyRate = basicSalary / (workingDays * 8); // Assuming 8 hours per day
                const overtimePay = overtimeHours * hourlyRate * 1.5;
                if (overtimePay > 0) {
                    allowances.Overtime = overtimePay;
                }

                // Calculate gross and net salary
                const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                const grossSalary = proRatedBasic + totalAllowances;
                const netSalary = grossSalary - totalDeductions;

                // Create payroll record
                const payroll = await Payroll.create({
                    organization_id: req.user.organization_id,
                    employee_id: employee.employee_id,
                    salary_structure_id: salaryStructure.salary_structure_id,
                    month,
                    year,
                    working_days: workingDays,
                    present_days: presentDays,
                    leave_days: leaveDays,
                    overtime_hours: overtimeHours,
                    late_penalties: latePenalties,
                    basic_salary: proRatedBasic,
                    allowances,
                    deductions,
                    gross_salary: grossSalary,
                    net_salary: netSalary,
                    payment_status: 'pending'
                }, { transaction });

                processedPayrolls.push(payroll);

                // Send notification after transaction commit
                // We'll do this after commit to avoid issues
            } catch (error) {
                logger.error(`Error processing payroll for employee ${employee.employee_id}:`, error);
                errors.push(`Employee ${employee.employee_id}: ${error.message}`);
            }
        }

        await transaction.commit();

        // Send notifications for processed payrolls
        for (const payroll of processedPayrolls) {
            try {
                await notifyPayrollProcessed(payroll);
            } catch (notifError) {
                logger.error(`Error sending payroll notification for payroll ${payroll.payroll_id}:`, notifError);
            }
        }

        res.status(200).json({
            success: true,
            message: `Payroll processed for ${processedPayrolls.length} employees`,
            data: {
                processed: processedPayrolls.length,
                payrolls: processedPayrolls,
                errors: errors.length > 0 ? errors : undefined
            }
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Get payroll records
 */
export const getPayrolls = async (req, res, next) => {
    try {
        const { employee_id, month, year, payment_status } = req.query;

        const whereClause = {
            organization_id: req.user.organization_id
        };

        if (employee_id) whereClause.employee_id = employee_id;
        if (month) whereClause.month = parseInt(month);
        if (year) whereClause.year = parseInt(year);
        if (payment_status) whereClause.payment_status = payment_status;

        const payrolls = await Payroll.findAll({
            where: whereClause,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
                },
                {
                    model: SalaryStructure,
                    as: 'salaryStructure'
                }
            ],
            order: [['year', 'DESC'], ['month', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: payrolls
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payroll by ID
 */
export const getPayrollById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payroll = await Payroll.findByPk(id, {
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user' }]
                },
                {
                    model: SalaryStructure,
                    as: 'salaryStructure'
                },
                {
                    model: Payslip,
                    as: 'payslip'
                }
            ]
        });

        if (!payroll || payroll.organization_id !== req.user.organization_id) {
            throw new AppError('Payroll not found', 404);
        }

        res.status(200).json({
            success: true,
            data: payroll
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update payroll (add bonuses, adjustments, etc.)
 */
export const updatePayroll = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { bonuses, adjustments, payment_status, payment_date, payment_method, transaction_reference } = req.body;

        const payroll = await Payroll.findOne({
            where: {
                payroll_id: id,
                organization_id: req.user.organization_id
            }
        });

        if (!payroll) {
            throw new AppError('Payroll not found', 404);
        }

        // Update bonuses and adjustments
        const updatedBonuses = bonuses ? { ...payroll.bonuses, ...bonuses } : payroll.bonuses;
        const updatedAdjustments = adjustments ? { ...payroll.adjustments, ...adjustments } : payroll.adjustments;

        // Recalculate gross and net salary
        const totalBonuses = Object.values(updatedBonuses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        const totalAdjustments = Object.values(updatedAdjustments).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        
        const grossSalary = parseFloat(payroll.gross_salary) + totalBonuses + totalAdjustments;
        const totalDeductions = Object.values(payroll.deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        const netSalary = grossSalary - totalDeductions;

        await payroll.update({
            bonuses: updatedBonuses,
            adjustments: updatedAdjustments,
            gross_salary: grossSalary,
            net_salary: netSalary,
            payment_status: payment_status || payroll.payment_status,
            payment_date: payment_date || payroll.payment_date,
            payment_method: payment_method || payroll.payment_method,
            transaction_reference: transaction_reference || payroll.transaction_reference
        });

        res.status(200).json({
            success: true,
            message: 'Payroll updated successfully',
            data: payroll
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark payroll as paid
 */
export const markPayrollAsPaid = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { payment_date, payment_method, transaction_reference } = req.body;

        const payroll = await Payroll.findOne({
            where: {
                payroll_id: id,
                organization_id: req.user.organization_id
            }
        });

        if (!payroll) {
            throw new AppError('Payroll not found', 404);
        }

        await payroll.update({
            payment_status: 'paid',
            payment_date: payment_date || new Date(),
            payment_method: payment_method,
            transaction_reference: transaction_reference
        });

        res.status(200).json({
            success: true,
            message: 'Payroll marked as paid',
            data: payroll
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate payslip PDF
 */
export const generatePayslip = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payroll = await Payroll.findByPk(id, {
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        { model: User, as: 'user' },
                        { model: Organization, as: 'organization' }
                    ]
                },
                {
                    model: SalaryStructure,
                    as: 'salaryStructure'
                }
            ]
        });

        if (!payroll || payroll.organization_id !== req.user.organization_id) {
            throw new AppError('Payroll not found', 404);
        }

        // Check if payslip already exists
        let payslip = await Payslip.findOne({
            where: { payroll_id: id }
        });

        // Generate PDF
        const pdfResult = await generatePayslipPDF(
            payroll,
            payroll.employee,
            payroll.employee.organization
        );

        // Update or create payslip record
        if (payslip) {
            await payslip.update({
                payslip_pdf_url: pdfResult.url,
                generated_at: new Date()
            });
        } else {
            payslip = await Payslip.create({
                organization_id: req.user.organization_id,
                payroll_id: id,
                employee_id: payroll.employee_id,
                month: payroll.month,
                year: payroll.year,
                payslip_pdf_url: pdfResult.url,
                generated_at: new Date()
            });
        }

        // Send notification
        try {
            await notifyPayslipGenerated(payslip);
        } catch (notifError) {
            logger.error('Error sending payslip notification:', notifError);
        }

        // Send email if requested
        const { sendEmail: shouldSendEmail } = req.body;
        if (shouldSendEmail && payroll.employee.user?.email) {
            try {
                const monthName = new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' });
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const attachmentPath = path.join(__dirname, '../../', pdfResult.filepath);
                
                await sendEmail({
                    to: payroll.employee.user.email,
                    subject: `Payslip for ${monthName} ${payroll.year}`,
                    text: `Dear ${payroll.employee.user.first_name},\n\nYour payslip for ${monthName} ${payroll.year} has been generated. Please find it attached.\n\nNet Salary: ₹${payroll.net_salary.toLocaleString('en-IN')}\n\nThank you.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Payslip for ${monthName} ${payroll.year}</h2>
                            <p>Dear ${payroll.employee.user.first_name},</p>
                            <p>Your payslip for ${monthName} ${payroll.year} has been generated.</p>
                            <p><strong>Net Salary: ₹${payroll.net_salary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
                            <p>Please find your payslip attached.</p>
                            <p>Thank you.</p>
                        </div>
                    `,
                    attachment: attachmentPath
                });
                logger.info(`Payslip email sent to ${payroll.employee.user.email}`);
            } catch (emailError) {
                logger.error('Error sending payslip email:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payslip generated successfully',
            data: {
                payslip,
                payroll,
                pdf_url: pdfResult.url,
                download_url: `${req.protocol}://${req.get('host')}${pdfResult.url}`
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payroll summary/report
 */
export const getPayrollSummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            throw new AppError('Month and year are required', 400);
        }

        const payrolls = await Payroll.findAll({
            where: {
                organization_id: req.user.organization_id,
                month: parseInt(month),
                year: parseInt(year)
            },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
                }
            ]
        });

        // Calculate totals
        const totals = payrolls.reduce((acc, payroll) => {
            acc.total_gross += parseFloat(payroll.gross_salary) || 0;
            acc.total_net += parseFloat(payroll.net_salary) || 0;
            acc.total_employees += 1;
            return acc;
        }, { total_gross: 0, total_net: 0, total_employees: 0 });

        res.status(200).json({
            success: true,
            data: {
                month: parseInt(month),
                year: parseInt(year),
                payrolls,
                summary: totals
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Helper function to calculate working days
 */
async function calculateWorkingDays(month, year, organizationId) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get holidays for this month
    const holidays = await Holiday.findAll({
        where: {
            organization_id: organizationId,
            date: {
                [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
            }
        }
    });

    const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));
    
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Exclude weekends (Saturday = 6, Sunday = 0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
            workingDays++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
}

/**
 * Export payroll to Excel
 */
export const exportPayrollExcel = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            throw new AppError('Month and year are required', 400);
        }

        const payrolls = await Payroll.findAll({
            where: {
                organization_id: req.user.organization_id,
                month: parseInt(month),
                year: parseInt(year)
            },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        { model: User, as: 'user', attributes: ['first_name', 'last_name'] },
                        { model: Department, as: 'department' }
                    ]
                }
            ]
        });

        const organization = await Organization.findByPk(req.user.organization_id);

        const workbook = await exportPayrollToExcel(payrolls, organization, parseInt(month), parseInt(year));

        // Generate filename
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
        const filename = `Payroll_${monthName}_${year}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

/**
 * Export payroll to CSV
 */
export const exportPayrollCSV = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            throw new AppError('Month and year are required', 400);
        }

        const payrolls = await Payroll.findAll({
            where: {
                organization_id: req.user.organization_id,
                month: parseInt(month),
                year: parseInt(year)
            },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        { model: User, as: 'user', attributes: ['first_name', 'last_name'] },
                        { model: Department, as: 'department' }
                    ]
                }
            ]
        });

        const csvContent = await exportPayrollToCSV(payrolls);

        // Generate filename
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
        const filename = `Payroll_${monthName}_${year}.csv`;

        // Set response headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.send(csvContent);
    } catch (error) {
        next(error);
    }
};

/**
 * Get PF (Provident Fund) Statement
 */
export const getPFStatement = async (req, res, next) => {
    try {
        const { employee_id, year } = req.query;
        const organization_id = req.user.organization_id;

        const whereClause = {
            organization_id
        };

        if (employee_id) whereClause.employee_id = employee_id;
        if (year) whereClause.year = parseInt(year);

        const payrolls = await Payroll.findAll({
            where: whereClause,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
                        { model: Department, as: 'department' }
                    ]
                }
            ],
            order: [['year', 'ASC'], ['month', 'ASC']]
        });

        // Calculate PF contributions (typically 12% of basic salary)
        const pfStatements = payrolls.map(payroll => {
            const pfContribution = parseFloat(payroll.basic_salary) * 0.12; // 12% of basic
            const employerContribution = parseFloat(payroll.basic_salary) * 0.12; // Employer matches

            return {
                month: payroll.month,
                year: payroll.year,
                employee_code: payroll.employee?.employee_code,
                employee_name: `${payroll.employee?.user?.first_name || ''} ${payroll.employee?.user?.last_name || ''}`.trim(),
                basic_salary: parseFloat(payroll.basic_salary),
                employee_pf: pfContribution,
                employer_pf: employerContribution,
                total_pf: pfContribution + employerContribution
            };
        });

        // Calculate totals
        const totals = pfStatements.reduce((acc, stmt) => {
            acc.total_employee_pf += stmt.employee_pf;
            acc.total_employer_pf += stmt.employer_pf;
            acc.total_pf += stmt.total_pf;
            return acc;
        }, { total_employee_pf: 0, total_employer_pf: 0, total_pf: 0 });

        res.status(200).json({
            success: true,
            data: {
                statements: pfStatements,
                totals,
                year: year || 'All'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Tax Statement (TDS/Income Tax)
 */
export const getTaxStatement = async (req, res, next) => {
    try {
        const { employee_id, year } = req.query;
        const organization_id = req.user.organization_id;

        const whereClause = {
            organization_id
        };

        if (employee_id) whereClause.employee_id = employee_id;
        if (year) whereClause.year = parseInt(year);

        const payrolls = await Payroll.findAll({
            where: whereClause,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
                        { model: Department, as: 'department' }
                    ]
                }
            ],
            order: [['year', 'ASC'], ['month', 'ASC']]
        });

        // Calculate tax (simplified - in real app, use tax slabs)
        const taxStatements = payrolls.map(payroll => {
            const grossSalary = parseFloat(payroll.gross_salary);
            const deductions = Object.values(payroll.deductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            const taxableIncome = grossSalary - deductions;
            
            // Simplified tax calculation (should use actual tax slabs)
            let tax = 0;
            if (taxableIncome > 500000) {
                tax = (taxableIncome - 500000) * 0.2 + 12500; // 20% above 5L + 12.5k
            } else if (taxableIncome > 250000) {
                tax = (taxableIncome - 250000) * 0.05; // 5% above 2.5L
            }

            return {
                month: payroll.month,
                year: payroll.year,
                employee_code: payroll.employee?.employee_code,
                employee_name: `${payroll.employee?.user?.first_name || ''} ${payroll.employee?.user?.last_name || ''}`.trim(),
                gross_salary: grossSalary,
                deductions: deductions,
                taxable_income: taxableIncome,
                tax_deducted: tax,
                net_salary: parseFloat(payroll.net_salary)
            };
        });

        // Calculate totals
        const totals = taxStatements.reduce((acc, stmt) => {
            acc.total_gross += stmt.gross_salary;
            acc.total_deductions += stmt.deductions;
            acc.total_taxable += stmt.taxable_income;
            acc.total_tax += stmt.tax_deducted;
            return acc;
        }, { total_gross: 0, total_deductions: 0, total_taxable: 0, total_tax: 0 });

        res.status(200).json({
            success: true,
            data: {
                statements: taxStatements,
                totals,
                year: year || 'All'
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createOrUpdateSalaryStructure,
    getEmployeeSalaryStructure,
    getAllSalaryStructures,
    processPayroll,
    getPayrolls,
    getPayrollById,
    updatePayroll,
    markPayrollAsPaid,
    generatePayslip,
    getPayrollSummary,
    exportPayrollExcel,
    exportPayrollCSV,
    getPFStatement,
    getTaxStatement
};

