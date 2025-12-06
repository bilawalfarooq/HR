import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Organization = sequelize.define('Organization', {
    organization_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organization_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    subdomain: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    subscription_plan: {
        type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
        defaultValue: 'basic'
    },
    subscription_status: {
        type: DataTypes.ENUM('active', 'suspended', 'cancelled', 'trial'),
        defaultValue: 'trial'
    },
    subscription_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    contact_email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    settings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'organizations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['subdomain'] },
        { fields: ['subscription_status'] }
    ]
});

export default Organization;
