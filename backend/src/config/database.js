import { Sequelize } from 'sequelize';
import config from './config.js';
import logger from '../utils/logger.js';

// Create Sequelize instance
const sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        logging: config.database.logging,
        pool: config.database.pool,
        timezone: '+05:00', // Pakistan timezone
        define: {
            timestamps: true,
            underscored: false,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

// Test database connection
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection established successfully');
        return true;
    } catch (error) {
        logger.error('❌ Unable to connect to database:', error.message);
        return false;
    }
};

// Sync database (use with caution in production)
export const syncDatabase = async (options = {}) => {
    try {
        await sequelize.sync(options);
        logger.info('✅ Database synchronized successfully');
        return true;
    } catch (error) {
        logger.error('❌ Database sync failed:', error.message);
        return false;
    }
};

export default sequelize;
