import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { Vendor as VendorType } from '../../models/vendor';
import { z } from 'zod';

const { Vendor } = sequelize.models;

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gstNo: z.string().min(1, 'GST No is required'),
  contact: z.string().min(1, 'Contact is required'),
  address: z.string().optional()
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.findAll();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vendors', 
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : undefined
    });
  }
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = vendorSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error });
    return;
  }

  try {
    const data = validationResult.data;
    const vendor = await Vendor.create(data);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ 
      error: 'Failed to create vendor', 
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : undefined
    });
  }
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = vendorSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error });
    return;
  }

  const { id } = req.params;
  const data = validationResult.data;
  
  try {
    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }

    await vendor.update(data);
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ 
      error: 'Failed to update vendor', 
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : undefined
    });
  }
}); 