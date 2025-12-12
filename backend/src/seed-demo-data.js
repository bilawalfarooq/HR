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
    AttendanceLog
} from './models/index.js';
import logger from './utils/logger.js';

// Demo employee data templates
const demoEmployees = [
    // HR Department
    { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@demo.com', role_type: 'admin', designation: 'HR Manager', department: 'Human Resources' },
    { first_name: 'Michael', last_name: 'Chen', email: 'michael.chen@demo.com', role_type: 'team_lead', designation: 'HR Specialist', department: 'Human Resources' },
    { first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@demo.com', role_type: 'employee', designation: 'HR Coordinator', department: 'Human Resources' },
    
    // IT Department
    { first_name: 'David', last_name: 'Wilson', email: 'david.wilson@demo.com', role_type: 'team_lead', designation: 'IT Manager', department: 'Information Technology' },
    { first_name: 'Jessica', last_name: 'Martinez', email: 'jessica.martinez@demo.com', role_type: 'employee', designation: 'Senior Developer', department: 'Information Technology' },
    { first_name: 'James', last_name: 'Anderson', email: 'james.anderson@demo.com', role_type: 'employee', designation: 'Developer', department: 'Information Technology' },
    { first_name: 'Lisa', last_name: 'Taylor', email: 'lisa.taylor@demo.com', role_type: 'employee', designation: 'QA Engineer', department: 'Information Technology' },
    
    // Sales Department
    { first_name: 'Robert', last_name: 'Brown', email: 'robert.brown@demo.com', role_type: 'team_lead', designation: 'Sales Manager', department: 'Sales' },
    { first_name: 'Amanda', last_name: 'White', email: 'amanda.white@demo.com', role_type: 'employee', designation: 'Sales Executive', department: 'Sales' },
    { first_name: 'Christopher', last_name: 'Lee', email: 'christopher.lee@demo.com', role_type: 'employee', designation: 'Sales Representative', department: 'Sales' },
    
    // Finance Department
    { first_name: 'Patricia', last_name: 'Harris', email: 'patricia.harris@demo.com', role_type: 'team_lead', designation: 'Finance Manager', department: 'Finance' },
    { first_name: 'Daniel', last_name: 'Clark', email: 'daniel.clark@demo.com', role_type: 'employee', designation: 'Accountant', department: 'Finance' },
    { first_name: 'Jennifer', last_name: 'Lewis', email: 'jennifer.lewis@demo.com', role_type: 'employee', designation: 'Financial Analyst', department: 'Finance' },
    
    // Operations Department
    { first_name: 'Matthew', last_name: 'Walker', email: 'matthew.walker@demo.com', role_type: 'team_lead', designation: 'Operations Manager', department: 'Operations' },
    { first_name: 'Linda', last_name: 'Hall', email: 'linda.hall@demo.com', role_type: 'employee', designation: 'Operations Coordinator', department: 'Operations' },
    { first_name: 'Mark', last_name: 'Allen', email: 'mark.allen@demo.com', role_type: 'employee', designation: 'Operations Assistant', department: 'Operations' }
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

const seedDemoData = async () => {
    const transaction = await sequelize.transaction();
    
    try {
        // Get all organizations
        const organizations = await Organization.findAll({ transaction });
        
        if (organizations.length === 0) {
            logger.warn('No organizations found. Please create at least one organization first.');
            await transaction.rollback();
            process.exit(1);
        }

        logger.info(`Found ${organizations.length} organization(s). Seeding demo data...`);

        for (const org of organizations) {
            logger.info(`\nSeeding data for organization: ${org.organization_name} (ID: ${org.organization_id})`);

            // Get roles for this organization
            const roles = await Role.findAll({
                where: { organization_id: org.organization_id },
                transaction
            });

            const roleMap = {};
            roles.forEach(role => {
                roleMap[role.role_type] = role;
            });

            // 1. Create Departments
            logger.info('Creating departments...');
            const departments = {};
            const deptNames = [...new Set(demoEmployees.map(emp => emp.department))];
            
            for (const deptName of deptNames) {
                const [dept] = await Department.findOrCreate({
                    where: {
                        organization_id: org.organization_id,
                        department_name: deptName
                    },
                    defaults: {
                        organization_id: org.organization_id,
                        department_name: deptName,
                        description: `${deptName} Department`
                    },
                    transaction
                });
                departments[deptName] = dept;
            }
            logger.info(`Created ${Object.keys(departments).length} departments`);

            // 2. Create Shifts
            logger.info('Creating shifts...');
            const shifts = [];
            for (const shiftData of demoShifts) {
                const [shift] = await Shift.findOrCreate({
                    where: {
                        organization_id: org.organization_id,
                        name: shiftData.name
                    },
                    defaults: {
                        organization_id: org.organization_id,
                        ...shiftData
                    },
                    transaction
                });
                shifts.push(shift);
            }
            logger.info(`Created ${shifts.length} shifts`);

            // 3. Create Leave Types
            logger.info('Creating leave types...');
            const leaveTypes = [];
            for (const leaveTypeData of demoLeaveTypes) {
                const [leaveType] = await LeaveType.findOrCreate({
                    where: {
                        organization_id: org.organization_id,
                        name: leaveTypeData.name
                    },
                    defaults: {
                        organization_id: org.organization_id,
                        ...leaveTypeData
                    },
                    transaction
                });
                leaveTypes.push(leaveType);
            }
            logger.info(`Created ${leaveTypes.length} leave types`);

            // 4. Create Holidays
            logger.info('Creating holidays...');
            for (const holidayData of demoHolidays) {
                await Holiday.findOrCreate({
                    where: {
                        organization_id: org.organization_id,
                        date: holidayData.date.toISOString().split('T')[0]
                    },
                    defaults: {
                        organization_id: org.organization_id,
                        name: holidayData.name,
                        date: holidayData.date.toISOString().split('T')[0],
                        description: holidayData.description,
                        is_recurring: true
                    },
                    transaction
                });
            }
            logger.info(`Created ${demoHolidays.length} holidays`);

            // 5. Create Employees
            logger.info('Creating employees...');
            const createdEmployees = [];
            let employeeCounter = 1;

            for (const empData of demoEmployees) {
                // Check if user already exists
                let user = await User.findOne({
                    where: {
                        organization_id: org.organization_id,
                        email: empData.email
                    },
                    transaction
                });

                if (!user) {
                    // Get role for this employee
                    const role = roleMap[empData.role_type] || roles.find(r => r.role_type === 'employee');
                    if (!role) {
                        logger.warn(`No role found for ${empData.role_type}, skipping ${empData.email}`);
                        continue;
                    }

                    // Create user
                    user = await User.create({
                        organization_id: org.organization_id,
                        email: empData.email,
                        password_hash: 'Demo@123', // Will be hashed by hook
                        first_name: empData.first_name,
                        last_name: empData.last_name,
                        phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                        role_id: role.role_id,
                        is_active: true,
                        email_verified: true
                    }, { transaction });

                    // Create employee
                    const employeeCode = `EMP-${String(employeeCounter).padStart(4, '0')}`;
                    const department = departments[empData.department];
                    
                    const joiningDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
                    const birthDate = new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
                    
                    const employee = await Employee.create({
                        organization_id: org.organization_id,
                        user_id: user.user_id,
                        employee_code: employeeCode,
                        department_id: department.department_id,
                        designation: empData.designation,
                        date_of_joining: joiningDate.toISOString().split('T')[0],
                        date_of_birth: birthDate.toISOString().split('T')[0],
                        gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
                        employment_type: 'full_time',
                        status: 'active',
                        current_shift_id: shifts[Math.floor(Math.random() * shifts.length)].id
                    }, { transaction });

                    createdEmployees.push({ employee, user, role: empData.role_type });
                    employeeCounter++;
                } else {
                    // User exists, get their employee record
                    const employee = await Employee.findOne({
                        where: { user_id: user.user_id, organization_id: org.organization_id },
                        transaction
                    });
                    if (employee) {
                        createdEmployees.push({ employee, user, role: empData.role_type });
                    }
                }
            }

            // Set managers (first employee in each department is manager)
            const managersByDept = {};
            for (const emp of createdEmployees) {
                const deptName = demoEmployees.find(e => e.email === emp.user.email)?.department;
                if (deptName && !managersByDept[deptName] && emp.role === 'team_lead') {
                    managersByDept[deptName] = emp.employee;
                }
            }

            // Assign managers to employees
            for (const emp of createdEmployees) {
                const deptName = demoEmployees.find(e => e.email === emp.user.email)?.department;
                if (deptName && managersByDept[deptName] && emp.employee.employee_id !== managersByDept[deptName].employee_id) {
                    await emp.employee.update({
                        manager_id: managersByDept[deptName].employee_id
                    }, { transaction });
                }
            }

            logger.info(`Created/Updated ${createdEmployees.length} employees`);

            // 6. Create Leave Balances
            logger.info('Creating leave balances...');
            const currentYear = new Date().getFullYear();
            for (const employee of createdEmployees) {
                for (const leaveType of leaveTypes) {
                    const used = Math.floor(Math.random() * (leaveType.days_allowed * 0.3)); // Random used days (up to 30%)
                    await LeaveBalance.findOrCreate({
                        where: {
                            employee_id: employee.employee.employee_id,
                            leave_type_id: leaveType.id,
                            year: currentYear,
                            organization_id: org.organization_id
                        },
                        defaults: {
                            employee_id: employee.employee.employee_id,
                            leave_type_id: leaveType.id,
                            year: currentYear,
                            organization_id: org.organization_id,
                            total: leaveType.days_allowed,
                            used: used,
                            pending: 0
                        },
                        transaction
                    });
                }
            }
            logger.info(`Created leave balances for ${createdEmployees.length} employees`);

            // 7. Create Sample Leave Requests
            logger.info('Creating sample leave requests...');
            const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
            const sampleEmployees = createdEmployees.slice(0, Math.min(5, createdEmployees.length));
            
            for (const emp of sampleEmployees) {
                const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
                const startDate = new Date();
                startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
                
                const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const approver = managersByDept[Object.keys(managersByDept)[0]];

                await LeaveRequest.create({
                    organization_id: org.organization_id,
                    employee_id: emp.employee.employee_id,
                    leave_type_id: leaveType.id,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    days_count: daysCount,
                    reason: 'Personal reasons',
                    status: status,
                    approved_by: status === 'APPROVED' && approver 
                        ? approver.employee_id 
                        : null
                }, { transaction });
            }
            logger.info(`Created ${sampleEmployees.length} sample leave requests`);

            // 8. Create Sample Attendance Records (last 7 days)
            logger.info('Creating sample attendance records...');
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                for (const emp of createdEmployees.slice(0, Math.min(10, createdEmployees.length))) {
                    const shift = shifts.find(s => s.id === emp.employee.current_shift_id) || shifts[0];
                    const [startHour, startMin] = shift.startTime.split(':').map(Number);
                    const checkIn = new Date(date);
                    checkIn.setHours(startHour + Math.floor(Math.random() * 2), startMin + Math.floor(Math.random() * 30), 0);
                    
                    const [endHour, endMin] = shift.endTime.split(':').map(Number);
                    const checkOut = new Date(date);
                    checkOut.setHours(endHour + Math.floor(Math.random() * 2), endMin, 0);

                    const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT']; // More present than absent
                    const status = statuses[Math.floor(Math.random() * statuses.length)];

                    await AttendanceRecord.findOrCreate({
                        where: {
                            organization_id: org.organization_id,
                            employee_id: emp.employee.employee_id,
                            date: dateStr
                        },
                        defaults: {
                            organization_id: org.organization_id,
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
            logger.info('Created sample attendance records for last 7 days');

            logger.info(`\n✅ Successfully seeded demo data for ${org.organization_name}`);
        }

        await transaction.commit();
        logger.info('\n🎉 Demo data seeding completed successfully!');
        logger.info('\n📋 Demo credentials for all organizations:');
        logger.info('='.repeat(60));
        
        // List all created users
        for (const org of organizations) {
            const orgUsers = await User.findAll({
                where: { organization_id: org.organization_id },
                include: [{ model: Role, as: 'role' }],
                limit: 5
            });
            
            if (orgUsers.length > 0) {
                logger.info(`\nOrganization: ${org.organization_name} (${org.subdomain})`);
                logger.info('Sample users:');
                orgUsers.forEach(u => {
                    logger.info(`  - ${u.email} (${u.role?.role_name || 'N/A'})`);
                });
            }
        }
        
        logger.info('\n' + '='.repeat(60));
        logger.info('Password for all demo users: Demo@123');
        logger.info('='.repeat(60));
        process.exit(0);

    } catch (error) {
        await transaction.rollback();
        logger.error('Error seeding demo data:', error);
        console.error(error);
        process.exit(1);
    }
};

// Run the seed
seedDemoData();

