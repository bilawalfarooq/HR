import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
    Grid,
    InputAdornment,
    IconButton,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Link,
    LinearProgress,
    Tooltip
} from '@mui/material';
import { Visibility, VisibilityOff, Business, Person, Email, Phone, LocationOn, AutoAwesome, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess, extractErrorMessage } from '../utils/toast';
import { validatePasswordStrength, generateStrongPassword } from '../utils/validation';

const steps = ['Organization Details', 'Admin Account'];

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ strength: 'none', score: 0, message: '', valid: false });

    const { register, handleSubmit, trigger, setValue, watch, formState: { errors } } = useForm({
        mode: 'onChange'
    });

    const password = watch('admin_password');

    const handleNext = async () => {
        const fieldsToValidate = activeStep === 0
            ? ['organization_name', 'subdomain', 'contact_email', 'contact_phone', 'address']
            : ['admin_first_name', 'admin_last_name', 'admin_email', 'admin_password'];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        const strength = validatePasswordStrength(newPassword);
        setPasswordStrength(strength);
    };

    const handleGeneratePassword = () => {
        const newPassword = generateStrongPassword(16);
        setValue('admin_password', newPassword);
        const strength = validatePasswordStrength(newPassword);
        setPasswordStrength(strength);
        setShowPassword(true);
        showSuccess('Strong password generated! Make sure to copy it.');
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
            await registerUser(data);
            showSuccess('Registration successful! Welcome to your dashboard.');
            navigate('/dashboard');
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
            <Container maxWidth="md">
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.98)'
                    }}
                >
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
                            Start Your Free Trial
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Create your organization account in minutes
                        </Typography>
                    </Box>

                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        {activeStep === 0 ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Organization Name *"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Business color="action" /></InputAdornment>,
                                            endAdornment: watch('organization_name') && (
                                                <InputAdornment position="end">
                                                    {errors.organization_name ?
                                                        <ErrorIcon color="error" /> :
                                                        <CheckCircle color="success" />
                                                    }
                                                </InputAdornment>
                                            )
                                        }}
                                        {...register('organization_name', { required: 'Organization name is required' })}
                                        error={!!errors.organization_name}
                                        helperText={errors.organization_name?.message}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Subdomain *"
                                        placeholder="your-company"
                                        helperText="This will be your unique URL identifier"
                                        {...register('subdomain', {
                                            required: 'Subdomain is required',
                                            pattern: {
                                                value: /^[a-z0-9-]+$/,
                                                message: "Only lowercase letters, numbers, and hyphens allowed"
                                            }
                                        })}
                                        error={!!errors.subdomain}
                                    />
                                    {errors.subdomain && <Typography variant="caption" color="error" sx={{ ml: 2 }}>{errors.subdomain.message}</Typography>}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Contact Email *"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
                                            endAdornment: watch('contact_email') && (
                                                <InputAdornment position="end">
                                                    {errors.contact_email ?
                                                        <ErrorIcon color="error" /> :
                                                        <CheckCircle color="success" />
                                                    }
                                                </InputAdornment>
                                            )
                                        }}
                                        {...register('contact_email', {
                                            required: 'Contact email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        error={!!errors.contact_email}
                                        helperText={errors.contact_email?.message}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Contact Phone *"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment>,
                                            endAdornment: watch('contact_phone') && (
                                                <InputAdornment position="end">
                                                    {errors.contact_phone ?
                                                        <ErrorIcon color="error" /> :
                                                        <CheckCircle color="success" />
                                                    }
                                                </InputAdornment>
                                            )
                                        }}
                                        {...register('contact_phone', {
                                            required: 'Contact phone is required',
                                            minLength: {
                                                value: 10,
                                                message: 'Phone number must be at least 10 digits'
                                            },
                                            maxLength: {
                                                value: 20,
                                                message: 'Phone number must not exceed 20 digits'
                                            },
                                            pattern: {
                                                value: /^[0-9+\-\s()]+$/,
                                                message: 'Invalid phone number format'
                                            }
                                        })}
                                        error={!!errors.contact_phone}
                                        helperText={errors.contact_phone?.message}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address *"
                                        multiline
                                        rows={2}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LocationOn color="action" /></InputAdornment>,
                                            endAdornment: watch('address') && (
                                                <InputAdornment position="end">
                                                    {errors.address ?
                                                        <ErrorIcon color="error" /> :
                                                        <CheckCircle color="success" />
                                                    }
                                                </InputAdornment>
                                            )
                                        }}
                                        {...register('address', {
                                            required: 'Address is required',
                                            minLength: {
                                                value: 5,
                                                message: 'Address must be at least 5 characters'
                                            },
                                            maxLength: {
                                                value: 500,
                                                message: 'Address must not exceed 500 characters'
                                            }
                                        })}
                                        error={!!errors.address}
                                        helperText={errors.address?.message}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name *"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>,
                                            endAdornment: watch('admin_first_name') && (
                                                <InputAdornment position="end">
                                                    {errors.admin_first_name ?
                                                        <ErrorIcon color="error" /> :
                                                        <CheckCircle color="success" />
                                                    }
                                                </InputAdornment>
                                            )
                                        }}
                                        {...register('admin_first_name', { required: 'First name is required' })}
                                        error={!!errors.admin_first_name}
                                        helperText={errors.admin_first_name?.message}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name *"
                                        InputProps={{
                                            endAdornment: watch('admin_last_name') && (
                                                <InputAdornment position="end">
                                                    {errors.admin_last_name ?
                                                        <ErrorIcon color="error" /> :
                                                        <CheckCircle color="success" />
                                                    }
                                                </InputAdornment>
                                            )
                                        }}
                                        {...register('admin_last_name', { required: 'Last name is required' })}
                                        error={!!errors.admin_last_name}
                                        helperText={errors.admin_last_name?.message}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Admin Email *"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
                                            endAdornment: watch('admin_email') && (
                                                <InputAdornment position="end">
                                                    {errors.admin_email ?
                                                        <ErrorIcon color="error" /> :
                                                        <CheckCircle color="success" />
                                                    }
                                                </InputAdornment>
                                            )
                                        }}
                                        {...register('admin_email', {
                                            required: 'Admin email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        error={!!errors.admin_email}
                                        helperText={errors.admin_email?.message}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ position: 'relative' }}>
                                        <TextField
                                            fullWidth
                                            label="Password *"
                                            type={showPassword ? 'text' : 'password'}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title="Generate Strong Password">
                                                            <IconButton
                                                                onClick={handleGeneratePassword}
                                                                edge="end"
                                                                sx={{ mr: 1 }}
                                                                color="primary"
                                                            >
                                                                <AutoAwesome />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            {...register('admin_password', {
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
                                            error={!!errors.admin_password}
                                            helperText={errors.admin_password?.message || passwordStrength.message}
                                        />
                                        {password && (
                                            <Box sx={{ mt: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ mr: 1 }}>
                                                        Password Strength:
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        fontWeight="bold"
                                                        color={getStrengthColor(passwordStrength.strength)}
                                                    >
                                                        {passwordStrength.strength.toUpperCase()}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={passwordStrength.score}
                                                    color={getStrengthColor(passwordStrength.strength)}
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                variant="outlined"
                            >
                                Back
                            </Button>
                            <Box sx={{ flex: '1 1 auto' }} />
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={isLoading}
                                    sx={{ minWidth: 150 }}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                                </Button>
                            ) : (
                                <Button variant="contained" onClick={handleNext}>
                                    Next
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link component={RouterLink} to="/login" variant="body2" fontWeight="bold">
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;
