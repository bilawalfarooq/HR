import {
    sequelize,
    Organization,
    Role,
    User,
    Department,
    Employee,
    Shift,
    LeaveType,
    LeaveBalance,
    LeaveRequest,
    Holiday,
    AttendanceRecord,
    AttendanceLog,
    Timesheet,
    TimesheetEntry,
    SalaryStructure,
    Payroll,
    Payslip,
    SubscriptionPlan,
    Subscription
} from './models/index.js';
import logger from './utils/logger.js';

// Test users for each role
const testUsers = [
    // Super Admin
    {
        email: 'superadmin@hrms.com',
        password: 'SuperAdmin@123',
        first_name: 'Super',
        last_name: 'Admin',
        role_type: 'super_admin',
        organization: null // Super admin doesn't belong to an organization
    },
    // Admin/HR for Demo Company
    {
        email: 'admin@demo.com',
        password: 'Admin@123',
        first_name: 'Sarah',
        last_name: 'Johnson',
        role_type: 'admin',
        organization: 'demo-corp',
        designation: 'HR Manager',
        department: 'Human Resources'
    },
    // Team Lead
    {
        email: 'teamlead@demo.com',
        password: 'TeamLead@123',
        first_name: 'Michael',
        last_name: 'Chen',
        role_type: 'team_lead',
        organization: 'demo-corp',
        designation: 'IT Manager',
        department: 'Information Technology'
    },
    // Employee
    {
        email: 'employee@demo.com',
        password: 'Employee@123',
        first_name: 'Emily',
        last_name: 'Davis',
        role_type: 'employee',
        organization: 'demo-corp',
        designation: 'Software Developer',
        department: 'Information Technology'
    },
    // Additional test users
    {
        email: 'hr@demo.com',
        password: 'HR@123',
        first_name: 'Jessica',
        last_name: 'Martinez',
        role_type: 'admin',
        organization: 'demo-corp',
        designation: 'HR Specialist',
        department: 'Human Resources'
    },
    {
        email: 'manager@demo.com',
        password: 'Manager@123',
        first_name: 'David',
        last_name: 'Wilson',
        role_type: 'team_lead',
        organization: 'demo-corp',
        designation: 'Sales Manager',
        department: 'Sales'
    },
    {
        email: 'staff@demo.com',
        password: 'Staff@123',
        first_name: 'James',
        last_name: 'Anderson',
        role_type: 'employee',
        organization: 'demo-corp',
        designation: 'Sales Executive',
        department: 'Sales'
    }
];

// Demo shifts
const demoShifts = [
    { name: 'Morning Shift', startTime: '09:00:00', endTime: '17:00:00', lateBuffer: 15 },
    { name: 'Afternoon Shift', startTime: '13:00:00', endTime: '21:00:00', lateBuffer: 15 },
    { name: 'Night Shift', startTime: '21:00:00', endTime: '05:00:00', lateBuffer: 30 },
    { name: 'Flexible Hours', startTime: '08:00:00', endTime: '16:00:00', lateBuffer: 30 }
];

// Demo leave types
const demoLeaveTypes = [
    { name: 'Annual Leave', days_allowed: 20, description: 'Annual vacation leave' },
    { name: 'Sick Leave', days_allowed: 10, description: 'Medical leave' },
    { name: 'Casual Leave', days_allowed: 7, description: 'Personal matters' },
    { name: 'Maternity Leave', days_allowed: 90, description: 'Maternity leave' },
    { name: 'Paternity Leave', days_allowed: 7, description: 'Paternity leave' }
];

// Demo holidays
const demoHolidays = [
    { name: 'New Year', date: new Date(new Date().getFullYear(), 0, 1), description: 'New Year Day' },
    { name: 'Independence Day', date: new Date(new Date().getFullYear(), 6, 4), description: 'Independence Day' },
    { name: 'Christmas', date: new Date(new Date().getFullYear(), 11, 25), description: 'Christmas Day' },
    { name: 'Thanksgiving', date: new Date(new Date().getFullYear(), 10, 23), description: 'Thanksgiving Day' }
];

