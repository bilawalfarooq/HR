import Joi from 'joi';
import { AppError } from './errorHandler.js';

/**
 * Middleware to validate request body against Joi schema
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 * @param {String} source - Source of data to validate ('body', 'query', 'params')
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, '')
            }));

            return next(new AppError('Validation Error', 422, errors));
        }

        // Replace request data with validated value (stripped of unknown fields)
        req[source] = value;
        next();
    };
};

export default validate;
