import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getGeoFences,
    getGeoFenceById,
    createGeoFence,
    updateGeoFence,
    deleteGeoFence,
    testLocation,
    assignGeoFenceToEmployee,
    removeGeoFenceFromEmployee,
    getEmployeeGeoFences,
    getGeoFenceEmployees
} from '../controllers/GeoFenceController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// All routes require admin/HR role
router.use(authorize('admin', 'hr_manager', 'super_admin'));

// Geo-fence CRUD operations
router.get('/', getGeoFences);
router.post('/', createGeoFence);
router.post('/test-location', testLocation);

// Employee geo-fence assignment routes (must come before /:id routes)
router.post('/employees/assign', assignGeoFenceToEmployee);
router.get('/employees/:employee_id', getEmployeeGeoFences);
router.delete('/employees/:employee_id/geo-fences/:geo_fence_id', removeGeoFenceFromEmployee);
router.get('/:geo_fence_id/employees', getGeoFenceEmployees);

// Parameterized routes (must come after specific routes)
router.get('/:id', getGeoFenceById);
router.put('/:id', updateGeoFence);
router.delete('/:id', deleteGeoFence);

export default router;

