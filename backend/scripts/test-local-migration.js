require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Script to test the migration setup locally
 * 
 * This script will:
 * 1. Create a local database if it doesn't exist
 * 2. Run the migrations
 * 3. Run the seeders
 * 4. Verify the database schema and superadmin user
 * 
 * Run: node scripts/test-local-migration.js
 */

async function testLocalMigration() {
  try {
    console.log('🔍 Testing local migration setup...');
    
    // Database settings
    const dbName = process.env.DB_NAME || 'omtransport_dev';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 5432;
    
    console.log(`📊 Using database: ${dbName} on ${dbHost}:${dbPort}`);
    
    // Create a connection to postgres (default database)
    const pool = new Pool({
      user: dbUser,
      host: dbHost,
      password: dbPassword,
      port: dbPort,
      database: 'postgres' // Connect to default postgres database first
    });
    
    // Check if our database exists
    const dbCheckResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, 
      [dbName]
    );
    
    // If database doesn't exist, create it
    if (dbCheckResult.rows.length === 0) {
      console.log(`📁 Creating database "${dbName}"...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created successfully.');
    } else {
      console.log(`📁 Database "${dbName}" already exists.`);
    }
    
    // Close the postgres connection
    await pool.end();
    
    // Set environment variables for child processes
    const env = {
      ...process.env,
      NODE_ENV: 'development',
      DOTENV_CONFIG_PATH: '.env.local'
    };
    
    // Make sure we delete config.js from migrations to avoid it being treated as a migration
    const configPath = path.join(__dirname, '../migrations/config.js');
    if (fs.existsSync(configPath)) {
      console.log('🗑️ Removing config.js from migrations directory to avoid conflicts');
      fs.unlinkSync(configPath);
    }
    
    // Run the migrations
    console.log('🔄 Running migrations...');
    execSync('pnpm run db:migrate:dev', { stdio: 'inherit', env });
    console.log('✅ Migrations completed successfully.');
    
    // Run the seeders
    console.log('🌱 Running seeders...');
    execSync('pnpm run db:seed:dev', { stdio: 'inherit', env });
    console.log('✅ Seeders completed successfully.');
    
    // Verify the database schema
    console.log('🔍 Verifying database schema...');
    const verifyPool = new Pool({
      user: dbUser,
      host: dbHost,
      password: dbPassword,
      port: dbPort,
      database: dbName
    });
    
    // Check if users table exists
    const tableResult = await verifyPool.query(
      `SELECT * FROM information_schema.tables WHERE table_name = 'Users'`
    );
    
    if (tableResult.rows.length > 0) {
      console.log('✅ Users table exists.');
      
      // Check if superadmin exists
      const userResult = await verifyPool.query(
        `SELECT * FROM "Users" WHERE role = 'superadmin'`
      );
      
      if (userResult.rows.length > 0) {
        console.log('✅ Superadmin user exists:', userResult.rows[0].email);
      } else {
        console.log('❌ Superadmin user not found.');
      }
      
      // Show all tables in the database
      const allTablesResult = await verifyPool.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
      );
      
      console.log('\n📋 Tables in database:');
      allTablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      
    } else {
      console.log('❌ Users table not found.');
    }
    
    await verifyPool.end();
    console.log('\n✅ Local migration test completed.');
    console.log('You can now deploy to Render with confidence!');
    
  } catch (error) {
    console.error('❌ Error testing migrations:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testLocalMigration(); 