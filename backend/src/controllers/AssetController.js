import Asset from '../models/Asset.js';
import Employee from '../models/Employee.js';

// Add new asset
export const addAsset = async (req, res) => {
    try {
        const { name, asset_code, type, serial_number, value, condition } = req.body;
        const organization_id = req.user.organization_id;

        const asset = await Asset.create({
            organization_id,
            name,
            asset_code,
            type,
            serial_number,
            value,
            condition,
            status: 'available'
        });
        res.status(201).json(asset);
    } catch (error) {
        res.status(500).json({ message: 'Error adding asset', error: error.message });
    }
};

// Assign asset
export const assignAsset = async (req, res) => {
    try {
        const { asset_id } = req.params;
        const { employee_id, assigned_date } = req.body;

        const asset = await Asset.findByPk(asset_id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        if (asset.status === 'assigned') return res.status(400).json({ message: 'Asset already assigned' });

        asset.assigned_to = employee_id;
        asset.assigned_date = assigned_date || new Date();
        asset.status = 'assigned';
        await asset.save();

        res.json(asset);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning asset', error: error.message });
    }
};

// Return asset (during offboarding)
export const returnAsset = async (req, res) => {
    try {
        const { asset_id } = req.params;
        const { condition } = req.body;

        const asset = await Asset.findByPk(asset_id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        asset.assigned_to = null;
        asset.assigned_date = null;
        asset.status = 'available';
        asset.condition = condition || asset.condition;
        await asset.save();

        res.json(asset);
    } catch (error) {
        res.status(500).json({ message: 'Error returning asset', error: error.message });
    }
};

// Get Employee Assets
export const getEmployeeAssets = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const assets = await Asset.findAll({
            where: { assigned_to: employee_id }
        });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
};
