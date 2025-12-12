import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Document extends Model { }

Document.init({
    document_id: {
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
    document_type: {
        type: DataTypes.ENUM('ID_PROOF', 'ADDRESS_PROOF', 'EDUCATION', 'EXPERIENCE', 'CONTRACT', 'OTHER'),
        allowNull: false
    },
    document_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'File size in bytes'
    },
    mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'user_id who uploaded'
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    timestamps: true,
    indexes: [
        { fields: ['organization_id', 'employee_id'] },
        { fields: ['document_type'] },
        { fields: ['is_verified'] }
    ]
});

export default Document;

