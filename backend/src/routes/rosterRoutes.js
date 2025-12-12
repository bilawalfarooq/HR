import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getRoster, assignShift, bulkAssignShift } from '../controllers/RosterController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin', 'hr_manager', 'employee'), getRoster); // Employees might view their roster
router.post('/assign', authorize('super_admin', 'admin', 'hr_manager'), assignShift);
router.post('/bulk-assign', authorize('super_admin', 'admin', 'hr_manager'), bulkAssignShift);

export default router;
