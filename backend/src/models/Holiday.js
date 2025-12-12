import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Holiday extends Model { }

Holiday.init({
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
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize, // Pass the sequelize instance
    modelName: 'Holiday',
    tableName: 'holidays',
    timestamps: true
});

export default Holiday;
