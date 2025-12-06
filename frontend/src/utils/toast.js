import { toast } from 'react-toastify';

/**
 * Display success toast notification
 */
export const showSuccess = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

/**
 * Display error toast notification
 */
export const showError = (message) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

/**
 * Display info toast notification
 */
export const showInfo = (message) => {
    toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

/**
 * Display warning toast notification
 */
export const showWarning = (message) => {
    toast.warning(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

/**
 * Extract user-friendly error message from error object
 * Priority order:
 * 1. API response message (exact message from backend)
 * 2. Validation errors (field-specific errors)
 * 3. Network/timeout errors
 * 4. Fallback generic message
 * 
 * @param {Error} error - The error object from API call
 * @returns {string} User-friendly error message
 */
export const extractErrorMessage = (error) => {
    // Priority 1: Check if error response has a message from API
    // This is the EXACT message from the backend
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // Priority 2: Check for validation errors (422 responses)
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(e => e.message).join(', ');
        return errorMessages || 'Validation failed. Please check your input.';
    }

    // Priority 3: Network errors
    if (error.message === 'Network Error') {
        return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Priority 4: Timeout errors
    if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
    }

    // Priority 5: Check if it's a structured error from our API interceptor
    if (error.message && typeof error.message === 'string') {
        return error.message;
    }

    // Default fallback message
    return 'An unexpected error occurred. Please try again.';
};

/**
 * Extract validation errors as an object for form display
 * @param {Error} error - The error object from API call
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const extractValidationErrors = (error) => {
    const errors = {};

    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
            if (err.field) {
                errors[err.field] = err.message;
            }
        });
    }

    return errors;
};

