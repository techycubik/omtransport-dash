import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { SalesOrder as SalesOrderType } from '../../models/salesorder';
import { z } from 'zod';

const { SalesOrder, Customer, Material } = sequelize.models;

const salesOrderSchema = z.object({
  customerId: z.number().int().positive('Customer ID must be positive'),
  materialId: z.number().int().positive('Material ID must be positive'),
  qty: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
  vehicleNo: z.string().optional().transform(val => val === '' ? undefined : val),
  orderDate: z.string().datetime('Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)')
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Verify the associations exist
    if (!Customer || !Material) {
      return res.status(500).json({
        error: 'Database models not properly initialized. Missing Customer or Material model.'
      });
    }

    // Use correct include syntax without alias
    const salesOrders = await SalesOrder.findAll({
      include: [
        { 
          model: Customer,
          attributes: ['id', 'name', 'address', 'gstNo', 'contact']
        },
        { 
          model: Material,
          attributes: ['id', 'name', 'uom']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.json(salesOrders);
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return res.status(500).json({
      error: 'Failed to fetch sales orders',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  console.log('Request body:', req.body);
  
  try {
    const validationResult = salesOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.format());
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      });
    }

    const { customerId, materialId, qty, rate, vehicleNo, orderDate } = validationResult.data;
    
    const salesOrder = await SalesOrder.create({
      customerId,
      materialId,
      qty,
      rate,
      vehicleNo,
      orderDate
    });
    
    // Fetch the created order with its relations for the response
    const newOrderWithRelations = await SalesOrder.findByPk((salesOrder as any).id, {
      include: [
        { model: Customer },
        { model: Material }
      ]
    });
    
    res.status(201).json(newOrderWithRelations);
  } catch (error) {
    console.error('Error creating sales order:', error);
    res.status(500).json({ 
      error: 'Failed to create sales order', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = salesOrderSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  const { id } = req.params;
  const { qty, rate, vehicleNo } = validationResult.data;
  
  try {
    const salesOrder = await SalesOrder.findByPk(id) as unknown as SalesOrderType;
    if (!salesOrder) {
      res.status(404).json({ error: 'Sales order not found' });
      return;
    }

    if (qty !== undefined) salesOrder.qty = qty;
    if (rate !== undefined) salesOrder.rate = rate;
    if (vehicleNo !== undefined) salesOrder.vehicleNo = vehicleNo;
    
    await salesOrder.save();
    
    // Fetch the updated order with its relations for the response
    const updatedOrderWithRelations = await SalesOrder.findByPk(id, {
      include: [
        { model: Customer },
        { model: Material }
      ]
    });
    
    res.json(updatedOrderWithRelations);
  } catch (error) {
    console.error('Error updating sales order:', error);
    res.status(500).json({ 
      error: 'Failed to update sales order', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const salesOrder = await SalesOrder.findByPk(id);
    if (!salesOrder) {
      res.status(404).json({ error: 'Sales order not found' });
      return;
    }

    await salesOrder.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting sales order:', error);
    res.status(500).json({ 
      error: 'Failed to delete sales order', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}); 