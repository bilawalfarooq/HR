import express from 'express';
import { authenticate as protect, authorize } from '../middleware/auth.js';
import * as fnfController from '../controllers/FnFController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('HR', 'Admin', 'Super Admin')); // Only HR/Admin

router.post('/generate', fnfController.generateFnF);
router.put('/:fnf_id/status', fnfController.updateFnFStatus);

export default router;
