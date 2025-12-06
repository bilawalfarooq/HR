import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Role = sequelize.define('Role', {
    role_id: {
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
    role_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    role_type: {
        type: DataTypes.ENUM('super_admin', 'admin', 'team_lead', 'employee'),
        allowNull: false
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['organization_id', 'role_type'] }
    ]
});

export default Role;
