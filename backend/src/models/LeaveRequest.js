import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class LeaveRequest extends Model { }

LeaveRequest.init({
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
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    days_count: {
        type: DataTypes.FLOAT,
        defaultValue: 1
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'),
        defaultValue: 'PENDING'
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    documents: {
        type: DataTypes.JSON, // Array of URLs
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'LeaveRequest',
    tableName: 'leave_requests',
    timestamps: true
});

export default LeaveRequest;
