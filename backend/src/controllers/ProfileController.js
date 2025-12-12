import { sequelize, User, Employee, Department } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Get current user profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const { user } = req;

        if (!user.employee) {
            return next(new AppError('Employee profile not found.', 404));
        }

        const employee = await Employee.findByPk(user.employee.employee_id, {
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['department_id', 'department_name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'email', 'first_name', 'last_name', 'phone', 'created_at']
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        logger.error('Error fetching profile:', error);
        next(error);
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { user } = req;
        const {
            first_name,
            last_name,
            phone,
            date_of_birth,
            gender,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relation
        } = req.body;

        if (!user.employee) {
            return next(new AppError('Employee profile not found.', 404));
        }

        await sequelize.transaction(async (t) => {
            // Update user details
            if (first_name || last_name || phone) {
                await User.update(
                    {
                        ...(first_name && { first_name }),
                        ...(last_name && { last_name }),
                        ...(phone && { phone })
                    },
                    {
                        where: { user_id: user.user_id },
                        transaction: t
                    }
                );
            }

            // Update employee details
            const updateData = {};
            if (date_of_birth) updateData.date_of_birth = date_of_birth;
            if (gender) updateData.gender = gender;
            if (address) updateData.address = address;
            if (emergency_contact_name) updateData.emergency_contact_name = emergency_contact_name;
            if (emergency_contact_phone) updateData.emergency_contact_phone = emergency_contact_phone;
            if (emergency_contact_relation) updateData.emergency_contact_relation = emergency_contact_relation;

            if (Object.keys(updateData).length > 0) {
                await Employee.update(
                    updateData,
                    {
                        where: { employee_id: user.employee.employee_id },
                        transaction: t
                    }
                );
            }
        });

        // Fetch updated profile
        const updatedEmployee = await Employee.findByPk(user.employee.employee_id, {
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['department_id', 'department_name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'email', 'first_name', 'last_name', 'phone', 'created_at']
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: updatedEmployee
        });
    } catch (error) {
        logger.error('Error updating profile:', error);
        next(error);
    }
};

/**
 * Change password
 */
export const changePassword = async (req, res, next) => {
    try {
        const { user } = req;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return next(new AppError('Current password and new password are required.', 400));
        }

        if (new_password.length < 8) {
            return next(new AppError('New password must be at least 8 characters long.', 400));
        }

        const userRecord = await User.findByPk(user.user_id);

        if (!(await userRecord.comparePassword(current_password))) {
            return next(new AppError('Current password is incorrect.', 401));
        }

        userRecord.password_hash = new_password;
        await userRecord.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully.'
        });
    } catch (error) {
        logger.error('Error changing password:', error);
        next(error);
    }
};

export default {
    getProfile,
    updateProfile,
    changePassword
};

