import express from 'express';
import { authenticate as protect, authorize } from '../middleware/auth.js';
import * as resignationController from '../controllers/ResignationController.js';

const router = express.Router();

router.use(protect); // All routes require login

// Employee routes
router.post('/submit', authorize('Employee'), resignationController.submitResignation);

// Manager/HR routes
router.put('/:resignation_id/status', authorize('Team Lead', 'Manager', 'HR', 'Admin', 'Super Admin'), resignationController.updateResignationStatus);
router.get('/', authorize('Team Lead', 'Manager', 'HR', 'Admin', 'Super Admin'), resignationController.getResignations);

// Exit Interview
router.post('/exit-interview', resignationController.submitExitInterview);

export default router;
