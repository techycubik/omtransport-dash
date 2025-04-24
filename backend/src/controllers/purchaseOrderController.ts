import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { PurchaseOrder as PurchaseOrderType } from '../../models/purchaseorder';
import { z } from 'zod';

const { PurchaseOrder, Vendor, Material } = sequelize.models;

const purchaseOrderSchema = z.object({
  vendorId: z.number().int().positive('Vendor ID must be positive'),
  materialId: z.number().int().positive('Material ID must be positive'),
  qty: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
  orderDate: z.string().datetime('Invalid date format'),
  status: z.enum(['PENDING', 'RECEIVED', 'PARTIAL']).optional()
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const purchaseOrders = await PurchaseOrder.findAll({
    include: [
      { model: Vendor },
      { model: Material }
    ]
  });
  res.json(purchaseOrders);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = purchaseOrderSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }

  const { vendorId, materialId, qty, rate, orderDate, status } = validationResult.data;
  const purchaseOrder = await PurchaseOrder.create({
    vendorId,
    materialId,
    qty,
    rate,
    orderDate,
    status: status || 'PENDING'
  });
  
  res.status(201).json(purchaseOrder);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = purchaseOrderSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }

  const { id } = req.params;
  const { qty, rate, status } = validationResult.data;
  
  const purchaseOrder = await PurchaseOrder.findByPk(id) as unknown as PurchaseOrderType;
  if (!purchaseOrder) {
    res.status(404).json({ error: 'Purchase order not found' });
    return;
  }

  if (qty) purchaseOrder.qty = qty;
  if (rate) purchaseOrder.rate = rate;
  if (status) purchaseOrder.status = status;
  
  await purchaseOrder.save();
  res.json(purchaseOrder);
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const purchaseOrder = await PurchaseOrder.findByPk(id);
  if (!purchaseOrder) {
    res.status(404).json({ error: 'Purchase order not found' });
    return;
  }

  await purchaseOrder.destroy();
  res.status(204).send();
}); 