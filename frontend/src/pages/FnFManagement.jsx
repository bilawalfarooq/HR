import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, TextField, Grid, Card, CardContent, Divider
} from '@mui/material';
import Layout from '../components/Layout';
import { generateFnF, updateFnFStatus } from '../services/fnfService';

const FnFManagement = () => {
    const [resignationId, setResignationId] = useState('');
    const [settlement, setSettlement] = useState(null);

    const handleGenerate = async () => {
        try {
            const data = await generateFnF({ resignation_id: resignationId });
            setSettlement(data);
        } catch (error) {
            alert("Error generating FnF (Ensure Resignation ID is valid)");
        }
    };

    const handlePay = async () => {
        try {
            await updateFnFStatus(settlement.fnf_id, { status: 'paid', remarks: 'Paid via Bank Transfer' });
            setSettlement({ ...settlement, status: 'paid' });
            alert("Marked as Paid");
        } catch (error) {
            alert("Error updating status");
        }
    };

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>Full & Final Settlement</Typography>

                <Paper sx={{ p: 3, mb: 4, maxWidth: 600 }}>
                    <Typography variant="h6" gutterBottom>Generate Settlement</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Resignation ID"
                            value={resignationId}
                            onChange={(e) => setResignationId(e.target.value)}
                            fullWidth
                        />
                        <Button variant="contained" onClick={handleGenerate} sx={{ minWidth: 150 }}>
                            Calculate FnF
                        </Button>
                    </Box>
                </Paper>

                {settlement && (
                    <Card sx={{ maxWidth: 800 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Settlement Summary</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography color="textSecondary">Unpaid Salary</Typography>
                                    <Typography variant="h6">${settlement.unpaid_salary_amount}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="textSecondary">Leave Encashment</Typography>
                                    <Typography variant="h6">${settlement.leave_encashment_amount}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="textSecondary">Deductions</Typography>
                                    <Typography variant="h6" color="error">-${settlement.asset_deductions}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="textSecondary">Net Payable</Typography>
                                    <Typography variant="h4" color="primary">${settlement.net_payable}</Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    disabled={settlement.status === 'paid'}
                                    onClick={handlePay}
                                >
                                    {settlement.status === 'paid' ? 'Paid' : 'Approve & Pay'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Layout>
    );
};

export default FnFManagement;
