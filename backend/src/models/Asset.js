import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Asset = sequelize.define('Asset', {
    asset_id: {
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
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    asset_code: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(50), // Laptop, Phone, Key, AccessCard, etc.
        allowNull: false
    },
    serial_number: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'employees',
            key: 'employee_id'
        }
    },
    assigned_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('available', 'assigned', 'damaged', 'lost', 'maintenance'),
        defaultValue: 'available'
    },
    condition: {
        type: DataTypes.STRING,
        allowNull: true
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'assets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['organization_id'] },
        { fields: ['assigned_to'] },
        { fields: ['status'] }
    ]
});

export default Asset;
