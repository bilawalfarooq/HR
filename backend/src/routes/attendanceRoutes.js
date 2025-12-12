import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    createShift,
    getShifts,
    updateShift,
    deleteShift
} from '../controllers/ShiftController.js';
import {
    registerDevice,
    getDevices,
    syncDeviceLogs
} from '../controllers/DeviceController.js';
import {
    getDashboardStats,
    getLogs,
    processDailyAttendance,
    mobileCheckIn,
    importAttendance
} from '../controllers/AttendanceController.js';
import multer from 'multer';

// Configure multer for file uploads (memory storage for Excel files)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'), false);
        }
    }
});

const router = express.Router();

// Middleware
router.use(authenticate);

// Mobile Check-in
router.post('/mobile/check-in', authorize('employee', 'super_admin', 'admin'), mobileCheckIn);

// Dashboard & Stats
router.get('/dashboard', authorize('super_admin', 'admin', 'hr_manager'), getDashboardStats);
router.get('/logs', authorize('super_admin', 'admin', 'hr_manager'), getLogs);
router.post('/process', authorize('super_admin', 'admin', 'hr_manager'), processDailyAttendance);

// Shifts
router.post('/shifts', authorize('super_admin', 'admin', 'hr_manager'), createShift);
router.get('/shifts', authorize('super_admin', 'admin', 'hr_manager', 'employee'), getShifts); // Employees might need to see shifts
router.put('/shifts/:id', authorize('super_admin', 'admin', 'hr_manager'), updateShift);
router.delete('/shifts/:id', authorize('super_admin', 'admin', 'hr_manager'), deleteShift);

// Devices
router.post('/devices', authorize('super_admin', 'admin'), registerDevice);
router.get('/devices', authorize('super_admin', 'admin'), getDevices);
router.post('/devices/sync', syncDeviceLogs);

// Import
router.post('/import', authorize('super_admin', 'admin', 'hr_manager'), upload.single('file'), importAttendance);

export default router;
