import 'dotenv/config';
import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import { initModels } from '../models';

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Database setup
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false
});

// Initialize models and associations
const models = initModels(sequelize);

// Routes
app.get('/materials', async (req: Request, res: Response): Promise<void> => {
  try {
    const materials = await models.Material.findAll();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

app.get('/customers', async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await models.Customer.findAll();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/materials', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, uom } = req.body;
    if (!name || !uom) {
      res.status(400).json({ error: 'Name and UOM are required' });
      return;
    }
    const material = await models.Material.create({ name, uom });
    res.status(201).json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer(); 