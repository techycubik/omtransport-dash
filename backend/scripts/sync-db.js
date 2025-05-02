// Database Sync Script
// This script synchronizes the Sequelize models with the database structure
// Use with caution in production as it may alter tables

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// First, register ts-node to handle TypeScript files
try {
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      target: 'es2017'
    }
  });
} catch (e) {
  console.warn('ts-node not available, TypeScript files will not be processed:', e.message);
}

// Load environment variables
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  console.warn('dotenv not available, environment variables might not be loaded:', e.message);
}

// Get database configuration
const configPath = path.join(__dirname, '../config/config.js');
let config;

if (fs.existsSync(configPath)) {
  config = require(configPath).development;
} else {
  config = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  };
}

// Initialize Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: console.log
});

console.log('Starting database sync...');

// Use the existing model initialization from src/index.ts
const modelsIndexPath = path.join(__dirname, '../models/index.ts');

try {
  const { initModels } = require(modelsIndexPath);
  console.log('Initializing models from index.ts...');
  initModels(sequelize);
  console.log('✓ Models initialized successfully');
  
  // Sync the database
  syncDatabase();
} catch (error) {
  console.error('Failed to initialize models:', error);
  process.exit(1);
}

// Sync models with database
async function syncDatabase() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    
    console.log('Starting database sync (alter mode)...');
    await sequelize.sync({ alter: true });
    console.log('✓ Database synchronized successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exit(1);
  }
} 