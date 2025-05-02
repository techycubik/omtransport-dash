import { Request, Response } from 'express';
import { sequelize } from '../index';
import { Op } from 'sequelize';

// Get all crusher machines
export const getAllCrusherMachines = async (req: Request, res: Response) => {
  try {
    const { CrusherMachine } = sequelize.models;
    
    const machines = await CrusherMachine.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json(machines);
  } catch (error) {
    console.error('Error fetching crusher machines:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crusher machines',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single crusher machine by ID
export const getCrusherMachineById = async (req: Request, res: Response) => {
  try {
    const { CrusherMachine } = sequelize.models;
    const { id } = req.params;
    
    const machine = await CrusherMachine.findByPk(id);
    
    if (!machine) {
      return res.status(404).json({ error: 'Crusher machine not found' });
    }
    
    res.json(machine);
  } catch (error) {
    console.error('Error fetching crusher machine:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crusher machine',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new crusher machine
export const createCrusherMachine = async (req: Request, res: Response) => {
  try {
    const { CrusherMachine } = sequelize.models;
    const { name, location, status, capacity } = req.body;
    
    // Validate required fields
    if (!name || !status) {
      return res.status(400).json({ error: 'Name and status are required' });
    }
    
    const newMachine = await CrusherMachine.create({
      name,
      location,
      status,
      capacity
    });
    
    res.status(201).json(newMachine);
  } catch (error) {
    console.error('Error creating crusher machine:', error);
    res.status(500).json({ 
      error: 'Failed to create crusher machine',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a crusher machine
export const updateCrusherMachine = async (req: Request, res: Response) => {
  try {
    const { CrusherMachine } = sequelize.models;
    const { id } = req.params;
    const { name, location, status, capacity } = req.body;
    
    const machine = await CrusherMachine.findByPk(id);
    
    if (!machine) {
      return res.status(404).json({ error: 'Crusher machine not found' });
    }
    
    await machine.update({
      name,
      location,
      status,
      capacity
    });
    
    res.json(machine);
  } catch (error) {
    console.error('Error updating crusher machine:', error);
    res.status(500).json({ 
      error: 'Failed to update crusher machine',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a crusher machine
export const deleteCrusherMachine = async (req: Request, res: Response) => {
  try {
    const { CrusherMachine } = sequelize.models;
    const { id } = req.params;
    
    const machine = await CrusherMachine.findByPk(id);
    
    if (!machine) {
      return res.status(404).json({ error: 'Crusher machine not found' });
    }
    
    await machine.destroy();
    
    res.json({ message: 'Crusher machine deleted successfully' });
  } catch (error) {
    console.error('Error deleting crusher machine:', error);
    res.status(500).json({ 
      error: 'Failed to delete crusher machine',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 