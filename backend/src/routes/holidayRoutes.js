import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getHolidays, createHoliday, deleteHoliday } from '../controllers/HolidayController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getHolidays);
router.post('/', authorize('super_admin', 'admin', 'hr_manager'), createHoliday);
router.delete('/:id', authorize('super_admin', 'admin', 'hr_manager'), deleteHoliday);

export default router;
