require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false
});

async function checkDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✓ Database connection has been established successfully.');

    // Get all tables
    const [tables] = await sequelize.query(`
      SELECT tablename FROM pg_catalog.pg_tables
      WHERE schemaname = 'public';
    `);
    
    console.log('\n=== Database Tables ===');
    tables.forEach(table => {
      console.log(`- ${table.tablename}`);
    });

    // Check specific tables and their columns
    const tablesToCheck = ['CrusherSites', 'CrusherSiteMaterials', 'Materials'];
    
    for (const tableName of tablesToCheck) {
      console.log(`\n=== Columns for "${tableName}" ===`);
      try {
        const [columns] = await sequelize.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = '${tableName.toLowerCase()}';
        `);
        
        if (columns.length === 0) {
          console.log(`Table "${tableName}" not found or has no columns.`);
        } else {
          columns.forEach(column => {
            console.log(`- ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
          });
        }
      } catch (err) {
        console.error(`Error getting columns for ${tableName}:`, err.message);
      }
    }

    // Check if Materials table has any data
    console.log('\n=== Sample Materials Data ===');
    try {
      const [materials] = await sequelize.query('SELECT * FROM "Materials" LIMIT 5;');
      
      if (materials.length === 0) {
        console.log('No materials found in the database.');
      } else {
        materials.forEach(material => {
          console.log(`- ID: ${material.id}, Name: ${material.name}, UOM: ${material.uom}`);
        });
      }
    } catch (err) {
      console.error('Error querying Materials:', err.message);
    }

    // Try direct query to create and test
    console.log('\n=== Testing Direct Query ===');
    try {
      // Try to create a test site
      await sequelize.query(`
        INSERT INTO "CrusherSites" (name, owner, location, created_at, updated_at)
        VALUES ('Test Site', 'Test Owner', 'Test Location', NOW(), NOW())
        RETURNING id;
      `);
      console.log('Successfully inserted a test site');
    } catch (err) {
      console.error('Error inserting test site:', err.message);
    }

  } catch (error) {
    console.error('Unable to connect to the database or query it:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase(); 