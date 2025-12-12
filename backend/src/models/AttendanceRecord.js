import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class AttendanceRecord extends Model { }

AttendanceRecord.init({
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
    shift_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    check_in_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    check_out_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'HOLIDAY'),
        defaultValue: 'ABSENT'
    },
    late_duration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 0
    },
    early_exit_duration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 0
    },
    overtime_duration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 0
    },
    work_duration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'AttendanceRecord',
    tableName: 'attendance_records',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'date']
        }
    ]
});

export default AttendanceRecord;
