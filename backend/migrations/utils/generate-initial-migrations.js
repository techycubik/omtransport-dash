require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Script to generate initial migrations for all models.
 * This is useful when migrating an existing database to use migrations.
 * 
 * Run: node migrations/generate-initial-migrations.js
 */

async function generateMigrations() {
  try {
    console.log('Generating migrations for all models...');
    
    // Read all model files in the models directory
    const modelFiles = fs.readdirSync(path.resolve(__dirname, '../models'))
      .filter(file => {
        return (
          file.indexOf('.') !== 0 && 
          file !== 'index.ts' &&
          file !== 'index.js' &&
          (file.endsWith('.ts') || file.endsWith('.js'))
        );
      });
    
    for (const file of modelFiles) {
      // Get model name without extension (e.g., user.ts -> user)
      const modelName = file.split('.')[0];
      
      // Generate a timestamp for migration name (YYYYMMDDHHMMSS)
      const timestamp = new Date().toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);
      
      // Create migration file name
      const migrationName = `${timestamp}-create-${modelName}-table.js`;
      const migrationPath = path.resolve(__dirname, migrationName);
      
      console.log(`Generating migration for model: ${modelName}`);

      // Generate content based on the model structure
      const content = `'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('${modelName.charAt(0).toUpperCase() + modelName.slice(1)}s', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      // Add model-specific fields here
      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('${modelName.charAt(0).toUpperCase() + modelName.slice(1)}s');
  }
};`;

      // Write migration file
      fs.writeFileSync(migrationPath, content);
      console.log(`Created migration: ${migrationName}`);
    }
    
    console.log('All migrations generated. Please review and update them with the correct schema before running.');
  } catch (error) {
    console.error('Error generating migrations:', error);
    process.exit(1);
  }
}

generateMigrations(); 