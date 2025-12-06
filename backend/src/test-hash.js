import { sequelize, User, Organization, Role } from './models/index.js';
import bcrypt from 'bcrypt';

const testHash = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const password = 'Of5L7n,eLqn4mc3';
        const email = 'test_hash_debug@example.com';

        // Clean up previous test
        await User.destroy({ where: { email } });

        // Create a dummy org and role if needed, or just use existing
        // For simplicity, I'll just create a user instance and save it, 
        // assuming I can bypass foreign keys or use existing ones.
        // Actually, I need valid FKs.

        const org = await Organization.findOne();
        const role = await Role.findOne();

        if (!org || !role) {
            console.log('No org or role found to test with.');
            return;
        }

        console.log(`Creating user with password: ${password}`);

        const user = await User.create({
            organization_id: org.organization_id,
            email: email,
            password_hash: password,
            first_name: 'Test',
            last_name: 'Hash',
            role_id: role.role_id,
            is_active: true
        });

        console.log(`User created. Stored Hash: ${user.password_hash}`);

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`Immediate Compare Result: ${isMatch}`);

        // Fetch from DB to be sure
        const fetchedUser = await User.findOne({ where: { email } });
        const isMatchDb = await bcrypt.compare(password, fetchedUser.password_hash);
        console.log(`DB Fetch Compare Result: ${isMatchDb}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

testHash();
