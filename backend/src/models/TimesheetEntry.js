import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class TimesheetEntry extends Model { }

TimesheetEntry.init({
    timesheet_entry_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    timesheet_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    task_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hours: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'TimesheetEntry',
    tableName: 'timesheet_entries',
    timestamps: true
});

export default TimesheetEntry;
