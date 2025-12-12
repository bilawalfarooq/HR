import FnFSettlement from '../models/FnFSettlement.js';
import Resignation from '../models/Resignation.js';
import LeaveBalance from '../models/LeaveBalance.js';
import Payroll from '../models/Payroll.js';

// Generate FnF draft
export const generateFnF = async (req, res) => {
    try {
        const { resignation_id } = req.body;
        const organization_id = req.user.organization_id;

        const resignation = await Resignation.findByPk(resignation_id);
        if (!resignation) return res.status(404).json({ message: 'Resignation not found' });

        const employee_id = resignation.employee_id;

        // 1. Calculate Unpaid Salary (Mock logic: assumption is last month payroll pending)
        // In real system, this would calculate days worked in current month * daily rate
        const unpaid_salary_amount = 5000; // Mock

        // 2. Calculate Leave Encashment
        // Fetch leaves (annual)
        const leaveBalances = await LeaveBalance.findAll({ where: { employee_id } });
        // Simplified: sum all balances * fixed rate?
        // Let's assume 1 day = 200 (Mock)
        let total_leaves = 0;
        leaveBalances.forEach(lb => total_leaves += parseFloat(lb.balance));
        const leave_encashment_amount = total_leaves * 200;

        // 3. Deductions (Assets)
        const asset_deductions = 0; // Assuming assets returned fine

        const net_payable = unpaid_salary_amount + leave_encashment_amount - asset_deductions;

        const fnf = await FnFSettlement.create({
            organization_id,
            employee_id,
            resignation_id,
            settlement_date: new Date(),
            unpaid_salary_amount,
            leave_encashment_amount,
            asset_deductions,
            net_payable,
            status: 'draft'
        });

        res.status(201).json(fnf);

    } catch (error) {
        res.status(500).json({ message: 'Error generating FnF', error: error.message });
    }
};

// Approve/Pay FnF
export const updateFnFStatus = async (req, res) => {
    try {
        const { fnf_id } = req.params;
        const { status, remarks } = req.body;

        const fnf = await FnFSettlement.findByPk(fnf_id);
        if (!fnf) return res.status(404).json({ message: 'FnF Record not found' });

        fnf.status = status;
        fnf.remarks = remarks;
        await fnf.save();

        if (status === 'paid') {
            // Mark resignation as FNF completed?
            if (fnf.resignation_id) {
                const resignation = await Resignation.findByPk(fnf.resignation_id);
                if (resignation) {
                    resignation.is_fnf_completed = true;
                    resignation.status = 'completed';
                    await resignation.save();
                }
            }
        }

        res.json(fnf);
    } catch (error) {
        res.status(500).json({ message: 'Error updating FnF', error: error.message });
    }
};
