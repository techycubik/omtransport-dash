import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { CrusherRun as CrusherRunType } from '../../models/crusherrun';
import { z } from 'zod';

const { CrusherRun, Material } = sequelize.models;

const crusherRunSchema = z.object({
  materialId: z.number().int().positive('Material ID must be positive'),
  producedQty: z.number().positive('Produced quantity must be positive'),
  dispatchedQty: z.number().positive('Dispatched quantity must be positive'),
  runDate: z.string().datetime('Invalid date format')
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const crusherRuns = await CrusherRun.findAll({
    include: [
      { model: Material }
    ]
  });
  res.json(crusherRuns);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = crusherRunSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }

  const { materialId, producedQty, dispatchedQty, runDate } = validationResult.data;
  const crusherRun = await CrusherRun.create({
    materialId,
    producedQty,
    dispatchedQty,
    runDate: new Date(runDate)
  });
  
  res.status(201).json(crusherRun);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = crusherRunSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }

  const { id } = req.params;
  const { materialId, producedQty, dispatchedQty, runDate } = validationResult.data;
  
  const crusherRun = await CrusherRun.findByPk(id) as unknown as CrusherRunType;
  if (!crusherRun) {
    res.status(404).json({ error: 'Crusher run not found' });
    return;
  }

  if (materialId) crusherRun.materialId = materialId;
  if (producedQty) crusherRun.producedQty = producedQty;
  if (dispatchedQty) crusherRun.dispatchedQty = dispatchedQty;
  if (runDate) crusherRun.runDate = new Date(runDate);
  
  await crusherRun.save();
  res.json(crusherRun);
}); 