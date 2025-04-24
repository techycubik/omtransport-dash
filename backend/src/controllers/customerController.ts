import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { Customer as CustomerType } from '../../models/customer';
import { z } from 'zod';

const { Customer } = sequelize.models;

// Check if the field mappings are correct
console.log('Customer model:', Customer);

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  gstNo: z.string().optional(),
  contact: z.string().optional()
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const customers = await Customer.findAll();
  res.json(customers);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = customerSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error });
    return;
  }

  try {
    const data = validationResult.data;
    const customer = await Customer.create(data);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer', details: error });
  }
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = customerSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ error: 'Validation failed', details: validationResult.error });
    return;
  }

  const { id } = req.params;
  const data = validationResult.data;
  
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    await customer.update(data);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer', details: error });
  }
}); 