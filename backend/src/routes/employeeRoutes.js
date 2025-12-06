import express from 'express';
import employeeController from '../controllers/employeeController.js';
import { authenticate, authorize, checkPermission } from '../middleware/auth.js';
import validate from '../middleware/validator.js';
// import schemas from '../utils/validationSchemas.js'; // Will add employee schemas later

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List all employees
router.get(
    '/',
    checkPermission('employees', 'read'),
    employeeController.getAllEmployees
);

// Get single employee
router.get(
    '/:id',
    checkPermission('employees', 'read'),
    employeeController.getEmployeeById
);

// Create employee
router.post(
    '/',
    checkPermission('employees', 'create'),
    // validate(schemas.createEmployeeSchema),
    employeeController.createEmployee
);

// Update employee
router.put(
    '/:id',
    checkPermission('employees', 'update'),
    // validate(schemas.updateEmployeeSchema),
    employeeController.updateEmployee
);

// Delete employee
router.delete(
    '/:id',
    checkPermission('employees', 'delete'),
    employeeController.deleteEmployee
);

export default router;
