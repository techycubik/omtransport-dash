import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { CrusherRun as CrusherRunType } from '../../models/crusherrun';
import { z } from 'zod';
import { QueryTypes } from 'sequelize';

const { CrusherRun, Material, CrusherMachine } = sequelize.models;

const crusherRunSchema = z.object({
  materialId: z.number().int().positive('Material ID must be positive'),
  machineId: z.number().int().positive('Machine ID must be positive').default(1),
  inputQty: z.number().positive('Input quantity must be positive'),
  producedQty: z.number().positive('Produced quantity must be positive'),
  dispatchedQty: z.number().nonnegative('Dispatched quantity must be zero or positive').default(0),
  runDate: z.string().datetime('Invalid date format'),
  status: z.enum(['PENDING', 'COMPLETED', 'PARTIALLY_DISPATCHED', 'FULLY_DISPATCHED']).default('PENDING')
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching crusher runs...');
    
    // Use model queries instead of raw SQL
    const crusherRuns = await CrusherRun.findAll({
      include: [
        { model: Material },
        { model: CrusherMachine, as: 'Machine' }
      ],
      order: [['runDate', 'DESC']]
    });
    
    res.json(crusherRuns);
  } catch (error) {
    console.error('Error fetching crusher runs:', error);
    
    // Fallback to a simple query if associations fail
    try {
      const simpleRuns = await CrusherRun.findAll({
        order: [['runDate', 'DESC']]
      });
      res.json(simpleRuns);
    } catch (fallbackError) {
      console.error('Fallback query failed:', fallbackError);
      res.status(500).json({ 
        error: 'Failed to fetch crusher runs',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = crusherRunSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  const { materialId, machineId, inputQty, producedQty, dispatchedQty, runDate, status } = validationResult.data;
  const crusherRun = await CrusherRun.create({
    materialId,
    machineId,
    inputQty,
    producedQty,
    dispatchedQty,
    runDate: new Date(runDate),
    status
  });
  
  res.status(201).json(crusherRun);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = crusherRunSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  const { id } = req.params;
  const { materialId, machineId, inputQty, producedQty, dispatchedQty, runDate, status } = validationResult.data;
  
  const crusherRun = await CrusherRun.findByPk(id) as unknown as CrusherRunType;
  if (!crusherRun) {
    res.status(404).json({ error: 'Crusher run not found' });
    return;
  }

  if (materialId) crusherRun.materialId = materialId;
  if (machineId) crusherRun.machineId = machineId;
  if (inputQty) crusherRun.inputQty = inputQty;
  if (producedQty) crusherRun.producedQty = producedQty;
  if (dispatchedQty !== undefined) crusherRun.dispatchedQty = dispatchedQty;
  if (runDate) crusherRun.runDate = new Date(runDate);
  if (status) crusherRun.status = status;
  
  await crusherRun.save();
  res.json(crusherRun);
}); 