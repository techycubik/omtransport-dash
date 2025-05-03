import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { Customer as CustomerType } from '../../models/customer';
import { z } from 'zod';
import { Op } from 'sequelize';

const { Customer } = sequelize.models;

// Check if the field mappings are correct
console.log('Customer model:', Customer);

// Define zod schema for validation with GST number format validation
const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  gstNo: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
      { message: 'Invalid GST number format' }
    ),
  contact: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(), 
  state: z.string().optional(),
  pincode: z.string().optional(),
  maps_link: z.string().optional()
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const customers = await Customer.findAll();
  console.log('Fetched customers:', customers);
  res.json(customers);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  console.log('Create customer request body:', req.body);
  
  const validationResult = customerSchema.safeParse(req.body);
  if (!validationResult.success) {
    console.error('Validation error:', validationResult.error);
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  try {
    const data = validationResult.data;
    
    // Check for existing GST number
    if (data.gstNo) {
      const existingCustomer = await Customer.findOne({
        where: { gstNo: data.gstNo }
      });
      
      if (existingCustomer) {
        console.error('Duplicate GST number found');
        res.status(400).json({ error: 'A customer with this GST number already exists' });
        return;
      }
    }
    
    // Make sure address field is populated
    if (!data.address && (data.street || data.city || data.state || data.pincode)) {
      const addressComponents = [];
      if (data.street) addressComponents.push(data.street);
      if (data.city) addressComponents.push(data.city);
      if (data.state) addressComponents.push(data.state);
      if (data.pincode) addressComponents.push(data.pincode);
      
      data.address = addressComponents.join(', ');
    }
    
    console.log('Creating customer with data:', data);
    const customer = await Customer.create(data);
    console.log('Created customer:', customer);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer', details: error });
  }
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = customerSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    console.error('Validation error:', validationResult.error);
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  const { id } = req.params;
  const data = validationResult.data;
  
  try {
    // Check for existing GST number
    if (data.gstNo) {
      const existingCustomer = await Customer.findOne({
        where: { 
          gstNo: data.gstNo,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingCustomer) {
        console.error('Duplicate GST number found');
        res.status(400).json({ error: 'A customer with this GST number already exists' });
        return;
      }
    }
    
    const customer = await Customer.findByPk(id);
    if (!customer) {
      console.error('Customer not found with ID:', id);
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Make sure address field is populated
    if ((data.street || data.city || data.state || data.pincode) && !data.address) {
      const addressComponents = [];
      if (data.street || (customer as any).street) addressComponents.push(data.street || (customer as any).street);
      if (data.city || (customer as any).city) addressComponents.push(data.city || (customer as any).city);
      if (data.state || (customer as any).state) addressComponents.push(data.state || (customer as any).state);
      if (data.pincode || (customer as any).pincode) addressComponents.push(data.pincode || (customer as any).pincode);
      
      data.address = addressComponents.join(', ');
    }
    
    console.log('Updating customer with data:', data);
    await customer.update(data);
    console.log('Updated customer:', customer);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer', details: error });
  }
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const customer = await Customer.findByPk(id);
    if (!customer) {
      console.error('Customer not found with ID:', id);
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    
    await customer.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer', details: error });
  }
}); 