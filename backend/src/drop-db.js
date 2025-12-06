import { sequelize } from './models/index.js';
import logger from './utils/logger.js';

const dropDatabase = async () => {
    try {
        logger.info('🗑️ Dropping all tables...');

        // Disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop all tables
        await sequelize.drop();

        // Enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        logger.info('✅ All tables dropped successfully');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Error dropping tables:', error);
        process.exit(1);
    }
};

dropDatabase();
