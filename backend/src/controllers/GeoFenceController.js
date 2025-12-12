import { GeoFence, EmployeeGeoFence, Employee, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

/**
 * Get all geo-fences for organization
 */
export const getGeoFences = async (req, res, next) => {
    try {
        const { organization_id } = req.user;
        const { is_active } = req.query;

        const where = { organization_id };
        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }

        const geoFences = await GeoFence.findAll({
            where,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: geoFences
        });
    } catch (error) {
        logger.error('Error fetching geo-fences:', error);
        next(error);
    }
};

/**
 * Get geo-fence by ID
 */
export const getGeoFenceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organization_id } = req.user;

        const geoFence = await GeoFence.findOne({
            where: {
                geo_fence_id: id,
                organization_id
            }
        });

        if (!geoFence) {
            return next(new AppError('Geo-fence not found', 404));
        }

        res.status(200).json({
            success: true,
            data: geoFence
        });
    } catch (error) {
        logger.error('Error fetching geo-fence:', error);
        next(error);
    }
};

/**
 * Create geo-fence
 */
export const createGeoFence = async (req, res, next) => {
    try {
        const { organization_id } = req.user;
        const {
            name,
            description,
            center_latitude,
            center_longitude,
            radius_meters,
            address
        } = req.body;

        // Validate coordinates
        if (!center_latitude || !center_longitude) {
            return next(new AppError('Center latitude and longitude are required', 400));
        }

        if (center_latitude < -90 || center_latitude > 90) {
            return next(new AppError('Invalid latitude. Must be between -90 and 90', 400));
        }

        if (center_longitude < -180 || center_longitude > 180) {
            return next(new AppError('Invalid longitude. Must be between -180 and 180', 400));
        }

        if (radius_meters && (radius_meters < 10 || radius_meters > 10000)) {
            return next(new AppError('Radius must be between 10 and 10000 meters', 400));
        }

        const geoFence = await GeoFence.create({
            organization_id,
            name,
            description,
            center_latitude: parseFloat(center_latitude),
            center_longitude: parseFloat(center_longitude),
            radius_meters: radius_meters || 100,
            address
        });

        res.status(201).json({
            success: true,
            message: 'Geo-fence created successfully',
            data: geoFence
        });
    } catch (error) {
        logger.error('Error creating geo-fence:', error);
        next(error);
    }
};

/**
 * Update geo-fence
 */
export const updateGeoFence = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organization_id } = req.user;
        const updateData = req.body;

        const geoFence = await GeoFence.findOne({
            where: {
                geo_fence_id: id,
                organization_id
            }
        });

        if (!geoFence) {
            return next(new AppError('Geo-fence not found', 404));
        }

        // Validate coordinates if provided
        if (updateData.center_latitude !== undefined) {
            if (updateData.center_latitude < -90 || updateData.center_latitude > 90) {
                return next(new AppError('Invalid latitude. Must be between -90 and 90', 400));
            }
            updateData.center_latitude = parseFloat(updateData.center_latitude);
        }

        if (updateData.center_longitude !== undefined) {
            if (updateData.center_longitude < -180 || updateData.center_longitude > 180) {
                return next(new AppError('Invalid longitude. Must be between -180 and 180', 400));
            }
            updateData.center_longitude = parseFloat(updateData.center_longitude);
        }

        if (updateData.radius_meters !== undefined) {
            if (updateData.radius_meters < 10 || updateData.radius_meters > 10000) {
                return next(new AppError('Radius must be between 10 and 10000 meters', 400));
            }
        }

        await geoFence.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Geo-fence updated successfully',
            data: geoFence
        });
    } catch (error) {
        logger.error('Error updating geo-fence:', error);
        next(error);
    }
};

/**
 * Delete geo-fence
 */
export const deleteGeoFence = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organization_id } = req.user;

        const geoFence = await GeoFence.findOne({
            where: {
                geo_fence_id: id,
                organization_id
            }
        });

        if (!geoFence) {
            return next(new AppError('Geo-fence not found', 404));
        }

        await geoFence.destroy();

        res.status(200).json({
            success: true,
            message: 'Geo-fence deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting geo-fence:', error);
        next(error);
    }
};

/**
 * Test location against geo-fences
 */
export const testLocation = async (req, res, next) => {
    try {
        const { organization_id } = req.user;
        const { latitude, longitude, employee_id } = req.body;

        if (!latitude || !longitude) {
            return next(new AppError('Latitude and longitude are required', 400));
        }

        const { validateLocation } = await import('../services/geoFenceService.js');
        const validation = await validateLocation(organization_id, latitude, longitude, employee_id || null);

        res.status(200).json({
            success: true,
            data: validation
        });
    } catch (error) {
        logger.error('Error testing location:', error);
        next(error);
    }
};

/**
 * Assign geo-fence(s) to employee(s)
 */
