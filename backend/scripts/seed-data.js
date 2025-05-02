'use strict';

require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/config.js');
const path = require('path');

// Set up ts-node
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020',
  }
});

// Import models from TypeScript
const Models = require(path.resolve(__dirname, '../src/index.ts'));

async function seedData() {
  console.log('Starting seed data process...');
  
  // Create Sequelize instance
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = config[env];
  
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: false
    }
  );
  
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Initialize models
    const models = Models.initModels(sequelize);
    
    // Get model references
    const { Material, Customer, Vendor, SalesOrder, PurchaseOrder, CrusherMachine, CrusherRun, Dispatch } = models;
    
    console.log('Checking if data already exists...');
    
    // Check if data already exists
    const materialCount = await Material.count();
    const customerCount = await Customer.count();
    const vendorCount = await Vendor.count();
    
    if (materialCount > 0 && customerCount > 0 && vendorCount > 0) {
      console.log('Basic data already exists. Skipping basic seed data.');
    } else {
      // Create materials
      console.log('Creating materials...');
      const materials = await Material.bulkCreate([
        { name: 'M.SAND', uom: 'MT', description: 'Manufactured Sand' },
        { name: 'GRAVEL', uom: 'MT', description: 'Processed Gravel' },
        { name: 'JELLY STONES', uom: 'MT', description: 'Small aggregates' }
      ]);
      
      // Create customers
      console.log('Creating customers...');
      const customers = await Customer.bulkCreate([
        { name: 'NUVOCO ANJANAPURA', address: 'Anjanapura, Bangalore', contactPerson: 'John Smith', contactNumber: '9876543210' },
        { name: 'RAMCO CEMENTS', address: 'Hosur Road, Bangalore', contactPerson: 'Jane Miller', contactNumber: '9876543211' }
      ]);
      
      // Create vendors
      console.log('Creating vendors...');
      const vendors = await Vendor.bulkCreate([
        { name: 'AMB TRADERS', address: 'Jigani, Bangalore', contactPerson: 'Amar Singh', contactNumber: '9876543212' },
        { name: 'STONE SUPPLY CO', address: 'Electronic City, Bangalore', contactPerson: 'Raj Kumar', contactNumber: '9876543213' }
      ]);
      
      console.log('Basic seed data created successfully.');
    }
    
    // Check if there are any crusher machines
    const crusherMachineCount = await CrusherMachine.count();
    if (crusherMachineCount === 0) {
      console.log('Creating crusher machines...');
      await CrusherMachine.create({
        name: 'Primary Crusher',
        location: 'Main Site',
        status: 'ACTIVE',
        capacity: 100
      });
    }
    
    // Get references for creating related data
    const materials = await Material.findAll();
    const customers = await Customer.findAll();
    const vendors = await Vendor.findAll();
    const crusherMachines = await CrusherMachine.findAll();
    
    // Create a crusher run
    console.log('Creating a crusher run...');
    const crusherRun = await CrusherRun.create({
      machineId: crusherMachines[0].id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours later
      inputQty: 100,
      producedQty: 95,
      materialId: materials[0].id,
      operatorName: 'Operator 1'
    });
    
    // Create sales order if none exists
    const salesOrderCount = await SalesOrder.count();
    let salesOrder;
    if (salesOrderCount === 0) {
      console.log('Creating a sales order...');
      salesOrder = await SalesOrder.create({
        customerId: customers[0].id,
        materialId: materials[0].id,
        orderDate: new Date(),
        quantity: 50,
        rate: 670,
        totalAmount: 33500,
        status: 'ACTIVE'
      });
    } else {
      salesOrder = await SalesOrder.findOne();
    }
    
    // Create purchase order if none exists
    const purchaseOrderCount = await PurchaseOrder.count();
    let purchaseOrder;
    if (purchaseOrderCount === 0) {
      console.log('Creating a purchase order...');
      purchaseOrder = await PurchaseOrder.create({
        vendorId: vendors[0].id,
        materialId: materials[0].id,
        orderDate: new Date(),
        quantity: 100,
        rate: 609.52,
        totalAmount: 60952,
        status: 'ACTIVE'
      });
    } else {
      purchaseOrder = await PurchaseOrder.findOne();
    }
    
    // Create dispatches for both sales and purchase orders
    console.log('Creating dispatches...');
    
    // Sale dispatch
    await Dispatch.create({
      crusherRunId: crusherRun.id,
      salesOrderId: salesOrder.id,
      dispatchDate: new Date(),
      quantity: 35.203,
      destination: 'NUVOCO ANJANAPURA',
      vehicleNo: 'KA.05.AN.9144',
      driver: 'Driver 1',
      pickupQuantity: 35.203,
      dropQuantity: 35.735,
      deliveryStatus: 'DELIVERED',
      deliveryDuration: 1
    });
    
    // Purchase dispatch
    await Dispatch.create({
      crusherRunId: crusherRun.id,
      purchaseOrderId: purchaseOrder.id,
      dispatchDate: new Date(),
      quantity: 37.413,
      destination: 'Main Site',
      vehicleNo: 'KA.05.AN.9036',
      driver: 'Driver 2',
      pickupQuantity: 37.413,
      dropQuantity: 37.413,
      deliveryStatus: 'DELIVERED',
      deliveryDuration: 1
    });
    
    console.log('Test data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

seedData(); 