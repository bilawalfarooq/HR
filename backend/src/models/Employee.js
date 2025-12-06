import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Employee = sequelize.define('Employee', {
    employee_id: {
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    employee_code: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'department_id'
        }
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'teams',
            key: 'team_id'
        }
    },
    manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'employees',
            key: 'employee_id'
        }
    },
    designation: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    date_of_joining: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
    },
    address: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    emergency_contact: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    employment_type: {
        type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'),
        defaultValue: 'full_time'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'terminated', 'resigned'),
        defaultValue: 'active'
    },
    termination_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['organization_id', 'employee_code'] },
        { fields: ['organization_id'] },
        { fields: ['department_id'] },
        { fields: ['team_id'] },
        { fields: ['status'] }
    ]
});

export default Employee;
