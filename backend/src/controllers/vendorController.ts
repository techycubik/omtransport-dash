import { Request, Response } from 'express';
import { sequelize } from '../index';
import asyncHandler from '../utils/asyncHandler';
import { Vendor as VendorType } from '../../models/vendor';
import { z } from 'zod';
import { Op } from 'sequelize';

const { Vendor } = sequelize.models;

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gstNo: z.string().min(1, 'GST No is required'),
  contact: z.string().min(1, 'Contact is required'),
  address: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  maps_link: z.string().optional()
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const vendors = await Vendor.findAll();
  res.json(vendors);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  console.log('Create vendor request body:', req.body);
  
  const validationResult = vendorSchema.safeParse(req.body);
  if (!validationResult.success) {
    console.error('Validation error:', validationResult.error);
    res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
    return;
  }

  try {
    const data = validationResult.data;
    
    // Check for existing GST number
    if (data.gstNo) {
      const existingVendor = await Vendor.findOne({
        where: { gstNo: data.gstNo }
      });
      
      if (existingVendor) {
        console.error('Duplicate GST number found');
        res.status(400).json({ error: 'A vendor with this GST number already exists' });
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
    
    console.log('Creating vendor with data:', data);
    const vendor = await Vendor.create(data);
    console.log('Created vendor:', vendor);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor', details: error });
  }
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = vendorSchema.partial().safeParse(req.body);
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
      const existingVendor = await Vendor.findOne({
        where: { 
          gstNo: data.gstNo,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingVendor) {
        console.error('Duplicate GST number found');
        res.status(400).json({ error: 'A vendor with this GST number already exists' });
        return;
      }
    }
    
    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      console.error('Vendor not found with ID:', id);
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }

    // Make sure address field is populated
    if ((data.street || data.city || data.state || data.pincode) && !data.address) {
      const addressComponents = [];
      if (data.street || (vendor as any).street) addressComponents.push(data.street || (vendor as any).street);
      if (data.city || (vendor as any).city) addressComponents.push(data.city || (vendor as any).city);
      if (data.state || (vendor as any).state) addressComponents.push(data.state || (vendor as any).state);
      if (data.pincode || (vendor as any).pincode) addressComponents.push(data.pincode || (vendor as any).pincode);
      
      data.address = addressComponents.join(', ');
    }
    
    console.log('Updating vendor with data:', data);
    await vendor.update(data);
    console.log('Updated vendor:', vendor);
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor', details: error });
  }
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    console.log('Attempting to delete vendor with ID:', id);
    
    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      console.error('Vendor not found with ID:', id);
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }
    
    await vendor.destroy();
    console.log('Vendor deleted successfully:', id);
    
    // Return a successful response
    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor', details: error });
  }
}); 