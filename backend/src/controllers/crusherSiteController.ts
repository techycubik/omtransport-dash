import { Request, Response } from 'express';
import { sequelize } from '../index';
import { Op, QueryTypes, Model } from 'sequelize';
import { CrusherSite } from '../../models/crusherSite';

// Get all crusher sites with their associated materials
export const getCrusherSites = async (req: Request, res: Response) => {
  try {
    const { CrusherSite, Material } = sequelize.models;
    
    const sites = await CrusherSite.findAll({
      include: [{ model: Material }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(sites);
  } catch (error) {
    console.error('Error fetching crusher sites:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crusher sites',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single crusher site by ID
export const getCrusherSiteById = async (req: Request, res: Response) => {
  try {
    const { CrusherSite, Material } = sequelize.models;
    const { id } = req.params;
    
    const site = await CrusherSite.findByPk(id, {
      include: [{ model: Material }]
    });
    
    if (!site) {
      return res.status(404).json({ error: 'Crusher site not found' });
    }
    
    res.json(site);
  } catch (error) {
    console.error('Error fetching crusher site:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crusher site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new crusher site
export const createCrusherSite = async (req: Request, res: Response) => {
  try {
    const { CrusherSite, Material, CrusherSiteMaterial } = sequelize.models;
    const { name, owner, location, materials } = req.body;
    
    // Validate required fields
    if (!name || !owner || !location) {
      return res.status(400).json({ error: 'Name, owner, and location are required' });
    }
    
    // Create the crusher site
    const newSite = await CrusherSite.create({
      name,
      owner,
      location
    }) as Model & { get(key: string): any };
    
    // Add materials if provided using direct associations
    if (Array.isArray(materials) && materials.length > 0) {
      // Create the junction table entries directly
      for (const materialId of materials) {
        await CrusherSiteMaterial.create({
          crusher_site_id: newSite.get('id') as number,
          material_id: materialId
        });
      }
    }
    
    // Get the newly created site with its materials
    const siteWithMaterials = await CrusherSite.findByPk(newSite.get('id') as number, {
      include: [{ model: Material }]
    });
    
    res.status(201).json(siteWithMaterials);
  } catch (error) {
    console.error('Error creating crusher site:', error);
    res.status(500).json({ 
      error: 'Failed to create crusher site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update an existing crusher site
export const updateCrusherSite = async (req: Request, res: Response) => {
  try {
    const { CrusherSite, Material, CrusherSiteMaterial } = sequelize.models;
    const { id } = req.params;
    const { name, owner, location, materials } = req.body;
    
    const site = await CrusherSite.findByPk(id) as Model & { update(data: any): Promise<any> };
    
    if (!site) {
      return res.status(404).json({ error: 'Crusher site not found' });
    }
    
    // Update basic site information
    await site.update({
      name,
      owner,
      location
    });
    
    // Update materials if provided
    if (Array.isArray(materials)) {
      // First, clear existing materials
      await CrusherSiteMaterial.destroy({
        where: { crusher_site_id: id }
      });
      
      // Then add new materials
      for (const materialId of materials) {
        await CrusherSiteMaterial.create({
          crusher_site_id: id,
          material_id: materialId
        });
      }
    }
    
    // Get the updated site with its materials
    const updatedSite = await CrusherSite.findByPk(id, {
      include: [{ model: Material }]
    });
    
    res.json(updatedSite);
  } catch (error) {
    console.error('Error updating crusher site:', error);
    res.status(500).json({ 
      error: 'Failed to update crusher site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a crusher site
export const deleteCrusherSite = async (req: Request, res: Response) => {
  try {
    const { CrusherSite } = sequelize.models;
    const { id } = req.params;
    
    const site = await CrusherSite.findByPk(id) as Model & { destroy(): Promise<void> };
    
    if (!site) {
      return res.status(404).json({ error: 'Crusher site not found' });
    }
    
    await site.destroy();
    
    res.json({ message: 'Crusher site deleted successfully' });
  } catch (error) {
    console.error('Error deleting crusher site:', error);
    res.status(500).json({ 
      error: 'Failed to delete crusher site',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 