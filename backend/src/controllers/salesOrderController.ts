import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { SalesOrder as SalesOrderType } from '../../models/salesorder';
import { SalesOrderItem as SalesOrderItemType } from '../../models/salesOrderItem';
import { z } from 'zod';
import { Transaction } from 'sequelize';

const { SalesOrder, SalesOrderItem, Customer, Material, CrusherSite } = sequelize.models;

// Item schema for validating array items
const salesOrderItemSchema = z.object({
  materialId: z.number().int().positive('Material ID must be positive'),
  crusherSiteId: z.number().int().positive('Crusher Site ID must be positive').optional(),
  qty: z.number().positive('Quantity must be positive'),
  rate: z.number().optional().default(0),
  uom: z.string().min(1, 'Unit of measure is required')
});

// Main schema for validating the sales order
const salesOrderSchema = z.object({
  customerId: z.number().int().positive('Customer ID must be positive'),
  vehicleNo: z.string().optional().transform(val => val === '' ? undefined : val),
  challanNo: z.string().optional().transform(val => val === '' ? undefined : val),
  address: z.string().optional().transform(val => val === '' ? undefined : val),
  orderDate: z.string().datetime('Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)'),
  items: z.array(salesOrderItemSchema).min(1, 'At least one item is required')
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Verify the associations exist
    if (!Customer || !Material || !SalesOrderItem || !CrusherSite) {
      return res.status(500).json({
        error: 'Database models not properly initialized.'
      });
    }

    // Fetch sales orders with all relations
    const salesOrders = await SalesOrder.findAll({
      include: [
        { 
          model: Customer,
          attributes: ['id', 'name', 'address', 'gstNo', 'contact']
        },
        {
          model: SalesOrderItem,
          include: [
            {
              model: Material,
              attributes: ['id', 'name', 'uom']
            },
            {
              model: CrusherSite,
              attributes: ['id', 'name', 'location']
            }
          ]
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

    const { customerId, vehicleNo, challanNo, address, orderDate, items } = validationResult.data;
    
    // Use transaction to ensure all operations succeed or fail together
    const result = await sequelize.transaction(async (t: Transaction) => {
      // Create the sales order
      const salesOrder = await SalesOrder.create({
        customerId,
        vehicleNo,
        challanNo,
        address,
        orderDate
      }, { transaction: t });
      
      // Create all sales order items
      const salesOrderItems = await Promise.all(
        items.map(item => 
          SalesOrderItem.create({
            salesOrderId: (salesOrder as any).id,
            materialId: item.materialId,
            crusherSiteId: item.crusherSiteId,
            qty: item.qty,
            rate: item.rate || 0,
            uom: item.uom
          }, { transaction: t })
        )
      );
      
      return { salesOrder, salesOrderItems };
    });
    
    // Fetch the created order with its relations for the response
    const newOrderWithRelations = await SalesOrder.findByPk((result.salesOrder as any).id, {
      include: [
        { model: Customer },
        { 
          model: SalesOrderItem,
          include: [
            { model: Material },
            { model: CrusherSite }
          ]
        }
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
  const { customerId, vehicleNo, challanNo, address, orderDate, items } = validationResult.data;
  
  try {
    // Use transaction to ensure all operations succeed or fail together
    await sequelize.transaction(async (t: Transaction) => {
      // Find the sales order
      const salesOrder = await SalesOrder.findByPk(id) as unknown as SalesOrderType;
      if (!salesOrder) {
        throw new Error('Sales order not found');
      }

      // Update sales order fields if provided
      if (customerId !== undefined) salesOrder.customerId = customerId;
      if (vehicleNo !== undefined) salesOrder.vehicleNo = vehicleNo;
      if (challanNo !== undefined) salesOrder.challanNo = challanNo;
      if (address !== undefined) salesOrder.address = address;
      if (orderDate !== undefined) salesOrder.orderDate = new Date(orderDate);
      
      await salesOrder.save({ transaction: t });
      
      // Update items if provided
      if (items && items.length > 0) {
        // Delete existing items
        await SalesOrderItem.destroy({
          where: { salesOrderId: id },
          transaction: t
        });
        
        // Create new items
        await Promise.all(
          items.map(item => 
            SalesOrderItem.create({
              salesOrderId: Number(id),
              materialId: item.materialId,
              crusherSiteId: item.crusherSiteId,
              qty: item.qty,
              rate: item.rate || 0,
              uom: item.uom
            }, { transaction: t })
          )
        );
      }
    });
    
    // Fetch the updated order with its relations for the response
    const updatedOrderWithRelations = await SalesOrder.findByPk(id, {
      include: [
        { model: Customer },
        { 
          model: SalesOrderItem,
          include: [
            { model: Material },
            { model: CrusherSite }
          ]
        }
      ]
    });
    
    if (!updatedOrderWithRelations) {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    
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
    // Use transaction to ensure all operations succeed or fail together
    await sequelize.transaction(async (t: Transaction) => {
      // Delete all items first (respecting foreign key constraints)
      await SalesOrderItem.destroy({
        where: { salesOrderId: id },
        transaction: t
      });
      
      // Then delete the sales order
      const deleteCount = await SalesOrder.destroy({
        where: { id },
        transaction: t
      });
      
      if (deleteCount === 0) {
        throw new Error('Sales order not found');
      }
    });
    
    res.status(200).json({ message: 'Sales order deleted successfully' });
  } catch (error) {
    console.error('Error deleting sales order:', error);
    res.status(500).json({ 
      error: 'Failed to delete sales order', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}); 