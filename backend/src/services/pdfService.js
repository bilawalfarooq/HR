import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate payslip PDF
 */
export const generatePayslipPDF = async (payroll, employee, organization) => {
    return new Promise((resolve, reject) => {
        try {
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(__dirname, '../../uploads/payslips');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Generate filename
            const filename = `payslip_${employee.employee_code}_${payroll.year}_${String(payroll.month).padStart(2, '0')}.pdf`;
            const filepath = path.join(uploadsDir, filename);

            // Create PDF document
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20)
                .fillColor('#1a1a1a')
                .text(organization.organization_name || 'HR Management System', { align: 'center' });
            
            doc.moveDown(0.5);
            doc.fontSize(14)
                .fillColor('#666666')
                .text('PAYSLIP', { align: 'center' });

            doc.moveDown(1);

            // Employee Information Section
            doc.fontSize(12)
                .fillColor('#1a1a1a')
                .text('Employee Information', { underline: true });

            doc.moveDown(0.3);
            doc.fontSize(10)
                .fillColor('#333333')
                .text(`Employee Code: ${employee.employee_code}`, { continued: true, align: 'left' })
                .text(`Period: ${getMonthName(payroll.month)} ${payroll.year}`, { align: 'right' });

            doc.moveDown(0.2);
            doc.text(`Name: ${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`, { continued: true })
                .text(`Payment Date: ${payroll.payment_date ? new Date(payroll.payment_date).toLocaleDateString() : 'N/A'}`, { align: 'right' });

            if (employee.designation) {
                doc.moveDown(0.2);
                doc.text(`Designation: ${employee.designation}`);
            }

            if (employee.department) {
                doc.moveDown(0.2);
                doc.text(`Department: ${employee.department.department_name || 'N/A'}`);
            }

            doc.moveDown(1);

            // Attendance Summary
            doc.fontSize(12)
                .fillColor('#1a1a1a')
                .text('Attendance Summary', { underline: true });

            doc.moveDown(0.3);
            doc.fontSize(10)
                .fillColor('#333333')
                .text(`Working Days: ${payroll.working_days}`, { continued: true })
                .text(`Present Days: ${payroll.present_days}`, { align: 'right' });

            doc.moveDown(0.2);
            doc.text(`Leave Days: ${payroll.leave_days}`, { continued: true })
                .text(`Overtime Hours: ${payroll.overtime_hours || 0}`, { align: 'right' });

            doc.moveDown(1);

            // Earnings Section
            doc.fontSize(12)
                .fillColor('#1a1a1a')
                .text('Earnings', { underline: true });

            doc.moveDown(0.3);
            const earningsTable = createTable(doc, [
                ['Description', 'Amount (₹)'],
                ['Basic Salary', formatCurrency(payroll.basic_salary)],
            ]);

            // Add allowances
            if (payroll.allowances && Object.keys(payroll.allowances).length > 0) {
                Object.entries(payroll.allowances).forEach(([key, value]) => {
                    earningsTable.push([key, formatCurrency(value)]);
                });
            }

            // Add bonuses
            if (payroll.bonuses && Object.keys(payroll.bonuses).length > 0) {
                Object.entries(payroll.bonuses).forEach(([key, value]) => {
                    earningsTable.push([`Bonus: ${key}`, formatCurrency(value)]);
                });
            }

            // Add overtime
            if (payroll.overtime_hours > 0) {
                const overtimePay = payroll.allowances?.Overtime || 0;
                if (overtimePay > 0) {
                    earningsTable.push(['Overtime Pay', formatCurrency(overtimePay)]);
                }
            }

            earningsTable.push(['Gross Salary', formatCurrency(payroll.gross_salary)]);
            drawTable(doc, earningsTable, 50, doc.y);

            doc.moveDown(1);

            // Deductions Section
            doc.fontSize(12)
                .fillColor('#1a1a1a')
                .text('Deductions', { underline: true });

            doc.moveDown(0.3);
            const deductionsTable = createTable(doc, [
                ['Description', 'Amount (₹)']
            ]);

            // Add deductions
            if (payroll.deductions && Object.keys(payroll.deductions).length > 0) {
                Object.entries(payroll.deductions).forEach(([key, value]) => {
                    deductionsTable.push([key, formatCurrency(value)]);
                });
            }

            // Add late penalties
            if (payroll.late_penalties > 0) {
                deductionsTable.push(['Late Penalties', formatCurrency(payroll.late_penalties)]);
            }

            deductionsTable.push(['Total Deductions', formatCurrency(
                Object.values(payroll.deductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) + (payroll.late_penalties || 0)
            )]);
            drawTable(doc, deductionsTable, 50, doc.y);

            doc.moveDown(1);

            // Net Salary Section
            doc.fontSize(14)
                .fillColor('#1a1a1a')
                .text(`Net Salary: ${formatCurrency(payroll.net_salary)}`, { align: 'right', underline: true });

            doc.moveDown(1);

            // Footer
            doc.fontSize(8)
                .fillColor('#999999')
                .text('This is a computer-generated document and does not require a signature.', { align: 'center' });

            doc.moveDown(0.5);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve({
                    filepath,
                    filename,
                    url: `/uploads/payslips/${filename}`
                });
            });

            stream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Helper function to create table data structure
 */
function createTable(doc, rows) {
    return rows;
}

/**
 * Helper function to draw table
 */
function drawTable(doc, rows, x, y) {
    const rowHeight = 20;
    const colWidths = [300, 150];
    let currentY = y;

    rows.forEach((row, index) => {
        let currentX = x;
        
        row.forEach((cell, colIndex) => {
            doc.fontSize(index === 0 ? 10 : 9)
                .fillColor(index === 0 ? '#1a1a1a' : '#333333')
                .text(cell || '', currentX, currentY, {
                    width: colWidths[colIndex],
                    align: colIndex === 1 ? 'right' : 'left'
                });
            
            currentX += colWidths[colIndex];
        });

        // Draw line under header
        if (index === 0) {
            doc.moveTo(x, currentY + rowHeight)
                .lineTo(x + colWidths[0] + colWidths[1], currentY + rowHeight)
                .strokeColor('#cccccc')
                .lineWidth(1)
                .stroke();
        }

        currentY += rowHeight;
    });

    doc.y = currentY;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get month name
 */
function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
}

export default {
    generatePayslipPDF
};

