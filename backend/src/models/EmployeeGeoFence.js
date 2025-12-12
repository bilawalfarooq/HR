import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class EmployeeGeoFence extends Model { }

EmployeeGeoFence.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Organization ID for multi-tenant support'
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'employee_id'
        },
        comment: 'Employee assigned to this geo-fence'
    },
    geo_fence_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'geo_fences',
            key: 'geo_fence_id'
        },
        comment: 'Geo-fence assigned to this employee'
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this is the primary geo-fence for the employee'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this assignment is active'
    }
}, {
    sequelize,
    modelName: 'EmployeeGeoFence',
    tableName: 'employee_geo_fences',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'geo_fence_id'],
            name: 'unique_employee_geo_fence'
        },
        {
            fields: ['organization_id']
        },
        {
            fields: ['employee_id']
        },
        {
            fields: ['geo_fence_id']
        },
        {
            fields: ['is_active']
        }
    ]
});

export default EmployeeGeoFence;

