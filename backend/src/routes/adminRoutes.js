import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getAdminDashboard,
    getAllEmployees,
    getEmployeeDetails,
    updateEmployeeStatus,
    getPendingApprovals
} from '../controllers/AdminController.js';

const router = express.Router();

// All routes require authentication and admin/HR role
router.use(authenticate);
router.use(authorize('ADMIN', 'HR'));

router.get('/dashboard', getAdminDashboard);
router.get('/employees', getAllEmployees);
router.get('/employees/:id', getEmployeeDetails);
router.put('/employees/:id/status', updateEmployeeStatus);
router.get('/approvals/pending', getPendingApprovals);

export default router;

