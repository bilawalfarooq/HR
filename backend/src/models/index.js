import sequelize from '../config/database.js';
import Organization from './Organization.js';
import Role from './Role.js';
import User from './User.js';
import Department from './Department.js';
import Employee from './Employee.js';
import Team from './Team.js';
import Shift from './Shift.js';
import AttendanceLog from './AttendanceLog.js';
import AttendanceRecord from './AttendanceRecord.js';
import BiometricDevice from './BiometricDevice.js';
import LeaveType from './LeaveType.js';
import LeaveBalance from './LeaveBalance.js';
import LeaveRequest from './LeaveRequest.js';
import Holiday from './Holiday.js';
import EmployeeSchedule from './EmployeeSchedule.js';
import Timesheet from './Timesheet.js';
import TimesheetEntry from './TimesheetEntry.js';
import SalaryStructure from './SalaryStructure.js';
import Payroll from './Payroll.js';
import Payslip from './Payslip.js';
import Document from './Document.js';
import Notification from './Notification.js';
import SubscriptionPlan from './SubscriptionPlan.js';
import Subscription from './Subscription.js';
import GeoFence from './GeoFence.js';
import EmployeeGeoFence from './EmployeeGeoFence.js';
import Resignation from './Resignation.js';
import ExitInterview from './ExitInterview.js';
import FnFSettlement from './FnFSettlement.js';
import Asset from './Asset.js';
import OnboardingTask from './OnboardingTask.js';
import EmployeeOnboarding from './EmployeeOnboarding.js';

// Define associations

// Organization associations
Organization.hasMany(Role, { foreignKey: 'organization_id', as: 'roles' });
Organization.hasMany(User, { foreignKey: 'organization_id', as: 'users' });
Organization.hasMany(Department, { foreignKey: 'organization_id', as: 'departments' });
Organization.hasMany(Team, { foreignKey: 'organization_id', as: 'teams' });
Organization.hasMany(Employee, { foreignKey: 'organization_id', as: 'employees' });
Organization.hasMany(Shift, { foreignKey: 'organization_id', as: 'shifts' });
Organization.hasMany(BiometricDevice, { foreignKey: 'organization_id', as: 'biometricDevices' });
Organization.hasMany(LeaveType, { foreignKey: 'organization_id', as: 'leaveTypes' });
Organization.hasMany(Holiday, { foreignKey: 'organization_id', as: 'holidays' });
Organization.hasMany(Timesheet, { foreignKey: 'organization_id', as: 'timesheets' });
Organization.hasMany(SalaryStructure, { foreignKey: 'organization_id', as: 'salaryStructures' });
Organization.hasMany(Payroll, { foreignKey: 'organization_id', as: 'payrolls' });
Organization.hasMany(Payslip, { foreignKey: 'organization_id', as: 'payslips' });
Organization.hasMany(Document, { foreignKey: 'organization_id', as: 'documents' });
Organization.hasMany(Notification, { foreignKey: 'organization_id', as: 'notifications' });
Organization.hasOne(Subscription, { foreignKey: 'organization_id', as: 'subscription' });
Organization.hasMany(GeoFence, { foreignKey: 'organization_id', as: 'geoFences' });
Organization.hasMany(Resignation, { foreignKey: 'organization_id', as: 'resignations' });
Organization.hasMany(Asset, { foreignKey: 'organization_id', as: 'assets' });
Organization.hasMany(OnboardingTask, { foreignKey: 'organization_id', as: 'onboardingTasks' });
Organization.hasMany(FnFSettlement, { foreignKey: 'organization_id', as: 'fnfSettlements' });

// Role associations
Role.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// User associations
User.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });

// Department associations
Department.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Department.hasMany(Team, { foreignKey: 'department_id', as: 'teams' });
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });

// Team associations
Team.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Team.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Team.hasMany(Employee, { foreignKey: 'team_id', as: 'members' });
Team.belongsTo(Employee, { foreignKey: 'team_lead_id', as: 'teamLead' });

// Employee associations
Employee.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Employee.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });
Employee.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
Employee.hasMany(Employee, { foreignKey: 'manager_id', as: 'subordinates' });
Employee.belongsTo(Shift, { foreignKey: 'current_shift_id', as: 'currentShift' });
Employee.hasMany(AttendanceRecord, { foreignKey: 'employee_id', as: 'attendanceRecords' });
Employee.hasMany(AttendanceLog, { foreignKey: 'employee_id', as: 'attendanceLogs' });
Employee.hasMany(LeaveRequest, { foreignKey: 'employee_id', as: 'leaveRequests' });
Employee.hasMany(LeaveBalance, { foreignKey: 'employee_id', as: 'leaveBalances' });
Employee.hasMany(EmployeeSchedule, { foreignKey: 'employee_id', as: 'schedules' });
Employee.hasMany(Timesheet, { foreignKey: 'employee_id', as: 'timesheets' });
Employee.hasMany(SalaryStructure, { foreignKey: 'employee_id', as: 'salaryStructures' });
Employee.hasMany(Payroll, { foreignKey: 'employee_id', as: 'payrolls' });
Employee.hasMany(Payslip, { foreignKey: 'employee_id', as: 'payslips' });
Employee.hasMany(Document, { foreignKey: 'employee_id', as: 'documents' });
Employee.hasMany(Resignation, { foreignKey: 'employee_id', as: 'resignations' });
Employee.hasMany(Asset, { foreignKey: 'assigned_to', as: 'assets' });
Employee.hasMany(EmployeeOnboarding, { foreignKey: 'employee_id', as: 'onboardingProgress' });
Employee.hasMany(FnFSettlement, { foreignKey: 'employee_id', as: 'fnfSettlements' });

