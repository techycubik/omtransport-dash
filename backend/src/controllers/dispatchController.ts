import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { Dispatch as DispatchType } from '../../models/dispatch';
import { CrusherRun as CrusherRunType } from '../../models/crusherrun';
import { z } from 'zod';
import { Model } from 'sequelize';

const { Dispatch, CrusherRun, SalesOrder, Material, Customer } = sequelize.models;

const dispatchSchema = z.object({
  crusherRunId: z.number().int().positive('Crusher run ID must be positive'),
  salesOrderId: z.number().int().positive('Sales order ID must be positive').optional(),
  dispatchDate: z.string().datetime('Invalid date format'),
  quantity: z.number().positive('Quantity must be positive'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleNo: z.string().min(1, 'Vehicle number is required'),
  driver: z.string().optional(),
  pickupQuantity: z.number().optional(),
  dropQuantity: z.number().optional(),
  deliveryStatus: z.enum(['PENDING', 'IN_TRANSIT', 'DELIVERED']).default('PENDING'),
  deliveryDuration: z.number().optional()
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const dispatches = await Dispatch.findAll({
    include: [
      { 
        model: CrusherRun,
        include: [{ model: Material }]
      },
      {
        model: SalesOrder,
        include: [{ model: Customer }]
      }
    ],
    order: [['dispatchDate', 'DESC']]
  });
  res.json(dispatches);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = dispatchSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  const data = validationResult.data;
  
  // Check if crusher run exists and has available quantity
  const crusherRun = await CrusherRun.findByPk(data.crusherRunId) as CrusherRunType;
  if (!crusherRun) {
    res.status(404).json({ error: 'Crusher run not found' });
    return;
  }

  const availableQty = crusherRun.producedQty - crusherRun.dispatchedQty;
  if (data.quantity > availableQty) {
    res.status(400).json({ error: `Cannot dispatch more than available quantity (${availableQty})` });
    return;
  }

  // Create dispatch
  const dispatch = await Dispatch.create({
    ...data,
    dispatchDate: new Date(data.dispatchDate)
  });

  // Update crusher run's dispatched quantity
  await crusherRun.update({
    dispatchedQty: crusherRun.dispatchedQty + data.quantity
  });
  
  // Get the dispatch with associations
  const dispatchId = (dispatch as any).id;
  const dispatchWithAssociations = await Dispatch.findByPk(dispatchId, {
    include: [
      { 
        model: CrusherRun,
        include: [{ model: Material }]
      },
      {
        model: SalesOrder,
        include: [{ model: Customer }]
      }
    ]
  });
  
  res.status(201).json(dispatchWithAssociations);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = dispatchSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  const { id } = req.params;
  const data = validationResult.data;
  
  const dispatch = await Dispatch.findByPk(id) as unknown as DispatchType;
  if (!dispatch) {
    res.status(404).json({ error: 'Dispatch not found' });
    return;
  }

  // Create a properly typed update object
  const updateData: Partial<DispatchType> = {};
  
  if (data.crusherRunId) updateData.crusherRunId = data.crusherRunId;
  if (data.salesOrderId) updateData.salesOrderId = data.salesOrderId;
  if (data.quantity) updateData.quantity = data.quantity;
  if (data.destination) updateData.destination = data.destination;
  if (data.vehicleNo) updateData.vehicleNo = data.vehicleNo;
  if (data.driver) updateData.driver = data.driver;
  if (data.pickupQuantity) updateData.pickupQuantity = data.pickupQuantity;
  if (data.dropQuantity) updateData.dropQuantity = data.dropQuantity;
  if (data.deliveryStatus) updateData.deliveryStatus = data.deliveryStatus;
  if (data.deliveryDuration) updateData.deliveryDuration = data.deliveryDuration;
  if (data.dispatchDate) updateData.dispatchDate = new Date(data.dispatchDate);
  
  await dispatch.update(updateData);
  
  // Get the updated dispatch with associations
  const updatedDispatch = await Dispatch.findByPk(id, {
    include: [
      { 
        model: CrusherRun,
        include: [{ model: Material }]
      },
      {
        model: SalesOrder,
        include: [{ model: Customer }]
      }
    ]
  });
  
  res.json(updatedDispatch);
}); 