import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getSuperAdminDashboard,
    getAllCompanies,
    getCompanyDetails,
    updateCompanyStatus,
    getSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    assignSubscription,
    getAllSubscriptions
} from '../controllers/SuperAdminController.js';

const router = express.Router();

// All routes require authentication and super admin role
router.use(authenticate);
router.use(authorize('super_admin'));

// Dashboard
router.get('/dashboard', getSuperAdminDashboard);

// Companies
router.get('/companies', getAllCompanies);
router.get('/companies/:id', getCompanyDetails);
router.put('/companies/:id/status', updateCompanyStatus);

// Subscription Plans
router.get('/plans', getSubscriptionPlans);
router.post('/plans', createSubscriptionPlan);
router.put('/plans/:id', updateSubscriptionPlan);

// Subscriptions
router.get('/subscriptions', getAllSubscriptions);
router.post('/subscriptions/assign', assignSubscription);

export default router;

