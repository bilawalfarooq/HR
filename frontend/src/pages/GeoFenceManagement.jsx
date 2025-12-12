import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    LocationOn,
    CheckCircle,
    Cancel
} from '@mui/icons-material';
import {
    getGeoFences,
    createGeoFence,
    updateGeoFence,
    deleteGeoFence
} from '../services/geoFenceService';
import { showSuccess, showError } from '../utils/toast';

const GeoFenceManagement = () => {
    const [loading, setLoading] = useState(true);
    const [geoFences, setGeoFences] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFence, setSelectedFence] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        center_latitude: '',
        center_longitude: '',
        radius_meters: 100,
        address: ''
    });

    useEffect(() => {
        fetchGeoFences();
    }, []);

    const fetchGeoFences = async () => {
        try {
            setLoading(true);
            const response = await getGeoFences();
            setGeoFences(response.data);
        } catch (error) {
            showError('Failed to load geo-fences');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (fence = null) => {
        if (fence) {
            setSelectedFence(fence);
            setFormData({
                name: fence.name,
                description: fence.description || '',
                center_latitude: fence.center_latitude,
                center_longitude: fence.center_longitude,
                radius_meters: fence.radius_meters,
                address: fence.address || ''
            });
        } else {
            setSelectedFence(null);
            setFormData({
                name: '',
                description: '',
                center_latitude: '',
                center_longitude: '',
                radius_meters: 100,
                address: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedFence(null);
        setFormData({
            name: '',
            description: '',
            center_latitude: '',
            center_longitude: '',
            radius_meters: 100,
            address: ''
        });
    };

    const handleSubmit = async () => {
        try {
            if (selectedFence) {
                await updateGeoFence(selectedFence.geo_fence_id, formData);
                showSuccess('Geo-fence updated successfully');
            } else {
                await createGeoFence(formData);
                showSuccess('Geo-fence created successfully');
            }
            handleCloseDialog();
            fetchGeoFences();
        } catch (error) {
            showError('Failed to save geo-fence');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteGeoFence(selectedFence.geo_fence_id);
            showSuccess('Geo-fence deleted successfully');
            setDeleteDialogOpen(false);
            setSelectedFence(null);
            fetchGeoFences();
        } catch (error) {
            showError('Failed to delete geo-fence');
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        center_latitude: position.coords.latitude.toFixed(8),
                        center_longitude: position.coords.longitude.toFixed(8)
                    });
                },
                (error) => {
                    showError('Failed to get current location');
                }
            );
        } else {
            showError('Geolocation is not supported by your browser');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Geo-Fence Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Geo-Fence
                </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                Geo-fences define allowed locations for mobile attendance check-ins. Employees must be within the specified radius of the center point to check in successfully.
            </Alert>

            {geoFences.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" align="center">
                            No geo-fences configured. Click "Add Geo-Fence" to create one.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Center Location</TableCell>
                                <TableCell>Radius</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {geoFences.map((fence) => (
                                <TableRow key={fence.geo_fence_id}>
                                    <TableCell>{fence.name}</TableCell>
                                    <TableCell>{fence.address || 'N/A'}</TableCell>
                                    <TableCell>
                                        {parseFloat(fence.center_latitude).toFixed(6)}, {parseFloat(fence.center_longitude).toFixed(6)}
                                    </TableCell>
                                    <TableCell>{fence.radius_meters}m</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={fence.is_active ? 'Active' : 'Inactive'}
                                            color={fence.is_active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(fence)}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setSelectedFence(fence);
                                                setDeleteDialogOpen(true);
                                            }}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedFence ? 'Edit Geo-Fence' : 'Create Geo-Fence'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                        required
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Latitude"
                            type="number"
                            value={formData.center_latitude}
                            onChange={(e) => setFormData({ ...formData, center_latitude: e.target.value })}
                            required
                            inputProps={{ step: 'any', min: -90, max: 90 }}
                        />
                        <TextField
                            fullWidth
                            label="Longitude"
                            type="number"
                            value={formData.center_longitude}
                            onChange={(e) => setFormData({ ...formData, center_longitude: e.target.value })}
                            required
                            inputProps={{ step: 'any', min: -180, max: 180 }}
                        />
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<LocationOn />}
                        onClick={handleGetCurrentLocation}
                        sx={{ mb: 2 }}
                    >
                        Use Current Location
                    </Button>
                    <TextField
                        fullWidth
                        label="Radius (meters)"
                        type="number"
                        value={formData.radius_meters}
                        onChange={(e) => setFormData({ ...formData, radius_meters: parseInt(e.target.value) || 100 })}
                        required
                        inputProps={{ min: 10, max: 10000 }}
                        helperText="Radius in meters (10-10000)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.center_latitude || !formData.center_longitude}
                    >
                        {selectedFence ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Geo-Fence</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedFence?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GeoFenceManagement;

