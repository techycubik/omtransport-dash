import { Request, Response } from 'express';
import { sequelize } from '../index';
import { Op, QueryTypes } from 'sequelize';
import { CrusherSite } from '../../models/crusherSite';
import { Model } from 'sequelize';

// Get all crusher sites with their associated materials
export const getAllCrusherSites = async (req: Request, res: Response) => {
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
    const { CrusherSite, Material } = sequelize.models;
    const { name, owner, location, materials } = req.body;
    
    console.log('Creating crusher site with data:', req.body);
    
    // Validate required fields
    if (!name || !owner || !location) {
      return res.status(400).json({ error: 'Name, owner, and location are required' });
    }
    
    console.log('Creating new site record');
    const newSite = await CrusherSite.create({
      name,
      owner,
      location
    });
    console.log('New site created:', newSite.toJSON());
    
    // Associate materials if provided
    if (Array.isArray(materials) && materials.length > 0) {
      console.log('Finding materials with IDs:', materials);
      
      // Use direct queries for the many-to-many relationship
      for (const materialId of materials) {
        try {
          await sequelize.query(`
            INSERT INTO "CrusherSiteMaterials" (crusher_site_id, material_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())
          `, {
            replacements: [newSite.get('id'), materialId],
            type: QueryTypes.INSERT
          });
          console.log(`Material ${materialId} associated with site ${newSite.get('id')}`);
        } catch (error) {
          console.error(`Error associating material ${materialId}:`, error);
        }
      }
    }
    
    // Get the newly created site with its associated materials
    console.log('Retrieving site with materials');
    const siteWithMaterials = await CrusherSite.findByPk((newSite as any).id, {
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

// Update a crusher site
export const updateCrusherSite = async (req: Request, res: Response) => {
  try {
    const { CrusherSite, Material } = sequelize.models;
    const { id } = req.params;
    const { name, owner, location, materials } = req.body;
    
    console.log('Updating crusher site', id, 'with data:', req.body);
    
    const site = await CrusherSite.findByPk(id);
    
    if (!site) {
      return res.status(404).json({ error: 'Crusher site not found' });
    }
    
    // Update basic site information
    await site.update({
      name,
      owner,
      location
    });
    console.log('Basic site info updated');
    
    // Update materials if provided
    if (Array.isArray(materials)) {
      console.log('Updating materials:', materials);
      
      // First, remove all existing material associations
      await sequelize.query(`
        DELETE FROM "CrusherSiteMaterials"
        WHERE crusher_site_id = ?
      `, {
        replacements: [id],
        type: QueryTypes.DELETE
      });
      console.log('Removed existing material associations');
      
      // Then add the new ones
      for (const materialId of materials) {
        try {
          await sequelize.query(`
            INSERT INTO "CrusherSiteMaterials" (crusher_site_id, material_id, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())
          `, {
            replacements: [id, materialId],
            type: QueryTypes.INSERT
          });
          console.log(`Material ${materialId} associated with site ${id}`);
        } catch (error) {
          console.error(`Error associating material ${materialId}:`, error);
        }
      }
    }
    
    // Get the updated site with its associated materials
    console.log('Retrieving updated site with materials');
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
    
    const site = await CrusherSite.findByPk(id);
    
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