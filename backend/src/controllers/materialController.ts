import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { Material as MaterialType } from '../../models/material';
import { z } from 'zod';

const { Material } = sequelize.models;

const materialSchema = z.object({
  name: z.string().min(1, 'Name is required')
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const materials = await Material.findAll();
  res.json(materials);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = materialSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  const { name } = validationResult.data;
  
  // Check for existing material with same name
  const existingMaterial = await Material.findOne({ where: { name } });
  if (existingMaterial) {
    res.status(400).json({ error: 'Material name already exists' });
    return;
  }
  
  try {
    const material = await Material.create({ name });
    res.status(201).json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = materialSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  const { id } = req.params;
  const { name } = validationResult.data;
  
  const material = await Material.findByPk(id) as unknown as MaterialType;
  if (!material) {
    res.status(404).json({ error: 'Material not found' });
    return;
  }

  if (name && name !== material.name) {
    // Check for existing material with same name
    const existingMaterial = await Material.findOne({ where: { name } });
    if (existingMaterial) {
      res.status(400).json({ error: 'Material name already exists' });
      return;
    }
    material.name = name;
  }
  
  await material.save();
  res.json(material);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const material = await Material.findByPk(id);
  if (!material) {
    res.status(404).json({ error: 'Material not found' });
    return;
  }
  
  await material.destroy();
  res.status(204).send();
}); 