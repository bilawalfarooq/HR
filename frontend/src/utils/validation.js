import api from '../services/api';

/**
 * Real-time validation helpers for form fields
 * Provides instant feedback to users during registration
 */

/**
 * Check if subdomain is available
 * @param {string} subdomain - The subdomain to check
 * @returns {Promise<{available: boolean, message: string}>}
 */
export const checkSubdomainAvailability = async (subdomain) => {
    if (!subdomain || subdomain.length < 3) {
        return { available: false, message: 'Subdomain must be at least 3 characters' };
    }

    // Check format first
    const formatRegex = /^[a-z0-9-]+$/;
    if (!formatRegex.test(subdomain)) {
        return { available: false, message: 'Only lowercase letters, numbers, and hyphens allowed' };
    }

    try {
        // Call backend to check availability
        const response = await api.get(`/auth/check-subdomain/${subdomain}`);
        if (response.data.available) {
            return { available: true, message: '✓ Subdomain is available' };
        } else {
            return { available: false, message: 'Subdomain is already taken' };
        }
    } catch (error) {
        // If endpoint doesn't exist yet, just validate format
        return { available: true, message: '' };
    }
};

/**
 * Check if email is already registered
 * @param {string} email - The email to check
 * @returns {Promise<{available: boolean, message: string}>}
 */
export const checkEmailAvailability = async (email) => {
    if (!email) {
        return { available: false, message: 'Email is required' };
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
        return { available: false, message: 'Invalid email format' };
    }

    try {
        const response = await api.get(`/auth/check-email/${email}`);
        if (response.data.available) {
            return { available: true, message: '✓ Email is available' };
        } else {
            return { available: false, message: 'Email is already registered' };
        }
    } catch (error) {
        // If endpoint doesn't exist yet, just validate format
        return { available: true, message: '' };
    }
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {{valid: boolean, message: string, strength: string, score: number}}
 */
export const validatePasswordStrength = (password) => {
    if (!password) {
        return { valid: false, message: 'Password is required', strength: 'none', score: 0 };
    }

    if (password.length < 8) {
        return { valid: false, message: 'At least 8 characters required', strength: 'weak', score: 20 };
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 'weak';
    let strengthScore = 0;

    if (hasLower) strengthScore++;
    if (hasUpper) strengthScore++;
    if (hasNumber) strengthScore++;
    if (hasSpecial) strengthScore++;
    if (password.length >= 12) strengthScore++;

    // Calculate visual score (0-100)
    const score = Math.min((strengthScore / 5) * 100, 100);

    if (strengthScore >= 4) strength = 'strong';
    else if (strengthScore >= 3) strength = 'medium';

    if (!hasLower || !hasUpper || !hasNumber) {
        return {
            valid: false,
            message: 'Must contain uppercase, lowercase, and number',
            strength,
            score
        };
    }

    return {
        valid: true,
        message: `✓ ${strength.charAt(0).toUpperCase() + strength.slice(1)} password`,
        strength,
        score
    };
};

/**
 * Debounce function for real-time validation
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
export const debounce = (func, wait = 500) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Generate a strong random password
 * @param {number} length - Desired password length (default: 16)
 * @returns {string} Generated password
 */
export const generateStrongPassword = (length = 16) => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // Ensure at least one of each type for strong password
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize positions
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
};
