import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Payroll extends Model { }

Payroll.init({
    payroll_id: {
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
    salary_structure_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 12 }
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    working_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    present_days: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false,
        defaultValue: 0
    },
    leave_days: {
        type: DataTypes.DECIMAL(4, 1),
        defaultValue: 0
    },
    overtime_hours: {
        type: DataTypes.DECIMAL(6, 2),
        defaultValue: 0
    },
    late_penalties: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    bonuses: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON object: { "Performance": 5000, "Festival": 2000 }'
    },
    adjustments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON object for manual adjustments'
    },
    basic_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    allowances: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    deductions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
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
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'processed', 'paid'),
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    transaction_reference: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Payroll',
    tableName: 'payroll',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['employee_id', 'month', 'year'] },
        { fields: ['organization_id', 'year', 'month'] },
        { fields: ['payment_status'] }
    ]
});

export default Payroll;

