import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class EmployeeSchedule extends Model { }

EmployeeSchedule.init({
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
        allowNull: true // Null if rest day? Or specific flag?
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    is_rest_day: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'EmployeeSchedule',
    tableName: 'employee_schedules',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'date']
        }
    ]
});

export default EmployeeSchedule;
