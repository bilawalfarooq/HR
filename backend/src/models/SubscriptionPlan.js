import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class SubscriptionPlan extends Model { }

SubscriptionPlan.init({
    plan_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    plan_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    max_employees: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Maximum number of employees allowed'
    },
    max_storage_gb: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        comment: 'Maximum storage in GB'
    },
    price_per_month: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    price_per_year: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of feature names'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: true,
    indexes: [
        { fields: ['plan_name'] },
        { fields: ['is_active'] }
    ]
});

export default SubscriptionPlan;

