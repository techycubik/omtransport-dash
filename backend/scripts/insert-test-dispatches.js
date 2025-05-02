'use strict';

require('dotenv').config();
const { Pool } = require('pg');

async function insertTestData() {
  console.log('Starting to insert test dispatches...');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'omtransport',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  });

  try {
    // First check if we have the prerequisite data
    const { rows: materials } = await pool.query('SELECT id FROM "Materials" LIMIT 1');
    if (materials.length === 0) {
      console.log('No materials found. Creating basic data...');
      
      // Insert a material
      await pool.query(`
        INSERT INTO "Materials" (name, uom, description, "createdAt", "updatedAt") 
        VALUES ('M.SAND', 'MT', 'Manufactured Sand', NOW(), NOW())
        RETURNING id
      `);
    }
    
    const { rows: customers } = await pool.query('SELECT id FROM "Customers" LIMIT 1');
    if (customers.length === 0) {
      console.log('No customers found. Creating a customer...');
      
      // Insert a customer
      await pool.query(`
        INSERT INTO "Customers" (name, address, "contactPerson", "contactNumber", "createdAt", "updatedAt") 
        VALUES ('NUVOCO ANJANAPURA', 'Anjanapura, Bangalore', 'John Smith', '9876543210', NOW(), NOW())
        RETURNING id
      `);
    }
    
    const { rows: vendors } = await pool.query('SELECT id FROM "Vendors" LIMIT 1');
    if (vendors.length === 0) {
      console.log('No vendors found. Creating a vendor...');
      
      // Insert a vendor
      await pool.query(`
        INSERT INTO "Vendors" (name, address, "contactPerson", "contactNumber", "createdAt", "updatedAt") 
        VALUES ('AMB TRADERS', 'Jigani, Bangalore', 'Amar Singh', '9876543212', NOW(), NOW())
        RETURNING id
      `);
    }
    
    // Check if there's a crusher machine
    const { rows: crusherMachines } = await pool.query('SELECT id FROM "CrusherMachines" LIMIT 1');
    let machineId;
    if (crusherMachines.length === 0) {
      console.log('No crusher machines found. Creating a crusher machine...');
      
      // Insert a crusher machine
      const { rows } = await pool.query(`
        INSERT INTO "CrusherMachines" (name, location, status, capacity, "createdAt", "updatedAt") 
        VALUES ('Primary Crusher', 'Main Site', 'ACTIVE', 100, NOW(), NOW())
        RETURNING id
      `);
      machineId = rows[0].id;
    } else {
      machineId = crusherMachines[0].id;
    }
    
    // Get IDs for the foreign keys
    const { rows: [material] } = await pool.query('SELECT id FROM "Materials" LIMIT 1');
    const { rows: [customer] } = await pool.query('SELECT id FROM "Customers" LIMIT 1');
    const { rows: [vendor] } = await pool.query('SELECT id FROM "Vendors" LIMIT 1');
    
    // Create a crusher run
    console.log('Creating a crusher run...');
    const { rows: [crusherRun] } = await pool.query(`
      INSERT INTO "CrusherRuns" ("machine_id", "runDate", "producedQty", "inputQty", "materialId", status, "dispatchedQty", "createdAt", "updatedAt") 
      VALUES ($1, NOW(), 95, 100, $2, 'COMPLETED', 0, NOW(), NOW())
      RETURNING id
    `, [machineId, material.id]);
    
    // Create a sales order
    console.log('Creating a sales order...');
    const { rows: [salesOrder] } = await pool.query(`
      INSERT INTO "SalesOrders" ("customerId", "materialId", "orderDate", quantity, rate, "totalAmount", status, "createdAt", "updatedAt") 
      VALUES ($1, $2, NOW(), 50, 670, 33500, 'ACTIVE', NOW(), NOW())
      RETURNING id
    `, [customer.id, material.id]);
    
    // Create a purchase order
    console.log('Creating a purchase order...');
    const { rows: [purchaseOrder] } = await pool.query(`
      INSERT INTO "PurchaseOrders" ("vendorId", "materialId", "orderDate", quantity, rate, "totalAmount", status, "createdAt", "updatedAt") 
      VALUES ($1, $2, NOW(), 100, 609.52, 60952, 'ACTIVE', NOW(), NOW())
      RETURNING id
    `, [vendor.id, material.id]);
    
    // Create dispatches
    console.log('Creating dispatches...');
    
    // Sales dispatch
    await pool.query(`
      INSERT INTO "Dispatches" (crusher_run_id, sales_order_id, dispatch_date, quantity, destination, vehicle_no, driver, 
        pickup_quantity, drop_quantity, delivery_status, delivery_duration, created_at, updated_at) 
      VALUES ($1, $2, NOW(), 35.203, 'NUVOCO ANJANAPURA', 'KA.05.AN.9144', 'Driver 1', 
        35.203, 35.735, 'DELIVERED', 1, NOW(), NOW())
    `, [crusherRun.id, salesOrder.id]);
    
    // Purchase dispatch
    await pool.query(`
      INSERT INTO "Dispatches" (crusher_run_id, purchase_order_id, dispatch_date, quantity, destination, vehicle_no, driver, 
        pickup_quantity, drop_quantity, delivery_status, delivery_duration, created_at, updated_at) 
      VALUES ($1, $2, NOW(), 37.413, 'Main Site', 'KA.05.AN.9036', 'Driver 2', 
        37.413, 37.413, 'DELIVERED', 1, NOW(), NOW())
    `, [crusherRun.id, purchaseOrder.id]);
    
    console.log('Test dispatches inserted successfully!');
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

insertTestData(); 