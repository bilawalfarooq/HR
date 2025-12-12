import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDashboard } from '../controllers/EmployeeDashboardController.js';
import { getProfile, updateProfile, changePassword } from '../controllers/ProfileController.js';
import { getMyDocuments, uploadDocument, downloadDocument, deleteDocument, upload } from '../controllers/DocumentController.js';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/NotificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/change-password', changePassword);

// Documents
router.get('/documents', getMyDocuments);
router.post('/documents', upload.single('file'), uploadDocument);
router.get('/documents/:id/download', downloadDocument);
router.delete('/documents/:id', deleteDocument);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markAsRead);
router.put('/notifications/read-all', markAllAsRead);
router.delete('/notifications/:id', deleteNotification);

export default router;
