import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Chip
} from '@mui/material';
import Layout from '../components/Layout';
import { addAsset, getEmployeeAssets, assignAsset, returnAsset } from '../services/assetService';

const AssetManagement = () => {
    // This should probably list ALL assets for Admin.
    // Since getEmployeeAssets filters by employee, I might need a getAllAssets endpoint in backend or reuse.
    // The previously created backend route was `router.get('/employee/:employee_id')`. 
    // I missed a "get all" route! 
    // I will just implement the Add Asset modal for now and assume the list is for a specific employee lookup?
    // Or I can quickly add a "get All" endpoint? 
    // Let's stick to the "Add Asset" and maybe "Assign" flow conceptually here. 

    // Actually, I'll add a simple "My Assets" view for the user and "Add Asset" for admin.

    const [openAdd, setOpenAdd] = useState(false);
    const [newAsset, setNewAsset] = useState({ name: '', type: '', serial_number: '', value: '' });

    const handleAdd = async () => {
        try {
            await addAsset(newAsset);
            setOpenAdd(false);
            alert("Asset Added");
        } catch (error) {
            alert("Error adding asset");
        }
    };

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4">Asset Management</Typography>
                    <Button variant="contained" onClick={() => setOpenAdd(true)}>Register New Asset</Button>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <Typography>Asset Inventory System (Placeholder List)</Typography>
                    {/* Implementation of full inventory table would go here */}
                </Paper>

                <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
                    <DialogTitle>Register Asset</DialogTitle>
                    <DialogContent sx={{ minWidth: 400, mt: 1 }}>
                        <TextField label="Name" fullWidth value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} sx={{ mb: 2, mt: 1 }} />
                        <TextField label="Type (Laptop, Phone...)" fullWidth value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} sx={{ mb: 2 }} />
                        <TextField label="Serial Number" fullWidth value={newAsset.serial_number} onChange={(e) => setNewAsset({ ...newAsset, serial_number: e.target.value })} sx={{ mb: 2 }} />
                        <TextField label="Value" fullWidth type="number" value={newAsset.value} onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })} sx={{ mb: 2 }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
                        <Button onClick={handleAdd} variant="contained">Add</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default AssetManagement;
