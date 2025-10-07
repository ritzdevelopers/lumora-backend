const mysql = require('mysql2/promise');
const os = require('os');
require('dotenv').config();

const ccDB = process.env.DB_NAME || "YOUR_DATABASE_NAME";
const lumoraDB = "lumora";

class DatabaseConnectionManager {
    constructor() {
        this.pools = new Map();
    }

    /**
     * Get pool configuration for database
     * @param {string} database
     * @returns {object}
     */
    getPoolConfig(database = lumoraDB) {
        // Calculate optimal pool size based on CPU cores
        const cpuCount = os.cpus().length;
        const asyncIOFactor = 2;
        const baseConnections = cpuCount * (1 + asyncIOFactor);

        // For smaller applications, use a reasonable minimum
        const connectionLimit = Math.max(baseConnections, 10);

        return {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: database,
            port: process.env.DB_PORT || 3306,
            connectionLimit: connectionLimit,
            maxIdle: Math.floor(connectionLimit * 0.5),
            idleTimeout: 60000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            connectTimeout: 50000,
            waitForConnections: true,
            namedPlaceholders: true,
            dateStrings: true,
            ssl: false
        };
    }

    /**
     * Initialize connection pool for database
     * @param {string} database
     * @returns {object}
     */
    async initializePool(database = lumoraDB) {
        if (this.pools.has(database)) {
            return this.pools.get(database);
        }

        try {
            const pool = mysql.createPool(this.getPoolConfig(database));

            // Add pool error handler
            pool.on('error', (err) => {
                console.error('Unexpected error on idle client', err);
            });

            this.pools.set(database, pool);
            return pool;
        } catch (error) {
            console.error('Error initializing pool:', error);
            throw error;
        }
    }

    /**
     * Execute stored procedure
     * @param {string} procedureName
     * @param {array} paramArray
     * @param {string} database
     * @returns {object}
     */
    async executeProcedure(procedureName, paramArray, database = lumoraDB) {
        let connection;
        try {
            const pool = await this.initializePool(database);
            connection = await pool.getConnection();

            const sql = `CALL ${procedureName}(${paramArray.map(() => '?').join(', ')})`;
            const [result] = await connection.query(sql, paramArray);
            return result;
        } catch (error) {
            console.error(`Error executing procedure '${procedureName}':`, error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.release();
                } catch (error) {
                    console.error('Error releasing connection:', error);
                }
            }
        }
    }

    /**
     * Execute SQL query
     * @param {string} sqlString
     * @param {array} paramArray
     * @param {string} database
     * @returns {object}
     */
    async execute(sqlString, paramArray = [], database = lumoraDB) {
        let connection;
        try {
            const pool = await this.initializePool(database);
            connection = await pool.getConnection();

            const [result] = await connection.execute(sqlString, paramArray, { timeout: 30000 });
            return result;
        } catch (error) {
            console.error("Error executing query:", error.message);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.release();
                } catch (error) {
                    console.error('Error releasing connection:', error);
                }
            }
        }
    }

    /**
     * Get a connection from the pool
     * @param {string} database
     * @returns {object}
     */
    async getConnection(database = lumoraDB) {
        try {
            const pool = await this.initializePool(database);
            return await pool.getConnection();
        } catch (error) {
            console.error("Error getting connection:", error.message);
            throw error;
        }
    }

    /**
     * Close all pools
     */
    async closeAllPools() {
        for (const [database, pool] of this.pools.entries()) {
            try {
                await pool.end();
                this.pools.delete(database);
            } catch (error) {
                console.error(`Error closing pool for database ${database}:`, error);
            }
        }
    }
}

// Test the connection
const testConnection = async () => {
    console.log('🔍 Testing database connection...');
    console.log(`📍 Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
    console.log(`👤 User: ${process.env.DB_USER}`);
    console.log(`🗄️  Data source: ${ccDB}`);
    console.log(`🗄️  Schema: ${lumoraDB}`);

    try {
        const dbManager = new DatabaseConnectionManager();
        const connection = await dbManager.getConnection(lumoraDB);
        console.log('✅ Connected to MySQL Database with connection pool');

        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Database query test successful');

        connection.release();
    } catch (err) {
        console.error('❌ DB connection failed:', err.message);
        console.error('🔧 Error code:', err.code);

        // Provide specific troubleshooting tips
        if (err.code === 'ETIMEDOUT') {
            console.log('💡 Troubleshooting tips:');
            console.log('   - Check if the database server is running');
            console.log('   - Verify the host IP address and port');
            console.log('   - Check firewall settings');
            console.log('   - Ensure network connectivity');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Troubleshooting tips:');
            console.log('   - Check username and password');
            console.log('   - Verify user has access to the database');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 Troubleshooting tips:');
            console.log('   - Check if the lumora schema exists');
            console.log('   - Verify schema name spelling');
        }

        console.log('⚠️  Server will continue running, but database operations will fail');
    }
};

testConnection();

// Create and export a single instance
const dbManager = new DatabaseConnectionManager();
module.exports = dbManager;