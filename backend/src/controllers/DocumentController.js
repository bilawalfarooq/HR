import { Document, Employee, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.user.organization_id}-${req.user.employee.employee_id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX', 400), false);
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter
});

/**
 * Get employee documents
 */
export const getMyDocuments = async (req, res, next) => {
    try {
        const { user } = req;

        if (!user.employee) {
            return next(new AppError('Employee profile not found.', 404));
        }

        const documents = await Document.findAll({
            where: {
                employee_id: user.employee.employee_id,
                organization_id: user.organization_id
            },
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'uploader',
                    attributes: ['user_id', 'first_name', 'last_name']
                },
                {
                    model: User,
                    as: 'verifier',
                    attributes: ['user_id', 'first_name', 'last_name']
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: documents
        });
    } catch (error) {
        logger.error('Error fetching documents:', error);
        next(error);
    }
};

/**
 * Upload document
 */
export const uploadDocument = async (req, res, next) => {
    try {
        const { user } = req;
        const { document_type, document_name, description } = req.body;

        if (!req.file) {
            return next(new AppError('No file uploaded.', 400));
        }

        if (!user.employee) {
            return next(new AppError('Employee profile not found.', 404));
        }

        const document = await Document.create({
            organization_id: user.organization_id,
            employee_id: user.employee.employee_id,
            document_type: document_type || 'OTHER',
            document_name: document_name || req.file.originalname,
            file_path: req.file.path,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            description: description || null,
            uploaded_by: user.user_id
        });

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully.',
            data: document
        });
    } catch (error) {
        logger.error('Error uploading document:', error);
        next(error);
    }
};

/**
 * Download document
 */
export const downloadDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user } = req;

        const document = await Document.findByPk(id);

        if (!document) {
            return next(new AppError('Document not found.', 404));
        }

        // Check if user has access (employee or admin)
        if (document.employee_id !== user.employee?.employee_id && user.role.role_type !== 'ADMIN' && user.role.role_type !== 'HR') {
            return next(new AppError('You do not have permission to access this document.', 403));
        }

        if (!fs.existsSync(document.file_path)) {
            return next(new AppError('File not found on server.', 404));
        }

        res.download(document.file_path, document.document_name, (err) => {
            if (err) {
                logger.error('Error downloading document:', err);
                next(err);
            }
        });
    } catch (error) {
        logger.error('Error downloading document:', error);
        next(error);
    }
};

/**
 * Delete document
 */
export const deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user } = req;

        const document = await Document.findByPk(id);

        if (!document) {
            return next(new AppError('Document not found.', 404));
        }

        // Check if user has permission (employee who uploaded or admin/hr)
        if (document.employee_id !== user.employee?.employee_id && user.role.role_type !== 'ADMIN' && user.role.role_type !== 'HR') {
            return next(new AppError('You do not have permission to delete this document.', 403));
        }

        // Delete file from filesystem
        if (fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }

        await document.destroy();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully.'
        });
    } catch (error) {
        logger.error('Error deleting document:', error);
        next(error);
    }
};

export default {
    getMyDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    upload
};

