import { sequelize, User, Organization, Role } from './models/index.js';
import bcrypt from 'bcrypt';

const checkUserPassword = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = process.argv[2] || 'test_hash_debug@example.com';
        const password = process.argv[3] || 'Demo@123';

        console.log(`\nChecking user: ${email}`);
        console.log(`Testing password: ${password}\n`);

        // Find user without organization filter first
        const user = await User.findOne({
            where: { email },
            include: [
                { model: Role, as: 'role' },
                { model: Organization, as: 'organization' }
            ]
        });

        if (!user) {
            console.log('❌ User not found!');
            console.log('\nAvailable users:');
            const allUsers = await User.findAll({
                include: [{ model: Organization, as: 'organization' }],
                limit: 20
            });
            allUsers.forEach(u => {
                console.log(`  - ${u.email} (Org: ${u.organization?.organization_name || 'N/A'})`);
            });
            process.exit(1);
        }

        console.log(`✅ User found:`);
        console.log(`   ID: ${user.user_id}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Organization: ${user.organization?.organization_name} (${user.organization?.subdomain})`);
        console.log(`   Organization ID: ${user.organization_id}`);
        console.log(`   Role: ${user.role?.role_name} (${user.role?.role_type})`);
        console.log(`   Is Active: ${user.is_active}`);
        console.log(`   Password Hash: ${user.password_hash.substring(0, 20)}...`);

        // Test password comparison
        console.log('\n🔐 Testing password...');
        const isMatch = await user.comparePassword(password);
        console.log(`   Password Match: ${isMatch ? '✅ YES' : '❌ NO'}`);

        // Also test direct bcrypt compare
        const directMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`   Direct bcrypt.compare: ${directMatch ? '✅ YES' : '❌ NO'}`);

        // Show hash details
        console.log('\n📋 Hash Details:');
        console.log(`   Hash starts with: ${user.password_hash.substring(0, 7)}`);
        console.log(`   Hash length: ${user.password_hash.length}`);
        console.log(`   Expected bcrypt hash length: 60`);
        console.log(`   Is valid bcrypt hash: ${user.password_hash.startsWith('$2') ? '✅ YES' : '❌ NO'}`);

        if (!isMatch) {
            console.log('\n⚠️  Password does not match!');
            console.log('\nPossible issues:');
            console.log('  1. Password was not hashed during user creation');
            console.log('  2. Password was changed after creation');
            console.log('  3. Wrong password provided');
            
            // Try to hash the password and compare
            console.log('\n🔧 Testing manual hash...');
            const testHash = await bcrypt.hash(password, 10);
            const testMatch = await bcrypt.compare(password, testHash);
            console.log(`   New hash test: ${testMatch ? '✅ Works' : '❌ Failed'}`);
        } else {
            console.log('\n✅ Password verification successful!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUserPassword();

