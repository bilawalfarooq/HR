import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AttendanceDashboard from './pages/AttendanceDashboard';
import AttendanceLogs from './pages/AttendanceLogs';
import ShiftManagement from './pages/ShiftManagement';
import LeaveDashboard from './pages/LeaveDashboard';
import HolidayManagement from './pages/HolidayManagement';
import RosterManagement from './pages/RosterManagement';
import TimesheetManagement from './pages/TimesheetManagement';
import PayrollManagement from './pages/PayrollManagement';
import SalaryStructure from './pages/SalaryStructure';
import StatutoryReports from './pages/StatutoryReports';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProfileUpdate from './pages/ProfileUpdate';
import DocumentManager from './pages/DocumentManager';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GeoFenceManagement from './pages/GeoFenceManagement';
import ResignationPage from './pages/ResignationPage';
import ResignationManagement from './pages/ResignationManagement';
import OnboardingPage from './pages/OnboardingPage';
import OnboardingManagement from './pages/OnboardingManagement';
import AssetManagement from './pages/AssetManagement';
import FnFManagement from './pages/FnFManagement';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8b9eff',
      dark: '#4c63d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#a378c4',
      dark: '#5a3a7a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.1)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    ...Array(20).fill('0px 25px 50px -12px rgba(0, 0, 0, 0.25)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'hr', 'super admin']}>
                    <AttendanceDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/attendance/logs"
                element={
                  <ProtectedRoute>
                    <AttendanceLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance/shifts"
                element={
                  <ProtectedRoute>
                    <ShiftManagement />
                  </ProtectedRoute>
                }
              />
              {/* Phase 4 Routes */}
              <Route
                path="/leaves"
                element={
                  <ProtectedRoute>
                    <LeaveDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/holidays"
                element={
                  <ProtectedRoute>
                    <HolidayManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roster"
                element={
                  <ProtectedRoute>
                    <RosterManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timesheets"
                element={
                  <ProtectedRoute>
                    <TimesheetManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payroll"
                element={
                  <ProtectedRoute>
                    <PayrollManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salary-structure"
                element={
                  <ProtectedRoute>
                    <SalaryStructure />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/statutory"
                element={
                  <ProtectedRoute>
                    <StatutoryReports />
                  </ProtectedRoute>
                }
              />
              {/* Phase 7 - Employee Self-Service */}
              <Route
                path="/employee/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['employee', 'team lead']}>
                    <EmployeeDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/employee/profile"
                element={
                  <ProtectedRoute>
                    <ProfileUpdate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/documents"
                element={
                  <ProtectedRoute>
                    <DocumentManager />
                  </ProtectedRoute>
                }
              />
              {/* Phase 9 - Admin Panels */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'hr', 'super admin']}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/super-admin/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['super admin']}>
                    <SuperAdminDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/geo-fences"
                element={
                  <ProtectedRoute>
                    <GeoFenceManagement />
                  </ProtectedRoute>
                }
              />
              {/* Phase 11 & 12 - Lifecycle & Assets */}
              <Route
                path="/resignation"
                element={
                  <ProtectedRoute>
                    <ResignationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resignations/manage"
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'hr', 'super admin', 'team lead', 'manager']}>
                    <ResignationManagement />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding/manage"
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'hr', 'super admin']}>
                    <OnboardingManagement />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/assets"
                element={
                  <ProtectedRoute>
                    <AssetManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payroll/fnf"
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'hr', 'super admin']}>
                    <FnFManagement />
                  </RoleProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{
              borderRadius: '12px',
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