const resetAndSeed = async () => {
    try {
        logger.info('🗑️  Step 1: Dropping all tables...');
        
        // Disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // Drop all tables
        await sequelize.drop();
        
        // Enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        
        logger.info('✅ All tables dropped successfully');
        
        logger.info('🔄 Step 2: Creating all tables...');
        
        // Sync all models (create tables) - must be done outside transaction
        await sequelize.sync({ force: false, alter: false });
        
        logger.info('✅ All tables created successfully');
        
        logger.info('📦 Step 3: Seeding initial data...');
        
        // Start transaction for data seeding
        const transaction = await sequelize.transaction();
        
        // 1. Create Subscription Plans
        logger.info('Creating subscription plans...');
        const plans = await SubscriptionPlan.bulkCreate([
            {
                plan_name: 'Free',
                max_employees: 5,
                max_storage_gb: 1,
                price_per_month: 0,
                price_per_year: 0,
                features: JSON.stringify(['basic_hr', 'attendance', 'leaves'])
            },
            {
                plan_name: 'Basic',
                max_employees: 50,
                max_storage_gb: 10,
                price_per_month: 49.99,
                price_per_year: 499.99,
                features: JSON.stringify(['basic_hr', 'attendance', 'leaves', 'payroll', 'reports'])
            },
            {
                plan_name: 'Premium',
                max_employees: 200,
                max_storage_gb: 50,
                price_per_month: 149.99,
                price_per_year: 1499.99,
                features: JSON.stringify(['all_features', 'advanced_reports', 'api_access', 'priority_support'])
            },
            {
                plan_name: 'Enterprise',
                max_employees: -1,
                max_storage_gb: -1,
                price_per_month: 499.99,
                price_per_year: 4999.99,
                features: JSON.stringify(['all_features', 'custom_integrations', 'dedicated_support', 'sla'])
            }
        ], { transaction });
        logger.info(`✅ Created ${plans.length} subscription plans`);
        
        // 2. Create Demo Organization
        logger.info('Creating demo organization...');
        const demoOrg = await Organization.create({
            organization_name: 'Demo Corporation',
            subdomain: 'demo-corp',
            subscription_plan: 'premium',
            subscription_status: 'active',
            contact_email: 'admin@demo.com',
            contact_phone: '+1-555-0100',
            address: '123 Business Street, City, State 12345',
            settings: JSON.stringify({ timezone: 'America/New_York', currency: 'USD' })
        }, { transaction });
        logger.info(`✅ Created organization: ${demoOrg.organization_name}`);
        
        // 3. Create Subscription for Demo Org
        const premiumPlan = plans.find(p => p.plan_name === 'Premium');
        if (premiumPlan) {
            await Subscription.create({
                organization_id: demoOrg.organization_id,
                plan_id: premiumPlan.plan_id,
                status: 'ACTIVE',
                start_date: new Date(),
                end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            }, { transaction });
        }
        
        // 4. Create Roles for Demo Organization
        logger.info('Creating roles...');
        const roles = await Role.bulkCreate([
            {
                organization_id: demoOrg.organization_id,
                role_name: 'Super Admin',
                role_type: 'super_admin',
                permissions: JSON.stringify(['all'])
            },
            {
                organization_id: demoOrg.organization_id,
                role_name: 'Admin',
                role_type: 'admin',
                permissions: JSON.stringify(['manage_employees', 'manage_attendance', 'manage_payroll', 'manage_leaves', 'view_reports'])
            },
            {
                organization_id: demoOrg.organization_id,
                role_name: 'HR',
                role_type: 'hr',
                permissions: JSON.stringify(['manage_employees', 'manage_attendance', 'manage_leaves', 'view_reports'])
            },
            {
                organization_id: demoOrg.organization_id,
                role_name: 'Team Lead',
                role_type: 'team_lead',
                permissions: JSON.stringify(['view_team_attendance', 'approve_leaves', 'view_team_reports'])
            },
            {
                organization_id: demoOrg.organization_id,
                role_name: 'Employee',
                role_type: 'employee',
                permissions: JSON.stringify(['view_own_attendance', 'apply_leaves', 'view_own_payroll'])
            }
        ], { transaction });
        
        const roleMap = {};
        roles.forEach(role => {
            roleMap[role.role_type] = role;
        });
        logger.info(`✅ Created ${roles.length} roles`);
        
        // 5. Create Super Admin (use demo org for now, but with super_admin role)
        logger.info('Creating super admin...');
        const superAdminRole = roleMap['super_admin'];
        
        const superAdminUser = await User.create({
            organization_id: demoOrg.organization_id,
            email: 'superadmin@hrms.com',
            password_hash: 'SuperAdmin@123', // Will be hashed by User model hook
            first_name: 'Super',
            last_name: 'Admin',
            phone: '+1-555-0000',
            role_id: superAdminRole.role_id,
            is_active: true,
            email_verified: true
        }, { transaction });
        logger.info('✅ Created super admin user');
        
        // 6. Create Departments
        logger.info('Creating departments...');
        const departments = {};
        const deptNames = ['Human Resources', 'Information Technology', 'Sales', 'Finance', 'Operations'];
        
        for (const deptName of deptNames) {
            const dept = await Department.create({
                organization_id: demoOrg.organization_id,
                department_name: deptName,
                description: `${deptName} Department`
            }, { transaction });
            departments[deptName] = dept;
        }
        logger.info(`✅ Created ${Object.keys(departments).length} departments`);
        
        // 7. Create Shifts
        logger.info('Creating shifts...');
        const shifts = [];
        for (const shiftData of demoShifts) {
            const shift = await Shift.create({
                organization_id: demoOrg.organization_id,
                ...shiftData
            }, { transaction });
            shifts.push(shift);
        }
        logger.info(`✅ Created ${shifts.length} shifts`);
        
        // 8. Create Leave Types
        logger.info('Creating leave types...');
        const leaveTypes = [];
        for (const leaveTypeData of demoLeaveTypes) {
            const leaveType = await LeaveType.create({
                organization_id: demoOrg.organization_id,
                ...leaveTypeData
            }, { transaction });
            leaveTypes.push(leaveType);
        }
        logger.info(`✅ Created ${leaveTypes.length} leave types`);
        
        // 9. Create Holidays
        logger.info('Creating holidays...');
        for (const holidayData of demoHolidays) {
            await Holiday.create({
                organization_id: demoOrg.organization_id,
                name: holidayData.name,
                date: holidayData.date.toISOString().split('T')[0],
                description: holidayData.description,
                is_recurring: true
            }, { transaction });
        }
        logger.info(`✅ Created ${demoHolidays.length} holidays`);
        
        // 10. Create Test Users and Employees
        logger.info('Creating test users and employees...');
        const createdUsers = [];
        let employeeCounter = 1;
        
        for (const userData of testUsers) {
            if (!userData.organization) continue; // Skip super admin (already created)
            
            const role = roleMap[userData.role_type];
            if (!role) {
                logger.warn(`Role ${userData.role_type} not found, skipping ${userData.email}`);
                continue;
            }
            
            // Create user
            const user = await User.create({
                organization_id: demoOrg.organization_id,
                email: userData.email,
                password_hash: userData.password, // Will be hashed by User model hook
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                role_id: role.role_id,
                is_active: true,
                email_verified: true
            }, { transaction });
            
            // Create employee
            const employeeCode = `EMP-${String(employeeCounter).padStart(4, '0')}`;
            const department = departments[userData.department];
            const joiningDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
            const birthDate = new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
            
            const employee = await Employee.create({
                organization_id: demoOrg.organization_id,
                user_id: user.user_id,
                employee_code: employeeCode,
                department_id: department.department_id,
                designation: userData.designation,
                date_of_joining: joiningDate.toISOString().split('T')[0],
                date_of_birth: birthDate.toISOString().split('T')[0],
                gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
                employment_type: 'full_time',
                status: 'active',
                current_shift_id: shifts[0].id
            }, { transaction });
            
            createdUsers.push({ user, employee, role: userData.role_type, password: userData.password });
            employeeCounter++;
        }
        logger.info(`✅ Created ${createdUsers.length} test users with employees`);
        
        // 11. Create Leave Balances
        logger.info('Creating leave balances...');
        const currentYear = new Date().getFullYear();
        for (const { employee } of createdUsers) {
            for (const leaveType of leaveTypes) {
                const used = Math.floor(Math.random() * (leaveType.days_allowed * 0.3));
                await LeaveBalance.create({
                    employee_id: employee.employee_id,
                    leave_type_id: leaveType.id,
                    year: currentYear,
                    organization_id: demoOrg.organization_id,
                    total: leaveType.days_allowed,
                    used: used,
                    pending: 0
                }, { transaction });
            }
        }
        logger.info(`✅ Created leave balances`);
        
        // 12. Create Sample Leave Requests
        logger.info('Creating sample leave requests...');
        const sampleEmployees = createdUsers.slice(0, 3);
        for (const emp of sampleEmployees) {
            const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
            
            const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            await LeaveRequest.create({
                organization_id: demoOrg.organization_id,
                employee_id: emp.employee.employee_id,
                leave_type_id: leaveType.id,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                days_count: daysCount,
                reason: 'Personal reasons',
                status: status
            }, { transaction });
        }
        logger.info(`✅ Created sample leave requests`);
        
        // 13. Create Sample Attendance Records (last 30 days)
        logger.info('Creating sample attendance records...');
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            for (const emp of createdUsers) {
                const shift = shifts[0];
                const [startHour, startMin] = shift.startTime.split(':').map(Number);
                const checkIn = new Date(date);
                checkIn.setHours(startHour + Math.floor(Math.random() * 2), startMin + Math.floor(Math.random() * 30), 0);
                
                const [endHour, endMin] = shift.endTime.split(':').map(Number);
                const checkOut = new Date(date);
                checkOut.setHours(endHour + Math.floor(Math.random() * 2), endMin, 0);
                
                const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                
                await AttendanceRecord.findOrCreate({
                    where: {
                        organization_id: demoOrg.organization_id,
                        employee_id: emp.employee.employee_id,
                        date: dateStr
                    },
                    defaults: {
                        organization_id: demoOrg.organization_id,
                        employee_id: emp.employee.employee_id,
                        shift_id: shift.id,
                        date: dateStr,
                        check_in_time: status !== 'ABSENT' ? checkIn : null,
                        check_out_time: status === 'PRESENT' ? checkOut : null,
                        status: status,
                        late_duration: status === 'LATE' ? Math.floor(Math.random() * 30) : 0,
                        overtime_duration: status === 'PRESENT' ? Math.floor(Math.random() * 60) : 0
                    },
                    transaction
                });
            }
        }
        logger.info(`✅ Created sample attendance records for last 30 days`);
        
        // 14. Create Sample Salary Structures
        logger.info('Creating sample salary structures...');
        for (const emp of createdUsers) {
            const baseSalary = 50000 + Math.floor(Math.random() * 100000);
            await SalaryStructure.create({
                organization_id: demoOrg.organization_id,
                employee_id: emp.employee.employee_id,
                base_salary: baseSalary,
                allowances: JSON.stringify({
                    housing: baseSalary * 0.1,
                    transport: 5000,
                    medical: 3000
                }),
                deductions: JSON.stringify({
                    tax: baseSalary * 0.15,
                    provident_fund: baseSalary * 0.12
                }),
                effective_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                is_active: true
            }, { transaction });
        }
        logger.info(`✅ Created salary structures`);
        
        await transaction.commit();
        
        // Print login credentials
        logger.info('\n' + '='.repeat(80));
        logger.info('🎉 DATABASE RESET AND SEEDING COMPLETED SUCCESSFULLY!');
        logger.info('='.repeat(80));
        logger.info('\n📋 LOGIN CREDENTIALS:');
        logger.info('='.repeat(80));
        logger.info('\n🔴 SUPER ADMIN:');
        logger.info('   Email: superadmin@hrms.com');
        logger.info('   Password: SuperAdmin@123');
        logger.info('   Organization: None (Super Admin)');
        logger.info('\n🟢 ADMIN/HR USERS:');
        logger.info('   Email: admin@demo.com');
        logger.info('   Password: Admin@123');
        logger.info('   Organization: demo-corp');
        logger.info('   Role: Admin');
        logger.info('\n   Email: hr@demo.com');
        logger.info('   Password: HR@123');
        logger.info('   Organization: demo-corp');
        logger.info('   Role: HR');
        logger.info('\n🟡 TEAM LEAD USERS:');
        logger.info('   Email: teamlead@demo.com');
        logger.info('   Password: TeamLead@123');
        logger.info('   Organization: demo-corp');
        logger.info('   Role: Team Lead');
        logger.info('\n   Email: manager@demo.com');
        logger.info('   Password: Manager@123');
        logger.info('   Organization: demo-corp');
        logger.info('   Role: Team Lead');
        logger.info('\n🔵 EMPLOYEE USERS:');
        logger.info('   Email: employee@demo.com');
        logger.info('   Password: Employee@123');
        logger.info('   Organization: demo-corp');
        logger.info('   Role: Employee');
        logger.info('\n   Email: staff@demo.com');
        logger.info('   Password: Staff@123');
        logger.info('   Organization: demo-corp');
        logger.info('   Role: Employee');
        logger.info('\n' + '='.repeat(80));
        logger.info('📝 NOTE: All users belong to organization "demo-corp"');
        logger.info('   You can use the subdomain "demo-corp" during login (optional)');
        logger.info('='.repeat(80) + '\n');
        
        process.exit(0);
        
    } catch (error) {
        await transaction.rollback();
        logger.error('❌ Error resetting and seeding database:', error);
        console.error(error);
        process.exit(1);
    }
};

// Run the reset and seed
resetAndSeed();

