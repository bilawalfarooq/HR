const API_URL = 'http://localhost:5000/api/v1';
const TEST_ORG_SUBDOMAIN = `test-org-${Date.now()}`;
const TEST_EMAIL = `admin-${Date.now()}@test.com`;
const TEST_PASSWORD = 'Password123!';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

const log = (msg, color = colors.reset) => {
    console.log(`${color}${msg}${colors.reset}`);
};

const request = async (url, method, body = null, token = null) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
        status: response.status,
        data,
        ok: response.ok
    };
};

const runTests = async () => {
    log('🚀 Starting API Tests...', colors.blue);

    let accessToken = '';
    let organizationId = '';
    let employeeId = '';

    try {
        // 1. Register Organization
        log('\n1. Testing Registration...', colors.yellow);
        const registerData = {
            organization_name: 'Test Organization',
            subdomain: TEST_ORG_SUBDOMAIN,
            contact_email: 'contact@test.com',
            admin_first_name: 'Admin',
            admin_last_name: 'User',
            admin_email: TEST_EMAIL,
            admin_password: TEST_PASSWORD
        };

        const registerRes = await request(`${API_URL}/auth/register`, 'POST', registerData);

        if (registerRes.status === 201 && registerRes.data.success) {
            log('✅ Registration Successful', colors.green);
            accessToken = registerRes.data.data.tokens.accessToken;
            organizationId = registerRes.data.data.organization.id;
        } else {
            throw new Error(`Registration failed: ${JSON.stringify(registerRes.data)}`);
        }

        // 2. Login
        log('\n2. Testing Login...', colors.yellow);
        const loginRes = await request(`${API_URL}/auth/login`, 'POST', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            organization_subdomain: TEST_ORG_SUBDOMAIN
        });

        if (loginRes.status === 200 && loginRes.data.success) {
            log('✅ Login Successful', colors.green);
            accessToken = loginRes.data.data.tokens.accessToken; // Update token
        } else {
            throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
        }

        // 3. Get Me (Profile)
        log('\n3. Testing Get Profile...', colors.yellow);
        const meRes = await request(`${API_URL}/auth/me`, 'GET', null, accessToken);

        if (meRes.status === 200 && meRes.data.success) {
            log('✅ Get Profile Successful', colors.green);
            log(`   User: ${meRes.data.data.first_name} ${meRes.data.data.last_name}`);
            log(`   Role: ${meRes.data.data.role.role_name}`);
        } else {
            throw new Error(`Get profile failed: ${JSON.stringify(meRes.data)}`);
        }

        // 4. Create Employee
        log('\n4. Testing Create Employee...', colors.yellow);
        const employeeData = {
            first_name: 'John',
            last_name: 'Doe',
            email: `john-${Date.now()}@test.com`,
            password: 'Password123!',
            employee_code: `EMP-${Date.now()}`,
            date_of_joining: '2025-01-01',
            role_id: meRes.data.data.role_id, // Use admin role for now to pass FK
            employment_type: 'full_time'
        };

        const createEmpRes = await request(`${API_URL}/employees`, 'POST', employeeData, accessToken);

        if (createEmpRes.status === 201 && createEmpRes.data.success) {
            log('✅ Create Employee Successful', colors.green);
            employeeId = createEmpRes.data.data.employee_id;
        } else {
            throw new Error(`Create employee failed: ${JSON.stringify(createEmpRes.data)}`);
        }

        // 5. Get All Employees
        log('\n5. Testing Get All Employees...', colors.yellow);
        const getAllRes = await request(`${API_URL}/employees`, 'GET', null, accessToken);

        if (getAllRes.status === 200 && getAllRes.data.success) {
            log(`✅ Get All Employees Successful (Found ${getAllRes.data.pagination.total})`, colors.green);
        } else {
            throw new Error(`Get all employees failed: ${JSON.stringify(getAllRes.data)}`);
        }

        // 6. Update Employee
        log('\n6. Testing Update Employee...', colors.yellow);
        const updateRes = await request(`${API_URL}/employees/${employeeId}`, 'PUT', {
            first_name: 'Johnny',
            phone: '1234567890'
        }, accessToken);

        if (updateRes.status === 200 && updateRes.data.success) {
            log('✅ Update Employee Successful', colors.green);
        } else {
            throw new Error(`Update employee failed: ${JSON.stringify(updateRes.data)}`);
        }

        // 7. Delete Employee
        log('\n7. Testing Delete Employee...', colors.yellow);
        const deleteRes = await request(`${API_URL}/employees/${employeeId}`, 'DELETE', null, accessToken);

        if (deleteRes.status === 200 && deleteRes.data.success) {
            log('✅ Delete Employee Successful', colors.green);
        } else {
            throw new Error(`Delete employee failed: ${JSON.stringify(deleteRes.data)}`);
        }

        log('\n✨ All tests passed successfully!', colors.blue);

    } catch (error) {
        log('\n❌ Test Failed:', colors.red);
        log(`   Error: ${error.message}`, colors.red);
    }
};

runTests();
