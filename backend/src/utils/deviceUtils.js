/**
 * Utility functions for extracting device information from requests
 */

/**
 * Extract IP address from request
 * Handles proxy headers (X-Forwarded-For, X-Real-IP)
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
export const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
};

/**
 * Extract device information from request headers
 * @param {Object} req - Express request object
 * @returns {Object} Device information
 */
export const getDeviceInfo = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    
    // Extract OS from user agent
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS X') || userAgent.includes('macOS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    
    // Extract device type from user agent
    let deviceType = 'Desktop';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        deviceType = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceType = 'Tablet';
    } else if (userAgent.includes('Laptop')) {
        deviceType = 'Laptop';
    }
    
    return {
        os,
        deviceType,
        userAgent,
        ipAddress: getClientIp(req)
    };
};

/**
 * Generate or extract device key from request
 * Device key can be provided by client or generated from device fingerprint
 * @param {Object} req - Express request object
 * @param {string} providedDeviceKey - Optional device key provided by client
 * @returns {string} Device key
 */
export const getDeviceKey = (req, providedDeviceKey = null) => {
    // If client provides device key, use it (for mobile apps with persistent storage)
    if (providedDeviceKey) {
        return providedDeviceKey;
    }
    
    // Otherwise, generate a device fingerprint from available information
    const deviceInfo = getDeviceInfo(req);
    const fingerprint = `${deviceInfo.os}-${deviceInfo.deviceType}-${deviceInfo.userAgent}`;
    
    // In a real implementation, you might want to hash this or use a more sophisticated fingerprinting
    // For now, return a simple identifier
    return Buffer.from(fingerprint).toString('base64').substring(0, 64);
};

export default {
    getClientIp,
    getDeviceInfo,
    getDeviceKey
};

