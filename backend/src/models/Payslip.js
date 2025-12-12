import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Payslip extends Model { }

Payslip.init({
    payslip_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    payroll_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    payslip_pdf_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    generated_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Payslip',
    tableName: 'payslips',
    timestamps: true,
    indexes: [
        { fields: ['organization_id', 'employee_id'] },
        { fields: ['employee_id', 'year', 'month'] },
        { fields: ['payroll_id'] }
    ]
});

export default Payslip;

