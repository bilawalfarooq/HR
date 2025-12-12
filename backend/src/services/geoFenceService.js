import { GeoFence, EmployeeGeoFence, Employee } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Check if a location is within any active geo-fence for an organization
 * @param {number} organizationId - Organization ID
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} employeeId - Optional employee ID for employee-specific geo-fence validation
 * @returns {Object} { isValid: boolean, geoFence: GeoFence|null, distance: number|null }
 */
export const validateLocation = async (organizationId, latitude, longitude, employeeId = null) => {
    try {
        if (!latitude || !longitude) {
            return {
                isValid: false,
                geoFence: null,
                distance: null,
                error: 'Latitude and longitude are required'
            };
        }

        let geoFences = [];

        // If employeeId is provided, check for employee-specific geo-fences first
        if (employeeId) {
            const employeeGeoFences = await EmployeeGeoFence.findAll({
                where: {
                    organization_id: organizationId,
                    employee_id: employeeId,
                    is_active: true
                },
                include: [{
                    model: GeoFence,
                    as: 'geoFence',
                    where: {
                        is_active: true
                    },
                    required: true
                }]
            });

            if (employeeGeoFences.length > 0) {
                // Employee has specific geo-fences assigned, use only those
                geoFences = employeeGeoFences.map(egf => egf.geoFence);
                logger.info(`Found ${geoFences.length} employee-specific geo-fence(s) for employee ${employeeId}`);
            } else {
                // No employee-specific geo-fences, fall back to organization-wide geo-fences
                logger.info(`No employee-specific geo-fences found for employee ${employeeId}, checking organization-wide geo-fences`);
            }
        }

        // If no employee-specific geo-fences found, get all active geo-fences for the organization
        if (geoFences.length === 0) {
            geoFences = await GeoFence.findAll({
                where: {
                    organization_id: organizationId,
                    is_active: true
                }
            });
        }

        if (geoFences.length === 0) {
            // If no geo-fences are configured, allow the check-in
            logger.warn(`No geo-fences configured for organization ${organizationId}. Allowing check-in.`);
            return {
                isValid: true,
                geoFence: null,
                distance: null,
                message: 'No geo-fences configured. Check-in allowed.'
            };
        }

        // Check if location is within any geo-fence
        for (const geoFence of geoFences) {
            const distance = calculateDistance(
                parseFloat(geoFence.center_latitude),
                parseFloat(geoFence.center_longitude),
                parseFloat(latitude),
                parseFloat(longitude)
            );

            if (distance <= geoFence.radius_meters) {
                return {
                    isValid: true,
                    geoFence: geoFence,
                    distance: Math.round(distance),
                    message: `Location is within ${geoFence.name} (${Math.round(distance)}m away)`
                };
            }
        }

        // Location is not within any geo-fence
        const nearestFence = geoFences.reduce((nearest, fence) => {
            const distance = calculateDistance(
                parseFloat(fence.center_latitude),
                parseFloat(fence.center_longitude),
                parseFloat(latitude),
                parseFloat(longitude)
            );
            if (!nearest || distance < nearest.distance) {
                return { fence, distance };
            }
            return nearest;
        }, null);

        return {
            isValid: false,
            geoFence: null,
            distance: nearestFence ? Math.round(nearestFence.distance) : null,
            nearestFence: nearestFence ? nearestFence.fence : null,
            error: `Location is outside all geo-fences. Nearest fence is ${nearestFence ? Math.round(nearestFence.distance) : 'N/A'}m away.`
        };
    } catch (error) {
        logger.error('Error validating location:', error);
        return {
            isValid: false,
            geoFence: null,
            distance: null,
            error: 'Error validating location'
        };
    }
};

export default {
    calculateDistance,
    validateLocation
};

