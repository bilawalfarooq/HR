import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class SalaryStructure extends Model { }

SalaryStructure.init({
    salary_structure_id: {
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
    basic_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    allowances: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON object: { "HRA": 5000, "DA": 3000, "TA": 2000 }'
    },
    deductions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON object: { "PF": 1800, "ESI": 500, "Tax": 2000 }'
    },
    gross_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    net_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'SalaryStructure',
    tableName: 'salary_structures',
    timestamps: true,
    indexes: [
        { fields: ['organization_id', 'employee_id'] },
        { fields: ['is_active'] },
        { fields: ['effective_from', 'effective_to'] }
    ],
    hooks: {
        beforeSave: (structure) => {
            // Calculate gross and net salary
            const basic = parseFloat(structure.basic_salary) || 0;
            const allowances = structure.allowances || {};
            const deductions = structure.deductions || {};

            // Sum allowances
            const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            
            // Sum deductions
            const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

            structure.gross_salary = basic + totalAllowances;
            structure.net_salary = structure.gross_salary - totalDeductions;
        }
    }
});

export default SalaryStructure;

