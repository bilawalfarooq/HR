import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import timesheetController from '../controllers/TimesheetController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.get('/my-timesheets', authorize('employee', 'admin', 'hr_manager', 'super_admin'), timesheetController.getMyTimesheets);
router.get('/my-timesheets/:id', authorize('employee', 'admin', 'hr_manager', 'super_admin'), timesheetController.getTimesheetById);
router.post('/my-timesheets', authorize('employee', 'admin', 'hr_manager', 'super_admin'), timesheetController.createOrUpdateTimesheet);
router.put('/my-timesheets/:id/submit', authorize('employee', 'admin', 'hr_manager', 'super_admin'), timesheetController.submitTimesheet);

// Manager/Admin routes
router.get('/pending', authorize('admin', 'hr_manager', 'super_admin', 'team_lead'), timesheetController.getPendingTimesheets);
router.put('/:id/approve', authorize('admin', 'hr_manager', 'super_admin', 'team_lead'), timesheetController.approveTimesheet);

export default router;

