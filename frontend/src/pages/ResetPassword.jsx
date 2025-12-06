import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    LinearProgress,
    Link
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import authService from '../services/authService';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';
import { validatePasswordStrength } from '../utils/validation';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ strength: 'none', score: 0, message: '', valid: false });

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        mode: 'onChange'
    });

    const password = watch('new_password');

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        const strength = validatePasswordStrength(newPassword);
        setPasswordStrength(strength);
    };

    const getStrengthColor = (strength) => {
        switch (strength) {
            case 'strong': return 'success';
            case 'medium': return 'warning';
            case 'weak': return 'error';
            default: return 'error';
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            await authService.resetPassword(token, data.new_password);
            showSuccess('Password reset successful! Please login with your new password.');
            navigate('/login');
        } catch (err) {
            const errorMessage = extractErrorMessage(err);
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 2
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                >
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
                            Reset Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Enter your new password below.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <TextField
                                margin="normal"
                                fullWidth
                                label="New Password"
                                type={showPassword ? 'text' : 'password'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                {...register('new_password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                                    },
                                    onChange: handlePasswordChange
                                })}
                                error={!!errors.new_password}
                                helperText={errors.new_password?.message || passwordStrength.message}
                            />
                            {password && (
                                <Box sx={{ mt: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={passwordStrength.score}
                                        color={getStrengthColor(passwordStrength.strength)}
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                </Box>
                            )}
                        </Box>

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: watch('confirm_password') && (
                                    <InputAdornment position="end">
                                        {errors.confirm_password ?
                                            <ErrorIcon color="error" /> :
                                            <CheckCircle color="success" />
                                        }
                                    </InputAdornment>
                                )
                            }}
                            {...register('confirm_password', {
                                required: 'Please confirm your password',
                                validate: (val) => {
                                    if (watch('new_password') != val) {
                                        return "Your passwords do not match";
                                    }
                                }
                            })}
                            error={!!errors.confirm_password}
                            helperText={errors.confirm_password?.message}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Link component={RouterLink} to="/login" variant="body2">
                                Back to Login
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ResetPassword;
