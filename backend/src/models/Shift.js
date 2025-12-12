import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Shift extends Model { }

Shift.init({
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
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    lateBuffer: {
        type: DataTypes.INTEGER,
        defaultValue: 15, // minutes
        comment: 'Grace period in minutes before marked as late'
    },
    earlyExitBuffer: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // minutes
        comment: 'Grace period in minutes allowed for early exit'
    },
    overtimeRule: {
        type: DataTypes.JSON, // Store rules like { "minDuration": 60, "rate": 1.5 }
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Shift',
    tableName: 'shifts',
    timestamps: true
});

export default Shift;
