import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { Material as MaterialType } from '../../models/material';
import { z } from 'zod';

const { Material } = sequelize.models;

const materialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  uom: z.string().min(1, 'UOM is required')
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const materials = await Material.findAll();
  res.json(materials);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = materialSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }

  const { name, uom } = validationResult.data;
  const material = await Material.create({ name, uom });
  res.status(201).json(material);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = materialSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }

  const { id } = req.params;
  const { name, uom } = validationResult.data;
  
  const material = await Material.findByPk(id) as unknown as MaterialType;
  if (!material) {
    res.status(404).json({ error: 'Material not found' });
    return;
  }

  if (name) material.name = name;
  if (uom) material.uom = uom;
  
  await material.save();
  res.json(material);
}); 