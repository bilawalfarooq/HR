import express from 'express';
import { authenticate as protect, authorize } from '../middleware/auth.js';
import * as assetController from '../controllers/AssetController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('HR', 'Admin', 'Super Admin')); // Defaults to admin mainly

router.post('/', assetController.addAsset);
router.post('/:asset_id/assign', assetController.assignAsset);
router.post('/:asset_id/return', assetController.returnAsset);
router.get('/employee/:employee_id', assetController.getEmployeeAssets);

export default router;
