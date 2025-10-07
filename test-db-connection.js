// Database connection test script
// Run with: node test-db-connection.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...\n');
    
    // Display connection parameters
    console.log('📋 Connection Parameters:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Data Source: ${process.env.DB_NAME}`);
    console.log(`   Schema: lumora`);
    console.log(`   Password: ${'*'.repeat(process.env.DB_PASSWORD?.length || 0)}\n`);

    try {
        // Test 1: Basic connection to data source
        console.log('🔗 Test 1: Basic Connection to Data Source...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME, // channelconnector
            port: process.env.DB_PORT || 3306,
            connectTimeout: 10000
        });
        console.log('✅ Basic connection successful');

        // Test 2: Simple query
        console.log('🔍 Test 2: Simple Query...');
        const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
        console.log('✅ Query successful:', rows[0]);

        // Test 3: Check if data source exists
        console.log('🔍 Test 3: Data Source Existence...');
        const [databases] = await connection.execute('SHOW DATABASES LIKE ?', [process.env.DB_NAME]);
        if (databases.length > 0) {
            console.log('✅ Data source exists');
        } else {
            console.log('❌ Data source does not exist');
        }

        // Test 4: Check if lumora schema exists
        console.log('🔍 Test 4: Lumora Schema Existence...');
        const [schemas] = await connection.execute('SHOW DATABASES LIKE ?', ['lumora']);
        if (schemas.length > 0) {
            console.log('✅ lumora schema exists');

            // Switch to lumora schema
            await connection.execute('USE lumora');

            // Test 5: Check if inquiry table exists in lumora schema
            console.log('🔍 Test 5: Table Existence in Lumora Schema...');
            try {
                const [tables] = await connection.execute('SHOW TABLES LIKE ?', ['inquiry']);
                if (tables.length > 0) {
                    console.log('✅ inquiry table exists in lumora schema');

                    // Test 6: Check table structure
                    console.log('🔍 Test 6: Table Structure...');
                    const [columns] = await connection.execute('DESCRIBE inquiry');
                    console.log('✅ Table structure:');
                    columns.forEach(col => {
                        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
                    });
                } else {
                    console.log('❌ inquiry table does not exist in lumora schema');
                    console.log('💡 Run the database setup script: mysql -u username -p channelconnector < database/setup.sql');
                }
            } catch (tableError) {
                console.log('❌ Error checking table:', tableError.message);
            }
        } else {
            console.log('❌ lumora schema does not exist');
            console.log('💡 Run the database setup script to create the lumora schema');
        }

        // Test 7: Check if stored procedure exists in lumora schema
        console.log('🔍 Test 7: Stored Procedure Existence...');
        try {
            const [procedures] = await connection.execute(
                'SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME = ?',
                ['lumora', 'insert_inquiry']
            );
            if (procedures.length > 0) {
                console.log('✅ insert_inquiry stored procedure exists in lumora schema');
            } else {
                console.log('❌ insert_inquiry stored procedure does not exist in lumora schema');
                console.log('💡 Run the database setup script to create the stored procedure');
            }
        } catch (procError) {
            console.log('❌ Error checking stored procedure:', procError.message);
        }

        await connection.end();
        console.log('\n🎉 Database connection test completed successfully!');

    } catch (error) {
        console.error('\n❌ Database connection failed:');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        console.error('   Errno:', error.errno);

        console.log('\n🔧 Troubleshooting Steps:');
        
        if (error.code === 'ETIMEDOUT') {
            console.log('   1. Check if MySQL server is running');
            console.log('   2. Verify the host IP address and port');
            console.log('   3. Check firewall settings');
            console.log('   4. Test network connectivity: ping ' + process.env.DB_HOST);
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('   1. Verify username and password');
            console.log('   2. Check user permissions');
            console.log('   3. Ensure user can connect from your IP');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('   1. Check if database "' + process.env.DB_NAME + '" exists');
            console.log('   2. Create database: CREATE DATABASE ' + process.env.DB_NAME + ';');
        } else if (error.code === 'ENOTFOUND') {
            console.log('   1. Check if the hostname is correct');
            console.log('   2. Verify DNS resolution');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   1. Check if MySQL is running on the specified port');
            console.log('   2. Verify the port number (default: 3306)');
        }
        
        console.log('\n📝 Current .env file should look like:');
        console.log('   DB_HOST=your_host_ip');
        console.log('   DB_USER=your_username');
        console.log('   DB_PASSWORD=your_password');
        console.log('   DB_NAME=lumora');
        console.log('   DB_PORT=3306');
    }
}

// Run the test
testDatabaseConnection();
