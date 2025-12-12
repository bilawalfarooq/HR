import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmployeeOnboarding = sequelize.define('EmployeeOnboarding', {
    employee_onboarding_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'organizations',
            key: 'organization_id'
        }
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'employee_id'
        }
    },
    task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'onboarding_tasks',
            key: 'task_id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'verified'),
        defaultValue: 'pending'
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'employee_onboarding',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] }
    ]
});

export default EmployeeOnboarding;
