import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class LeaveBalance extends Model { }

LeaveBalance.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT, // Float to allow half days
        defaultValue: 0
    },
    used: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    pending: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'LeaveBalance',
    tableName: 'leave_balances',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'leave_type_id', 'year']
        }
    ]
});

export default LeaveBalance;
