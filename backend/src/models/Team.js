import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Team = sequelize.define('Team', {
    team_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'organizations',
            key: 'organization_id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'department_id'
        }
    },
    team_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    team_lead_id: {
        type: DataTypes.INTEGER,
        allowNull: true
        // Circular reference handled in associations
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'teams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['organization_id'] },
        { fields: ['department_id'] }
    ]
});

export default Team;
