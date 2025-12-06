import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validator.js';
import schemas from '../utils/validationSchemas.js';

const router = express.Router();

// Public routes
router.post(
    '/register',
    validate(schemas.registerOrganizationSchema),
    authController.registerOrganization
);

router.post(
    '/login',
    validate(schemas.loginSchema),
    authController.login
);

router.post(
    '/refresh-token',
    validate(schemas.refreshTokenSchema),
    authController.refreshToken
);

// Availability check routes (public)
router.get(
    '/check-subdomain/:subdomain',
    authController.checkSubdomainAvailability
);

router.get(
    '/check-email/:email',
    authController.checkEmailAvailability
);

router.post(
    '/forgot-password',
    validate(schemas.forgotPasswordSchema),
    authController.forgotPassword
);

router.put(
    '/reset-password/:token',
    validate(schemas.resetPasswordSchema),
    authController.resetPassword
);

// Protected routes
router.get(
    '/me',
    authenticate,
    authController.getMe
);

router.put(
    '/change-password',
    authenticate,
    validate(schemas.changePasswordSchema),
    authController.changePassword
);

export default router;

