import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OnboardingTask = sequelize.define('OnboardingTask', {
    task_id: {
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
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    required_for_department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'department_id'
        },
        comment: 'If null, applicable to all or manually assigned'
    },
    assigned_by_role: { // The role responsible for verifying this (e.g., HR, IT, Manager)
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'HR'
    },
    is_mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'onboarding_tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default OnboardingTask;
