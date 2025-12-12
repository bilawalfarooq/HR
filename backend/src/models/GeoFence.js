import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class GeoFence extends Model { }

GeoFence.init({
    geo_fence_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Name of the geo-fence location (e.g., "Main Office", "Branch Office")'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    center_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
        comment: 'Center point latitude'
    },
    center_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
        comment: 'Center point longitude'
    },
    radius_meters: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        comment: 'Radius in meters for the geo-fence'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    address: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Human-readable address'
    }
}, {
    sequelize,
    modelName: 'GeoFence',
    tableName: 'geo_fences',
    timestamps: true,
    indexes: [
        { fields: ['organization_id'] },
        { fields: ['is_active'] }
    ]
});

export default GeoFence;

