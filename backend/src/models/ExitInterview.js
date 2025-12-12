import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExitInterview = sequelize.define('ExitInterview', {
    exit_interview_id: {
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
    resignation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'resignations',
            key: 'resignation_id'
        }
    },
    conducted_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    interview_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    reasons_for_leaving: {
        type: DataTypes.JSON, // Array of reasons selected
        allowNull: true
    },
    feedback_on_management: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    feedback_on_company_culture: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    feedback_on_job_satisfaction: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    would_recommend: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'exit_interviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['organization_id'] },
        { fields: ['resignation_id'] }
    ]
});

export default ExitInterview;
