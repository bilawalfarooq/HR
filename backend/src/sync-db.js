import { sequelize } from './models/index.js';
import logger from './utils/logger.js';

const syncDatabase = async () => {
    try {
        logger.info('🔄 Syncing database models...');

        // Disable foreign key checks to allow circular dependencies during creation
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Sync all models
        await sequelize.sync({ alter: true });

        // Enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        logger.info('✅ All models synced successfully');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Error syncing database:', error);
        process.exit(1);
    }
};

syncDatabase();
