import { sequelize } from './models/index.js';
import logger from './utils/logger.js';

const migrateTimesheets = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connected.');

        // Check if timesheets table exists and its structure
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME, COLUMN_KEY 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'timesheets'
            ORDER BY ORDINAL_POSITION
        `);

        if (results.length > 0) {
            logger.info('Timesheets table exists. Checking structure...');
            
            const hasTimesheetId = results.some(col => col.COLUMN_NAME === 'timesheet_id' && col.COLUMN_KEY === 'PRI');
            const hasId = results.some(col => col.COLUMN_NAME === 'id' && col.COLUMN_KEY === 'PRI');
            
            if (hasTimesheetId && !hasId) {
                logger.info('✅ Table already has timesheet_id as primary key. No migration needed.');
            } else if (hasId && !hasTimesheetId) {
                logger.info('Table has id as primary key. Migrating to timesheet_id...');
                // Rename id to timesheet_id
                await sequelize.query(`
                    ALTER TABLE timesheets 
                    CHANGE COLUMN id timesheet_id INT AUTO_INCREMENT PRIMARY KEY
                `);
                logger.info('✅ Migrated id to timesheet_id');
            } else {
                logger.warn('Table structure is unclear. You may need to manually fix it.');
            }
        } else {
            logger.info('Timesheets table does not exist. It will be created on sync.');
        }

        // Check timesheet_entries table
        const [entryResults] = await sequelize.query(`
            SELECT COLUMN_NAME, COLUMN_KEY 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'timesheet_entries'
            ORDER BY ORDINAL_POSITION
        `);

        if (entryResults.length > 0) {
            logger.info('Timesheet_entries table exists. Checking structure...');
            
            const hasEntryId = entryResults.some(col => col.COLUMN_NAME === 'timesheet_entry_id' && col.COLUMN_KEY === 'PRI');
            const hasId = entryResults.some(col => col.COLUMN_NAME === 'id' && col.COLUMN_KEY === 'PRI');
            
            if (hasEntryId && !hasId) {
                logger.info('✅ Table already has timesheet_entry_id as primary key. No migration needed.');
            } else if (hasId && !hasEntryId) {
                logger.info('Table has id as primary key. Migrating to timesheet_entry_id...');
                await sequelize.query(`
                    ALTER TABLE timesheet_entries 
                    CHANGE COLUMN id timesheet_entry_id INT AUTO_INCREMENT PRIMARY KEY
                `);
                logger.info('✅ Migrated id to timesheet_entry_id');
            }
        } else {
            logger.info('Timesheet_entries table does not exist. It will be created on sync.');
        }

        logger.info('\n✅ Migration check completed. You can now run db:sync');
        process.exit(0);
    } catch (error) {
        logger.error('Migration error:', error);
        process.exit(1);
    }
};

migrateTimesheets();

