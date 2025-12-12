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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Chip,
    Alert
} from '@mui/material';
import {
    Upload,
    Download,
    Delete,
    Verified,
    PendingOutlined
} from '@mui/icons-material';
import { getMyDocuments, uploadDocument, downloadDocument, deleteDocument } from '../services/employeeService';
import { showSuccess, showError } from '../utils/toast';

const DocumentManager = () => {
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadData, setUploadData] = useState({
        document_type: 'OTHER',
        document_name: '',
        description: '',
        file: null
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await getMyDocuments();
            setDocuments(response.data);
        } catch (error) {
            showError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showError('File size must be less than 10MB');
                return;
            }
            setUploadData({
                ...uploadData,
                file,
                document_name: uploadData.document_name || file.name
            });
        }
    };

    const handleUpload = async () => {
        if (!uploadData.file) {
            showError('Please select a file');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', uploadData.file);
            formData.append('document_type', uploadData.document_type);
            formData.append('document_name', uploadData.document_name);
            if (uploadData.description) {
                formData.append('description', uploadData.description);
            }

            await uploadDocument(formData);
            showSuccess('Document uploaded successfully');
            setUploadDialogOpen(false);
            setUploadData({
                document_type: 'OTHER',
                document_name: '',
                description: '',
                file: null
            });
            fetchDocuments();
        } catch (error) {
            showError('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (id, documentName) => {
        try {
            const blob = await downloadDocument(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = documentName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            showError('Failed to download document');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await deleteDocument(id);
            showSuccess('Document deleted successfully');
            fetchDocuments();
        } catch (error) {
            showError('Failed to delete document');
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
                    Document Manager
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => setUploadDialogOpen(true)}
                >
                    Upload Document
                </Button>
            </Box>

            {documents.length === 0 ? (
                <Alert severity="info">No documents uploaded yet</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Document Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Uploaded</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.document_id}>
                                    <TableCell>{doc.document_name}</TableCell>
                                    <TableCell>
                                        <Chip label={doc.document_type.replace('_', ' ')} size="small" />
                                    </TableCell>
                                    <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                                    <TableCell>
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {doc.is_verified ? (
                                            <Chip
                                                icon={<Verified />}
                                                label="Verified"
                                                color="success"
                                                size="small"
                                            />
                                        ) : (
                                            <Chip
                                                icon={<PendingOutlined />}
                                                label="Pending"
                                                color="warning"
                                                size="small"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDownload(doc.document_id, doc.document_name)}
                                            color="primary"
                                        >
                                            <Download />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(doc.document_id)}
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

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        select
                        label="Document Type"
                        name="document_type"
                        value={uploadData.document_type}
                        onChange={(e) => setUploadData({ ...uploadData, document_type: e.target.value })}
                        sx={{ mb: 2, mt: 2 }}
                    >
                        <MenuItem value="ID_PROOF">ID Proof</MenuItem>
                        <MenuItem value="ADDRESS_PROOF">Address Proof</MenuItem>
                        <MenuItem value="EDUCATION">Education</MenuItem>
                        <MenuItem value="EXPERIENCE">Experience</MenuItem>
                        <MenuItem value="CONTRACT">Contract</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        label="Document Name"
                        name="document_name"
                        value={uploadData.document_name}
                        onChange={(e) => setUploadData({ ...uploadData, document_name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description (Optional)"
                        name="description"
                        value={uploadData.description}
                        onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<Upload />}
                    >
                        {uploadData.file ? uploadData.file.name : 'Select File'}
                        <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileSelect}
                        />
                    </Button>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploading || !uploadData.file}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DocumentManager;

