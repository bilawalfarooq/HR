import { sequelize, User, Organization } from './models/index.js';
import bcrypt from 'bcrypt';

const checkUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'tst@c.co';
        const users = await User.findAll({
            where: { email },
            include: [{ model: Organization, as: 'organization' }]
        });

        console.log(`Found ${users.length} users with email ${email}:`);

        for (const user of users) {
            console.log('------------------------------------------------');
            console.log(`User ID: ${user.user_id}`);
            console.log(`Organization: ${user.organization?.organization_name} (${user.organization?.subdomain})`);
            console.log(`Password Hash: ${user.password_hash}`);

            const isMatch = await bcrypt.compare('Of5L7n,eLqn4mc3', user.password_hash);
            console.log(`Password Match ('Of5L7n,eLqn4mc3'): ${isMatch}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkUser();
