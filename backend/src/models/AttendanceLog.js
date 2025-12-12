import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class AttendanceLog extends Model { }

AttendanceLog.init({
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
        allowNull: true // Might not be identified yet if raw log
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    },
    source: {
        type: DataTypes.ENUM('BIOMETRIC', 'MOBILE', 'WEB', 'MANUAL'),
        allowNull: false
    },
    biometric_device_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    location_lat: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    location_long: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    verification_mode: {
        type: DataTypes.STRING, // e.g., 'FINGERPRINT', 'FACE', 'PASSWORD', 'CARD'
        allowNull: true
    },
    device_os: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Operating system (e.g., Windows, macOS, iOS, Android, Linux)'
    },
    device_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Device type (e.g., Desktop, Mobile, Tablet, Laptop)'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address (IPv4 or IPv6)'
    },
    device_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Unique device identifier/key for device tracking'
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User agent string for additional device/browser information'
    }
}, {
    sequelize,
    modelName: 'AttendanceLog',
    tableName: 'attendance_logs',
    timestamps: true,
    indexes: [
        {
            fields: ['employee_id', 'timestamp']
        },
        {
            fields: ['ip_address']
        },
        {
            fields: ['device_key']
        }
    ]
});

export default AttendanceLog;
