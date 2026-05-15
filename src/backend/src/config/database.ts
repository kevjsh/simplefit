import { Sequelize } from 'sequelize'
import { logger } from '../helpers/logger.helper'

try {
    process.loadEnvFile();
} catch (error) {
    logger.info("No .env file found.");
}

const dbName = process.env.SIMPLEFIT_DB as string
const dbUser = process.env.SIMPLEFIT_DB_USER as string
const dbPassword = process.env.SIMPLEFIT_DB_PASS as string
const dbHost = process.env.SIMPLEFIT_HOST as string
const dbPort = 3306;

// Create new sequelize instance
export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    timezone: '-06:00' // Costa Rica
})

export const connectDB = async (): Promise<void> => {

    try {
        await sequelize.authenticate()
        logger.info('Connected to Mysql database')

        await sequelize.sync();
        logger.info('Synced models');

    } catch (error) {
        logger.debug(`Error connecting to Mysql database ${error}`)
        process.exit(1)
    }
}