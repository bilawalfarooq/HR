import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class LeaveType extends Model { }

LeaveType.init({
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    days_allowed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    carry_forward: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    max_carry_forward: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    requires_approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'LeaveType',
    tableName: 'hrms_leave_types',
    timestamps: true
});

export default LeaveType;
