import { sequelize, User } from './models/index.js';
import bcrypt from 'bcrypt';

const resetPassword = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'tst@c.co';
        const newPassword = 'Of5L7n,eLqn4mc3';

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log(`Found user: ${user.email} (ID: ${user.user_id})`);

        // Update user with PLAIN TEXT password
        // The User model's beforeUpdate hook will handle the hashing automatically
        await user.update({ password_hash: newPassword });

        console.log('Password reset successfully (letting model hook handle hashing).');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

resetPassword();
