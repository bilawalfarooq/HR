import { sequelize, User, Organization, Role } from './models/index.js';

const resetUserPassword = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.\n');

        const email = process.argv[2];
        const newPassword = process.argv[3] || 'Demo@123';

        if (!email) {
            console.log('Usage: node src/reset-user-password.js <email> [new_password]');
            console.log('Example: node src/reset-user-password.js test_hash_debug@example.com Demo@123\n');
            process.exit(1);
        }

        console.log(`Resetting password for: ${email}`);
        console.log(`New password: ${newPassword}\n`);

        // Find user
        const user = await User.findOne({
            where: { email },
            include: [
                { model: Role, as: 'role' },
                { model: Organization, as: 'organization' }
            ]
        });

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log(`✅ User found:`);
        console.log(`   ID: ${user.user_id}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Organization: ${user.organization?.organization_name}`);
        console.log(`   Role: ${user.role?.role_name}\n`);

        // Reset password (will be hashed by the beforeUpdate hook)
        user.password_hash = newPassword;
        await user.save();

        console.log('✅ Password reset successfully!');
        console.log(`\nYou can now login with:`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${newPassword}\n`);

        // Verify the new password
        const isMatch = await user.comparePassword(newPassword);
        if (isMatch) {
            console.log('✅ Password verification successful!');
        } else {
            console.log('⚠️  Warning: Password verification failed after reset. This should not happen.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetUserPassword();

