import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    createLeaveType,
    getLeaveTypes,
    requestLeave,
    getMyLeaves,
    getPendingLeaves,
    approveLeave,
    getMyBalance
} from '../controllers/LeaveController.js';

const router = express.Router();

router.use(authenticate);

// Types
router.post('/types', authorize('super_admin', 'admin', 'hr_manager'), createLeaveType);
router.get('/types', getLeaveTypes);

// Requests
router.post('/request', authorize('employee', 'admin', 'hr_manager', 'super_admin'), requestLeave); // All roles
router.get('/my-requests', getMyLeaves);
router.get('/pending', authorize('super_admin', 'admin', 'hr_manager', 'manager'), getPendingLeaves);
router.put('/approve/:id', authorize('super_admin', 'admin', 'hr_manager', 'manager'), approveLeave);

// Balance
router.get('/balance', getMyBalance);

export default router;
