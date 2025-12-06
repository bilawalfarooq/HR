import sequelize, { testConnection } from './config/database.js';
import logger from './utils/logger.js';

/**
 * Test database connection and display database info
 */
const testDatabaseConnection = async () => {
    logger.info('='.repeat(50));
    logger.info('🔍 Testing Database Connection...');
    logger.info('='.repeat(50));

    try {
        // Test connection
        const isConnected = await testConnection();

        if (isConnected) {
            // Get database info
            const dbName = sequelize.config.database;
            const dbHost = sequelize.config.host;
            const dbPort = sequelize.config.port;
            const dbDialect = sequelize.config.dialect;

            logger.info('');
            logger.info('📊 Database Information:');
            logger.info(`   Database: ${dbName}`);
            logger.info(`   Host: ${dbHost}`);
            logger.info(`   Port: ${dbPort}`);
            logger.info(`   Dialect: ${dbDialect}`);
            logger.info('');

            // Test query to check tables
            try {
                const [results] = await sequelize.query('SHOW TABLES');
                logger.info(`✅ Found ${results.length} tables in database`);

                if (results.length > 0) {
                    logger.info('');
                    logger.info('📋 Tables in database:');
                    results.forEach((row, index) => {
                        const tableName = Object.values(row)[0];
                        logger.info(`   ${index + 1}. ${tableName}`);
                    });
                } else {
                    logger.warn('⚠️  No tables found. Please import database schema.');
                    logger.info('   Run: mysql -u root hrms_db < .agent/planning/database-schema.sql');
                }

                logger.info('');
                logger.info('='.repeat(50));
                logger.info('✅ Database connection test completed successfully!');
                logger.info('='.repeat(50));

            } catch (queryError) {
                logger.error('❌ Error querying tables:', queryError.message);
                logger.info('   Make sure the database exists and schema is imported.');
            }

        } else {
            logger.error('');
            logger.error('='.repeat(50));
            logger.error('❌ Database connection test failed!');
            logger.error('='.repeat(50));
            logger.error('');
            logger.error('Please check:');
            logger.error('1. XAMPP MySQL is running (green in control panel)');
            logger.error('2. Database "hrms_db" exists');
            logger.error('3. .env file has correct credentials:');
            logger.error('   DB_HOST=localhost');
            logger.error('   DB_USER=root');
            logger.error('   DB_PASSWORD= (empty for XAMPP)');
            logger.error('   DB_NAME=hrms_db');
            logger.error('');
        }

    } catch (error) {
        logger.error('❌ Unexpected error:', error.message);
        logger.error(error.stack);
    } finally {
        // Close connection
        await sequelize.close();
        logger.info('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the test
testDatabaseConnection();
