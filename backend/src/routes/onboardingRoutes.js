import express from 'express';
import { authenticate as protect, authorize } from '../middleware/auth.js';
import * as onboardingController from '../controllers/OnboardingController.js';

const router = express.Router();

router.use(protect);

// Admin/HR setup routes
router.post('/tasks', authorize('HR', 'Admin', 'Super Admin'), onboardingController.createOnboardingTask);
router.post('/assign/:employee_id', authorize('HR', 'Admin', 'Super Admin'), onboardingController.assignTasksToEmployee);

// Employee/Manager View route
router.get('/progress/:employee_id', onboardingController.getEmployeeOnboardingStatus);

// Update status (Employee completes, HR verifies)
router.put('/progress/:employee_onboarding_id/status', onboardingController.updateTaskStatus);

export default router;
