import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Resignation = sequelize.define('Resignation', {
    resignation_id: {
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
    resignation_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    notice_period_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    last_working_day: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved_by_manager', 'rejected_by_manager', 'approved_by_hr', 'withdrawn', 'completed'),
        defaultValue: 'pending'
    },
    manager_comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    hr_comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_exit_interview_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_fnf_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'resignations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] }
    ]
});

export default Resignation;