// Shift associations
Shift.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Shift.hasMany(Employee, { foreignKey: 'current_shift_id', as: 'employees' });
Shift.hasMany(AttendanceRecord, { foreignKey: 'shift_id', as: 'attendanceRecords' });

// Attendance Record associations
AttendanceRecord.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
AttendanceRecord.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
AttendanceRecord.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });

// Attendance Log associations
AttendanceLog.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
AttendanceLog.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
AttendanceLog.belongsTo(BiometricDevice, { foreignKey: 'biometric_device_id', as: 'biometricDevice' });

// Biometric Device associations
BiometricDevice.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
BiometricDevice.hasMany(AttendanceLog, { foreignKey: 'biometric_device_id', as: 'logs' });

// Leave Type associations
LeaveType.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// Leave Balance associations
LeaveBalance.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
LeaveBalance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leave_type_id', as: 'leaveType' });

// Leave Request associations
LeaveRequest.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leave_type_id', as: 'leaveType' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'approved_by', as: 'approver' });

// Holiday associations
Holiday.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// Employee Schedule associations
EmployeeSchedule.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
EmployeeSchedule.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
EmployeeSchedule.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });

// Timesheet associations
Timesheet.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Timesheet.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Timesheet.belongsTo(Employee, { foreignKey: 'approved_by', as: 'approver' });
Timesheet.hasMany(TimesheetEntry, { foreignKey: 'timesheet_id', as: 'entries', onDelete: 'CASCADE' });

// Timesheet Entry associations
TimesheetEntry.belongsTo(Timesheet, { foreignKey: 'timesheet_id', as: 'timesheet' });

// Salary Structure associations
SalaryStructure.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
SalaryStructure.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
SalaryStructure.hasMany(Payroll, { foreignKey: 'salary_structure_id', as: 'payrolls' });

// Payroll associations
Payroll.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Payroll.belongsTo(SalaryStructure, { foreignKey: 'salary_structure_id', as: 'salaryStructure' });
Payroll.hasOne(Payslip, { foreignKey: 'payroll_id', as: 'payslip' });

// Payslip associations
Payslip.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Payslip.belongsTo(Payroll, { foreignKey: 'payroll_id', as: 'payroll' });
Payslip.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Document associations
Document.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Document.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
Document.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

// Notification associations
Notification.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// Subscription Plan associations
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'plan_id', as: 'subscriptions' });

// Subscription associations
Subscription.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'plan_id', as: 'plan' });

// GeoFence associations
GeoFence.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
GeoFence.belongsToMany(Employee, {
    through: EmployeeGeoFence,
    foreignKey: 'geo_fence_id',
    otherKey: 'employee_id',
    as: 'employees'
});

// Employee-GeoFence associations (Many-to-Many)
Employee.belongsToMany(GeoFence, {
    through: EmployeeGeoFence,
    foreignKey: 'employee_id',
    otherKey: 'geo_fence_id',
    as: 'geoFences'
});

EmployeeGeoFence.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
EmployeeGeoFence.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
EmployeeGeoFence.belongsTo(GeoFence, { foreignKey: 'geo_fence_id', as: 'geoFence' });

// Resignation associations
Resignation.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Resignation.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Resignation.hasOne(ExitInterview, { foreignKey: 'resignation_id', as: 'exitInterview' });
Resignation.hasOne(FnFSettlement, { foreignKey: 'resignation_id', as: 'fnfSettlement' });

// Exit Interview associations
ExitInterview.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
ExitInterview.belongsTo(Resignation, { foreignKey: 'resignation_id', as: 'resignation' });

// Asset associations
Asset.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Asset.belongsTo(Employee, { foreignKey: 'assigned_to', as: 'assignedTo' });

// Onboarding associations
OnboardingTask.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
OnboardingTask.hasMany(EmployeeOnboarding, { foreignKey: 'task_id', as: 'assignments' });

EmployeeOnboarding.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
EmployeeOnboarding.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
EmployeeOnboarding.belongsTo(OnboardingTask, { foreignKey: 'task_id', as: 'task' });

// FnF associations
FnFSettlement.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
FnFSettlement.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
FnFSettlement.belongsTo(Resignation, { foreignKey: 'resignation_id', as: 'resignation' });


// Export models and sequelize instance
export {
    sequelize,
    Organization,
    Role,
    User,
    Department,
    Team,
    Employee,
    Shift,
    AttendanceLog,
    AttendanceRecord,
    BiometricDevice,
    LeaveType,
    LeaveBalance,
    LeaveRequest,
    Holiday,
    EmployeeSchedule,
    Timesheet,
    TimesheetEntry,
    SalaryStructure,
    Payroll,
    Payslip,
    Document,
    Notification,
    SubscriptionPlan,
    Subscription,
    GeoFence,
    EmployeeGeoFence,
    Resignation,
    ExitInterview,
    FnFSettlement,
    Asset,
    OnboardingTask,
    EmployeeOnboarding
};

export default {
    sequelize,
    Organization,
    Role,
    User,
    Department,
    Team,
    Employee,
    Shift,
    AttendanceLog,
    AttendanceRecord,
    BiometricDevice,
    LeaveType,
    LeaveBalance,
    LeaveRequest,
    Holiday,
    EmployeeSchedule,
    Timesheet,
    TimesheetEntry,
    SalaryStructure,
    Payroll,
    Payslip,
    Document,
    Notification,
    SubscriptionPlan,
    Subscription,
    GeoFence,
    EmployeeGeoFence,
    Resignation,
    ExitInterview,
    FnFSettlement,
    Asset,
    OnboardingTask,
    EmployeeOnboarding
};
