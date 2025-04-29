import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import { initModels } from '../models';
import './types'; // Import the types that extend Express Request

export const app: Express = express();
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false
});

// Initialize models and associations
const models = initModels(sequelize);

// Import routes after models are initialized
import materialRoutes from './routes/materialRoutes';
import customerRoutes from './routes/customerRoutes';
import vendorRoutes from './routes/vendorRoutes';
import salesOrderRoutes from './routes/salesOrderRoutes';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes';
import crusherRunRoutes from './routes/crusherRunRoutes';
import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';

const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Error handler middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

// Routes
app.use('/api/materials', materialRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/sales', salesOrderRoutes);
app.use('/api/purchases', purchaseOrderRoutes);
app.use('/api/crusher', crusherRunRoutes);
app.use('/auth', authRoutes);
app.use('/api/reports', reportRoutes);

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