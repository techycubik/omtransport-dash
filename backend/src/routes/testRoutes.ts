import { Router, Request, Response } from 'express';
import { sequelize } from '../index';
import { Model } from 'sequelize';

const router = Router();

// Type assertion helper
const getId = (model: Model) => (model as any).id;

router.post('/seed-data', async (req: Request, res: Response) => {
  try {
    const { CrusherMachine, CrusherRun, Material, Customer, Vendor, SalesOrder, PurchaseOrder, Dispatch } = sequelize.models;
    
    // Check if we have the prerequisite data
    const materialCount = await Material.count();
    const customerCount = await Customer.count();
    const vendorCount = await Vendor.count();
    
    if (materialCount === 0) {
      // Create materials
      await Material.bulkCreate([
        { name: 'M.SAND', uom: 'MT', description: 'Manufactured Sand' },
        { name: 'GRAVEL', uom: 'MT', description: 'Processed Gravel' },
        { name: 'JELLY STONES', uom: 'MT', description: 'Small aggregates' }
      ]);
    }
    
    if (customerCount === 0) {
      // Create customers
      await Customer.bulkCreate([
        { name: 'NUVOCO ANJANAPURA', address: 'Anjanapura, Bangalore', contactPerson: 'John Smith', contactNumber: '9876543210' },
        { name: 'RAMCO CEMENTS', address: 'Hosur Road, Bangalore', contactPerson: 'Jane Miller', contactNumber: '9876543211' }
      ]);
    }
    
    if (vendorCount === 0) {
      // Create vendors
      await Vendor.bulkCreate([
        { name: 'AMB TRADERS', address: 'Jigani, Bangalore', contactPerson: 'Amar Singh', contactNumber: '9876543212' },
        { name: 'STONE SUPPLY CO', address: 'Electronic City, Bangalore', contactPerson: 'Raj Kumar', contactNumber: '9876543213' }
      ]);
    }
    
    // Check if there's a crusher machine
    const crusherMachineCount = await CrusherMachine.count();
    let machineId: number;
    if (crusherMachineCount === 0) {
      // Create crusher machine
      const machine = await CrusherMachine.create({
        name: 'Primary Crusher',
        location: 'Main Site',
        status: 'ACTIVE',
        capacity: 100
      });
      machineId = getId(machine);
    } else {
      const machine = await CrusherMachine.findOne();
      machineId = machine ? getId(machine) : 0;
      if (machineId === 0) {
        throw new Error('No crusher machine found and could not create one');
      }
    }
    
    // Get references for creating related data
    const materials = await Material.findAll();
    const customers = await Customer.findAll();
    const vendors = await Vendor.findAll();
    
    // Create a crusher run
    const crusherRun = await CrusherRun.create({
      machineId,
      materialId: getId(materials[0]),
      inputQty: 100,
      producedQty: 95,
      dispatchedQty: 0,
      runDate: new Date(),
      status: 'COMPLETED'
    });
    
    // Create a sales order if one doesn't exist
    const salesOrderCount = await SalesOrder.count();
    let salesOrder;
    if (salesOrderCount === 0) {
      salesOrder = await SalesOrder.create({
        customerId: getId(customers[0]),
        materialId: getId(materials[0]),
        orderDate: new Date(),
        quantity: 50,
        rate: 670,
        totalAmount: 33500,
        status: 'ACTIVE',
        qty: 50
      });
    } else {
      salesOrder = await SalesOrder.findOne();
      if (!salesOrder) {
        throw new Error('No sales order found and could not create one');
      }
    }
    
    // Create a purchase order if one doesn't exist
    const purchaseOrderCount = await PurchaseOrder.count();
    let purchaseOrder;
    if (purchaseOrderCount === 0) {
      purchaseOrder = await PurchaseOrder.create({
        vendorId: getId(vendors[0]),
        materialId: getId(materials[0]),
        orderDate: new Date(),
        quantity: 100,
        rate: 609.52,
        totalAmount: 60952,
        status: 'ACTIVE'
      });
    } else {
      purchaseOrder = await PurchaseOrder.findOne();
      if (!purchaseOrder) {
        throw new Error('No purchase order found and could not create one');
      }
    }
    
    // Create dispatches
    // Sale dispatch
    await Dispatch.create({
      crusherRunId: getId(crusherRun),
      salesOrderId: getId(salesOrder),
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
      crusherRunId: getId(crusherRun),
      purchaseOrderId: getId(purchaseOrder),
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
    
    res.status(200).json({ message: 'Test data created successfully!' });
  } catch (error) {
    console.error('Error creating test data:', error);
    res.status(500).json({ 
      error: 'Failed to create test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 