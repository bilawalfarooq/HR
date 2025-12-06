import { sequelize, Employee, User, Department, Role } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateTokens } from '../utils/jwt.js';

/**
 * Create a new employee
 */
export const createEmployee = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            first_name,
            last_name,
            email,
            password,
            phone,
            role_id,
            department_id,
            designation,
            date_of_joining,
            employee_code,
            gender,
            date_of_birth,
            address,
            emergency_contact,
            employment_type,
            manager_id
        } = req.body;

        // Check if email already exists in this organization
        const existingUser = await User.findOne({
            where: {
                email,
                organization_id: req.organizationId
            }
        });

        if (existingUser) {
            throw new AppError('Email already exists in this organization', 409);
        }

        // Check if employee code exists
        const existingCode = await Employee.findOne({
            where: {
                employee_code,
                organization_id: req.organizationId
            }
        });

        if (existingCode) {
            throw new AppError('Employee code already exists', 409);
        }

        // Create User account
        const user = await User.create({
            organization_id: req.organizationId,
            email,
            password_hash: password,
            first_name,
            last_name,
            phone,
            role_id,
            is_active: true
        }, { transaction });

        // Create Employee record
        const employee = await Employee.create({
            organization_id: req.organizationId,
            user_id: user.user_id,
            employee_code,
            department_id,
            team_id: null, // Can be assigned later
            manager_id,
            designation,
            date_of_joining,
            date_of_birth,
            gender,
            address,
            emergency_contact,
            employment_type,
            status: 'active'
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                employee_id: employee.employee_id,
                user_id: user.user_id,
                full_name: `${first_name} ${last_name}`,
                email,
                employee_code
            }
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Get all employees (paginated)
 */
export const getAllEmployees = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { department_id, status, search } = req.query;

        const whereClause = {
            organization_id: req.organizationId
        };

        if (department_id) whereClause.department_id = department_id;
        if (status) whereClause.status = status;

        // Note: Search implementation would go here (using Op.like)

        const { count, rows } = await Employee.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['first_name', 'last_name', 'email', 'phone', 'is_active']
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['department_name']
                },
                {
                    model: Employee,
                    as: 'manager',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['first_name', 'last_name']
                    }]
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get single employee by ID
 */
export const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({
            where: {
                employee_id: id,
                organization_id: req.organizationId
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password_hash'] },
                    include: [{ model: Role, as: 'role' }]
                },
                {
                    model: Department,
                    as: 'department'
                },
                {
                    model: Employee,
                    as: 'manager',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['first_name', 'last_name']
                    }]
                }
            ]
        });

        if (!employee) {
            throw new AppError('Employee not found', 404);
        }

        res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Update employee
 */
export const updateEmployee = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const updateData = req.body;

        const employee = await Employee.findOne({
            where: {
                employee_id: id,
                organization_id: req.organizationId
            }
        });

        if (!employee) {
            throw new AppError('Employee not found', 404);
        }

        // Update User data if provided
        if (updateData.first_name || updateData.last_name || updateData.phone || updateData.role_id) {
            await User.update({
                first_name: updateData.first_name,
                last_name: updateData.last_name,
                phone: updateData.phone,
                role_id: updateData.role_id
            }, {
                where: { user_id: employee.user_id },
                transaction
            });
        }

        // Update Employee data
        await employee.update(updateData, { transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

/**
 * Delete employee (soft delete via status)
 */
export const deleteEmployee = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const employee = await Employee.findOne({
            where: {
                employee_id: id,
                organization_id: req.organizationId
            }
        });

        if (!employee) {
            throw new AppError('Employee not found', 404);
        }

        // Deactivate user
        await User.update(
            { is_active: false },
            { where: { user_id: employee.user_id }, transaction }
        );

        // Set employee status to terminated/inactive
        await employee.update(
            { status: 'inactive' },
            { transaction }
        );

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Employee deactivated successfully'
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export default {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
