import { sequelize } from './models/index.js';
import logger from './utils/logger.js';

const dropNewTables = async () => {
    try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.query('DROP TABLE IF EXISTS employee_schedules');
        await sequelize.query('DROP TABLE IF EXISTS holidays');
        await sequelize.query('DROP TABLE IF EXISTS leave_requests');
        await sequelize.query('DROP TABLE IF EXISTS leave_balances');
        await sequelize.query('DROP TABLE IF EXISTS leave_types');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        logger.info('Dropped Phase 4 tables');
        process.exit(0);
    } catch (error) {
        logger.error('Error dropping tables:', error);
        process.exit(1);
    }
};

dropNewTables();
