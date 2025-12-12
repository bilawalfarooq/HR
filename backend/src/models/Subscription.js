import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Subscription extends Model { }

Subscription.init({
    subscription_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    billing_cycle: {
        type: DataTypes.ENUM('MONTHLY', 'YEARLY'),
        allowNull: false,
        defaultValue: 'MONTHLY'
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'TRIAL'),
        allowNull: false,
        defaultValue: 'TRIAL'
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    trial_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'End date for trial period'
    },
    next_billing_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    payment_reference: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    auto_renew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cancellation_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true,
    indexes: [
        { fields: ['organization_id'] },
        { fields: ['plan_id'] },
        { fields: ['status'] },
        { fields: ['next_billing_date'] }
    ]
});

export default Subscription;

