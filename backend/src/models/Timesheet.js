import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Timesheet extends Model { }

Timesheet.init({
    timesheet_id: {
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
    week_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    week_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'),
        defaultValue: 'DRAFT'
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Timesheet',
    tableName: 'timesheets',
    timestamps: true,
    underscored: false
});

export default Timesheet;