export const assignGeoFenceToEmployee = async (req, res, next) => {
    try {
        const { organization_id } = req.user;
        const { employee_id, geo_fence_ids, is_primary } = req.body;

        if (!employee_id) {
            return next(new AppError('Employee ID is required', 400));
        }

        if (!geo_fence_ids || !Array.isArray(geo_fence_ids) || geo_fence_ids.length === 0) {
            return next(new AppError('At least one geo-fence ID is required', 400));
        }

        // Verify employee belongs to organization
        const employee = await Employee.findOne({
            where: {
                employee_id,
                organization_id
            }
        });

        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }

        // Verify all geo-fences belong to organization
        const geoFences = await GeoFence.findAll({
            where: {
                geo_fence_id: { [Op.in]: geo_fence_ids },
                organization_id
            }
        });

        if (geoFences.length !== geo_fence_ids.length) {
            return next(new AppError('One or more geo-fences not found', 404));
        }

        // If setting primary, unset other primary assignments for this employee
        if (is_primary) {
            await EmployeeGeoFence.update(
                { is_primary: false },
                {
                    where: {
                        employee_id,
                        organization_id
                    }
                }
            );
        }

        // Create assignments
        const assignments = [];
        for (const geo_fence_id of geo_fence_ids) {
            const [assignment, created] = await EmployeeGeoFence.findOrCreate({
                where: {
                    employee_id,
                    geo_fence_id,
                    organization_id
                },
                defaults: {
                    employee_id,
                    geo_fence_id,
                    organization_id,
                    is_primary: is_primary && geo_fence_ids.indexOf(geo_fence_id) === 0, // First one is primary if is_primary is true
                    is_active: true
                }
            });

            if (!created) {
                // Update existing assignment
                await assignment.update({
                    is_primary: is_primary && geo_fence_ids.indexOf(geo_fence_id) === 0,
                    is_active: true
                });
            }

            assignments.push(assignment);
        }

        res.status(200).json({
            success: true,
            message: 'Geo-fence(s) assigned to employee successfully',
            data: assignments
        });
    } catch (error) {
        logger.error('Error assigning geo-fence to employee:', error);
        next(error);
    }
};

/**
 * Remove geo-fence assignment from employee
 */
export const removeGeoFenceFromEmployee = async (req, res, next) => {
    try {
        const { organization_id } = req.user;
        const { employee_id, geo_fence_id } = req.params;

        if (!employee_id || !geo_fence_id) {
            return next(new AppError('Employee ID and Geo-fence ID are required', 400));
        }

        // Verify employee belongs to organization
        const employee = await Employee.findOne({
            where: {
                employee_id,
                organization_id
            }
        });

        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }

        // Find and delete assignment
        const assignment = await EmployeeGeoFence.findOne({
            where: {
                employee_id,
                geo_fence_id,
                organization_id
            }
        });

        if (!assignment) {
            return next(new AppError('Geo-fence assignment not found', 404));
        }

        await assignment.destroy();

        res.status(200).json({
            success: true,
            message: 'Geo-fence assignment removed successfully'
        });
    } catch (error) {
        logger.error('Error removing geo-fence from employee:', error);
        next(error);
    }
};

/**
 * Get all geo-fences assigned to an employee
 */
export const getEmployeeGeoFences = async (req, res, next) => {
    try {
        const { organization_id } = req.user;
        const { employee_id } = req.params;

        if (!employee_id) {
            return next(new AppError('Employee ID is required', 400));
        }

        // Verify employee belongs to organization
        const employee = await Employee.findOne({
            where: {
                employee_id,
                organization_id
            }
        });

        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }

        // Get all geo-fence assignments for employee
        const assignments = await EmployeeGeoFence.findAll({
            where: {
                employee_id,
                organization_id
            },
            include: [{
                model: GeoFence,
                as: 'geoFence',
                required: true
            }],
            order: [['is_primary', 'DESC'], ['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        logger.error('Error fetching employee geo-fences:', error);
        next(error);
    }
};

/**
 * Get all employees assigned to a geo-fence
 */
export const getGeoFenceEmployees = async (req, res, next) => {
    try {
        const { organization_id } = req.user;
        const { geo_fence_id } = req.params;

        if (!geo_fence_id) {
            return next(new AppError('Geo-fence ID is required', 400));
        }

        // Verify geo-fence belongs to organization
        const geoFence = await GeoFence.findOne({
            where: {
                geo_fence_id,
                organization_id
            }
        });

        if (!geoFence) {
            return next(new AppError('Geo-fence not found', 404));
        }

        // Get all employee assignments for geo-fence
        const assignments = await EmployeeGeoFence.findAll({
            where: {
                geo_fence_id,
                organization_id
            },
            include: [{
                model: Employee,
                as: 'employee',
                required: true,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['first_name', 'last_name', 'email']
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        logger.error('Error fetching geo-fence employees:', error);
        next(error);
    }
};

export default {
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
};

