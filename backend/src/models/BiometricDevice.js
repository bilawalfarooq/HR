import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class BiometricDevice extends Model { }

BiometricDevice.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serial_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    port: {
        type: DataTypes.INTEGER,
        defaultValue: 4370 // Default ZKTeco port
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'OFFLINE'),
        defaultValue: 'ACTIVE'
    },
    last_sync: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'BiometricDevice',
    tableName: 'biometric_devices',
    timestamps: true
});

export default BiometricDevice;
