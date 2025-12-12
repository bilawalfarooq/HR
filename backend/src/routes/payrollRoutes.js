import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import payrollController from '../controllers/PayrollController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Salary Structure routes (Admin only)
router.get('/salary-structures', authorize('admin', 'hr_manager', 'super_admin'), payrollController.getAllSalaryStructures);
router.post('/salary-structures', authorize('admin', 'hr_manager', 'super_admin'), payrollController.createOrUpdateSalaryStructure);
router.get('/salary-structures/employee/:employee_id', authorize('admin', 'hr_manager', 'super_admin', 'employee'), payrollController.getEmployeeSalaryStructure);

// Payroll processing routes (Admin only)
router.post('/process', authorize('admin', 'hr_manager', 'super_admin'), payrollController.processPayroll);
router.get('/', authorize('admin', 'hr_manager', 'super_admin'), payrollController.getPayrolls);
router.get('/summary', authorize('admin', 'hr_manager', 'super_admin'), payrollController.getPayrollSummary);
router.get('/:id', authorize('admin', 'hr_manager', 'super_admin', 'employee'), payrollController.getPayrollById);
router.put('/:id', authorize('admin', 'hr_manager', 'super_admin'), payrollController.updatePayroll);
router.put('/:id/mark-paid', authorize('admin', 'hr_manager', 'super_admin'), payrollController.markPayrollAsPaid);
router.post('/:id/generate-payslip', authorize('admin', 'hr_manager', 'super_admin'), payrollController.generatePayslip);

// Export routes
router.get('/export/excel', authorize('admin', 'hr_manager', 'super_admin'), payrollController.exportPayrollExcel);
router.get('/export/csv', authorize('admin', 'hr_manager', 'super_admin'), payrollController.exportPayrollCSV);

// Statutory reports
router.get('/reports/pf', authorize('admin', 'hr_manager', 'super_admin'), payrollController.getPFStatement);
router.get('/reports/tax', authorize('admin', 'hr_manager', 'super_admin'), payrollController.getTaxStatement);

export default router;

