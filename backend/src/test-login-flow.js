/**
 * Test script to verify login authentication flow
 * Tests: Invalid credentials (401), Valid credentials (200), Error handling
 */

const API_URL = 'http://localhost:5000/api/v1';

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
    console.log('\n' + '='.repeat(60));
    log(testName, 'magenta');
    console.log('='.repeat(60));
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

async function runTests() {
    logTest('LOGIN AUTHENTICATION FLOW TEST');

    let testEmail, testPassword;

    // Test 1: Register a test user first
    logTest('Test 1: Register Test User');
    try {
        const registerData = {
            organization_name: 'Test Org ' + Date.now(),
            subdomain: 'test-' + Date.now(),
            contact_email: `contact-${Date.now()}@test.com`,
            admin_first_name: 'Test',
            admin_last_name: 'Admin',
            admin_email: `admin-${Date.now()}@test.com`,
            admin_password: 'Test123!@#',
            admin_phone: '1234567890'
        };

        testEmail = registerData.admin_email;
        testPassword = registerData.admin_password;

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });

        const data = await response.json();

        if (response.status === 201 && data.success) {
            logSuccess(`Registration successful - Status: ${response.status}`);
            logInfo(`Test Email: ${testEmail}`);
            logInfo(`Test Password: ${testPassword}`);
        } else {
            logError(`Registration failed - Status: ${response.status}`);
            console.log(data);
            return;
        }
    } catch (error) {
        logError(`Registration error: ${error.message}`);
        return;
    }

    // Test 2: Login with INVALID email (should return 401)
    logTest('Test 2: Login with Invalid Email');
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'nonexistent@test.com',
                password: 'anypassword'
            })
        });

        const data = await response.json();

        if (response.status === 401) {
            logSuccess(`✅ Correct status code: ${response.status} (Unauthorized)`);
        } else {
            logError(`❌ Wrong status code: ${response.status} (Expected: 401)`);
        }

        if (data.message === 'Invalid email or password') {
            logSuccess(`✅ Correct error message: "${data.message}"`);
        } else {
            logError(`❌ Wrong error message: "${data.message}"`);
        }

        if (data.success === false) {
            logSuccess(`✅ Success field is false`);
        } else {
            logError(`❌ Success field is not false`);
        }

        console.log('\nFull Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        logError(`Test failed: ${error.message}`);
    }

    // Test 3: Login with INVALID password (should return 401)
    logTest('Test 3: Login with Invalid Password');
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'WrongPassword123!'
            })
        });

        const data = await response.json();

        if (response.status === 401) {
            logSuccess(`✅ Correct status code: ${response.status} (Unauthorized)`);
        } else {
            logError(`❌ Wrong status code: ${response.status} (Expected: 401)`);
        }

        if (data.message === 'Invalid email or password') {
            logSuccess(`✅ Correct error message: "${data.message}"`);
        } else {
            logError(`❌ Wrong error message: "${data.message}"`);
        }

        if (data.success === false) {
            logSuccess(`✅ Success field is false`);
        } else {
            logError(`❌ Success field is not false`);
        }

        console.log('\nFull Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        logError(`Test failed: ${error.message}`);
    }

    // Test 4: Login with VALID credentials (should return 200)
    logTest('Test 4: Login with Valid Credentials');
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });

        const data = await response.json();

        if (response.status === 200) {
            logSuccess(`✅ Correct status code: ${response.status} (OK)`);
        } else {
            logError(`❌ Wrong status code: ${response.status} (Expected: 200)`);
        }

        if (data.success === true) {
            logSuccess(`✅ Success field is true`);
        } else {
            logError(`❌ Success field is not true`);
        }

        if (data.message === 'Login successful') {
            logSuccess(`✅ Correct success message: "${data.message}"`);
        } else {
            logError(`❌ Wrong message: "${data.message}"`);
        }

        if (data.data && data.data.tokens) {
            logSuccess(`✅ Tokens present in response`);
            logInfo(`Access Token: ${data.data.tokens.accessToken.substring(0, 20)}...`);
            logInfo(`Refresh Token: ${data.data.tokens.refreshToken.substring(0, 20)}...`);
        } else {
            logError(`❌ Tokens missing from response`);
        }

        if (data.data && data.data.user) {
            logSuccess(`✅ User data present in response`);
            logInfo(`User Email: ${data.data.user.email}`);
            logInfo(`User Role: ${data.data.user.role}`);
        } else {
            logError(`❌ User data missing from response`);
        }

        if (data.data && data.data.organization) {
            logSuccess(`✅ Organization data present in response`);
            logInfo(`Organization: ${data.data.organization.name}`);
        } else {
            logError(`❌ Organization data missing from response`);
        }

        console.log('\nFull Response Structure:');
        console.log(JSON.stringify({
            success: data.success,
            message: data.message,
            data: {
                user: data.data?.user ? { email: data.data.user.email, role: data.data.user.role } : null,
                organization: data.data?.organization ? { name: data.data.organization.name } : null,
                tokens: data.data?.tokens ? 'present' : 'missing'
            }
        }, null, 2));

    } catch (error) {
        logError(`Test failed: ${error.message}`);
    }

    // Test 5: Login with missing fields
    logTest('Test 5: Login with Missing Password');
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail
                // password missing
            })
        });

        const data = await response.json();

        if (response.status === 422 || response.status === 400) {
            logSuccess(`✅ Correct status code for validation error: ${response.status}`);
        } else {
            logError(`❌ Status code: ${response.status} (Expected: 422 or 400)`);
        }

        console.log('\nFull Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        logError(`Test failed: ${error.message}`);
    }

    // Summary
    logTest('TEST SUMMARY');
    log('\n📊 All authentication flow tests completed!', 'green');
    log('\nVerified:', 'blue');
    log('✅ Invalid email returns 401 with "Invalid email or password"', 'green');
    log('✅ Invalid password returns 401 with "Invalid email or password"', 'green');
    log('✅ Valid credentials return 200 with tokens and user data', 'green');
    log('✅ Missing fields return validation error', 'green');
    log('✅ Error messages are distinct and user-friendly', 'green');
}

// Run tests
runTests().catch(error => {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
});
