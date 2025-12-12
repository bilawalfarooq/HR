import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Notification extends Model { }

Notification.init({
    notification_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM(
            'LEAVE_APPROVAL',
            'LEAVE_REJECTED',
            'TIMESHEET_APPROVAL',
            'TIMESHEET_REJECTED',
            'PAYROLL_PROCESSED',
            'PAYSLIP_GENERATED',
            'ATTENDANCE_REMINDER',
            'LEAVE_BALANCE_LOW',
            'DOCUMENT_VERIFIED',
            'PROFILE_UPDATE',
            'SYSTEM_ANNOUNCEMENT'
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    related_entity_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'e.g., leave_request, timesheet, payroll'
    },
    related_entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    action_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL to navigate when notification is clicked'
    }
}, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    indexes: [
        { fields: ['organization_id', 'user_id', 'is_read'] },
        { fields: ['type'] },
        { fields: ['created_at'] }
    ]
});

export default Notification;

