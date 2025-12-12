import ExcelJS from 'exceljs';
import logger from '../utils/logger.js';

/**
 * Export payroll data to Excel
 */
export const exportPayrollToExcel = async (payrolls, organization, month, year) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Register');

    // Set column headers
    worksheet.columns = [
        { header: 'Employee Code', key: 'employee_code', width: 15 },
        { header: 'Employee Name', key: 'employee_name', width: 25 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Working Days', key: 'working_days', width: 12 },
        { header: 'Present Days', key: 'present_days', width: 12 },
        { header: 'Leave Days', key: 'leave_days', width: 12 },
        { header: 'Basic Salary', key: 'basic_salary', width: 15 },
        { header: 'Gross Salary', key: 'gross_salary', width: 15 },
        { header: 'Deductions', key: 'deductions', width: 15 },
        { header: 'Net Salary', key: 'net_salary', width: 15 },
        { header: 'Payment Status', key: 'payment_status', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 11 };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    payrolls.forEach((payroll) => {
        const totalDeductions = Object.values(payroll.deductions || {}).reduce(
            (sum, val) => sum + (parseFloat(val) || 0), 0
        ) + (payroll.late_penalties || 0);

        worksheet.addRow({
            employee_code: payroll.employee?.employee_code || 'N/A',
            employee_name: `${payroll.employee?.user?.first_name || ''} ${payroll.employee?.user?.last_name || ''}`.trim(),
            department: payroll.employee?.department?.department_name || 'N/A',
            working_days: payroll.working_days,
            present_days: payroll.present_days,
            leave_days: payroll.leave_days,
            basic_salary: parseFloat(payroll.basic_salary || 0),
            gross_salary: parseFloat(payroll.gross_salary || 0),
            deductions: totalDeductions,
            net_salary: parseFloat(payroll.net_salary || 0),
            payment_status: payroll.payment_status
        });
    });

    // Format number columns
    const numberColumns = ['basic_salary', 'gross_salary', 'deductions', 'net_salary'];
    numberColumns.forEach((col, index) => {
        const colIndex = worksheet.getColumn(col).number;
        worksheet.getColumn(colIndex).numFmt = '#,##0.00';
    });

    // Add summary row
    const summaryRow = worksheet.addRow({});
    summaryRow.getCell(1).value = 'TOTAL';
    summaryRow.getCell(1).font = { bold: true };
    
    const grossTotal = payrolls.reduce((sum, p) => sum + parseFloat(p.gross_salary || 0), 0);
    const netTotal = payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);
    const deductionsTotal = payrolls.reduce((sum, p) => {
        const ded = Object.values(p.deductions || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0) + (p.late_penalties || 0);
        return sum + ded;
    }, 0);

    summaryRow.getCell(8).value = grossTotal;
    summaryRow.getCell(8).numFmt = '#,##0.00';
    summaryRow.getCell(8).font = { bold: true };
    
    summaryRow.getCell(9).value = deductionsTotal;
    summaryRow.getCell(9).numFmt = '#,##0.00';
    summaryRow.getCell(9).font = { bold: true };
    
    summaryRow.getCell(10).value = netTotal;
    summaryRow.getCell(10).numFmt = '#,##0.00';
    summaryRow.getCell(10).font = { bold: true };

    // Add title
    worksheet.insertRow(1, [`${organization.organization_name || 'Organization'} - Payroll Register`]);
    worksheet.mergeCells(1, 1, 1, 11);
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 25;

    // Add period
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    worksheet.insertRow(2, [`Period: ${monthName} ${year}`]);
    worksheet.mergeCells(2, 1, 2, 11);
    worksheet.getRow(2).font = { size: 12 };
    worksheet.getRow(2).alignment = { horizontal: 'center' };

    // Adjust row heights
    worksheet.getRow(3).height = 20;

    return workbook;
};

/**
 * Export payroll to CSV
 */
export const exportPayrollToCSV = async (payrolls) => {
    const headers = [
        'Employee Code',
        'Employee Name',
        'Department',
        'Working Days',
        'Present Days',
        'Leave Days',
        'Basic Salary',
        'Gross Salary',
        'Deductions',
        'Net Salary',
        'Payment Status'
    ];

    const rows = payrolls.map((payroll) => {
        const totalDeductions = Object.values(payroll.deductions || {}).reduce(
            (sum, val) => sum + (parseFloat(val) || 0), 0
        ) + (payroll.late_penalties || 0);

        return [
            payroll.employee?.employee_code || 'N/A',
            `${payroll.employee?.user?.first_name || ''} ${payroll.employee?.user?.last_name || ''}`.trim(),
            payroll.employee?.department?.department_name || 'N/A',
            payroll.working_days,
            payroll.present_days,
            payroll.leave_days,
            parseFloat(payroll.basic_salary || 0).toFixed(2),
            parseFloat(payroll.gross_salary || 0).toFixed(2),
            totalDeductions.toFixed(2),
            parseFloat(payroll.net_salary || 0).toFixed(2),
            payroll.payment_status
        ];
    });

    // Convert to CSV format
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
};

export default {
    exportPayrollToExcel,
    exportPayrollToCSV
};

