import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FnFSettlement = sequelize.define('FnFSettlement', {
    fnf_id: {
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
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'employee_id'
        }
    },
    resignation_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null if terminated without resignation
        references: {
            model: 'resignations',
            key: 'resignation_id'
        }
    },
    settlement_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    unpaid_salary_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    leave_encashment_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    bonus_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    tax_deductions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    asset_deductions: { // Penalties for lost/damaged assets
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    other_deductions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    net_payable: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('draft', 'approved', 'paid'),
        defaultValue: 'draft'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    assets_returned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'fnf_settlements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] }
    ]
});

export default FnFSettlement;
