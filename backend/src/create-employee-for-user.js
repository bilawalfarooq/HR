import { sequelize, User, Employee, Organization, Role, Department } from './models/index.js';

const createEmployeeForUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.\n');

        const email = process.argv[2];

        if (!email) {
            console.log('Usage: node src/create-employee-for-user.js <email>');
            console.log('Example: node src/create-employee-for-user.js test_hash_debug@example.com\n');
            process.exit(1);
        }

        console.log(`Creating employee record for: ${email}\n`);

        // Find user
        const user = await User.findOne({
            where: { email },
            include: [
                { model: Role, as: 'role' },
                { model: Organization, as: 'organization' },
                { model: Employee, as: 'employee' }
            ]
        });

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log(`✅ User found:`);
        console.log(`   ID: ${user.user_id}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Organization: ${user.organization?.organization_name} (ID: ${user.organization_id})`);
        console.log(`   Role: ${user.role?.role_name}\n`);

        // Check if employee already exists
        if (user.employee) {
            console.log('✅ Employee record already exists:');
            console.log(`   Employee ID: ${user.employee.employee_id}`);
            console.log(`   Employee Code: ${user.employee.employee_code}`);
            console.log(`   Status: ${user.employee.status}\n`);
            process.exit(0);
        }

        // Get or create a default department
        let department = await Department.findOne({
            where: { organization_id: user.organization_id },
            limit: 1
        });

        if (!department) {
            console.log('Creating default department...');
            department = await Department.create({
                organization_id: user.organization_id,
                department_name: 'General',
                description: 'Default department'
            });
            console.log(`✅ Created department: ${department.department_name}\n`);
        }

        // Get the highest employee code to generate next one
        const lastEmployee = await Employee.findOne({
            where: { organization_id: user.organization_id },
            order: [['employee_id', 'DESC']],
            limit: 1
        });

        let employeeCode;
        if (lastEmployee && lastEmployee.employee_code) {
            // Extract number from employee code (e.g., EMP-0014 -> 14)
            const match = lastEmployee.employee_code.match(/\d+/);
            const lastNumber = match ? parseInt(match[0]) : 0;
            employeeCode = `EMP-${String(lastNumber + 1).padStart(4, '0')}`;
        } else {
            employeeCode = 'EMP-0001';
        }

        // Create employee record
        const employee = await Employee.create({
            organization_id: user.organization_id,
            user_id: user.user_id,
            employee_code: employeeCode,
            department_id: department.department_id,
            designation: user.role?.role_name || 'Employee',
            date_of_joining: new Date(),
            employment_type: 'full_time',
            status: 'active'
        });

        console.log('✅ Employee record created successfully!');
        console.log(`   Employee ID: ${employee.employee_id}`);
        console.log(`   Employee Code: ${employee.employee_code}`);
        console.log(`   Department: ${department.department_name}`);
        console.log(`   Status: ${employee.status}\n`);

        console.log('You can now access leave-related endpoints.\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createEmployeeForUser();

