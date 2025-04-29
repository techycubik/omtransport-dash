# Database Model Sync Tools

This directory contains utilities for working with database models.

## Scripts

### syncModels.js

This script synchronizes all defined models with the database and creates a superadmin user if one doesn't exist.

```bash
# Alter existing tables to match models (default)
node src/utils/syncModels.js

# Drop and recreate all tables (DANGER: destroys all data)
node src/utils/syncModels.js --force
```

The script will:
1. Connect to the database
2. Initialize all models
3. Sync the database (create/alter tables)
4. Check if a superadmin user exists
5. Create a superadmin user if none exists

### createModel.ts

This script generates both a TypeScript model file and a Sequelize migration for a new model:

```bash
npx ts-node src/utils/createModel.ts ModelName field1:type field2:type
```

Example:
```bash
npx ts-node src/utils/createModel.ts Product name:string price:decimal 
```

## Complete Workflow for Adding a New Model

1. Create the model and migration files:
   ```bash
   npx ts-node src/utils/createModel.ts NewModel field1:type field2:type
   ```

2. Review and modify the generated files:
   - `models/newModel.ts` - TypeScript model definition
   - `migrations/XXXXXX-create-new-model.js` - Migration file

3. Update `models/index.ts`:
   - Import the new model factory
   - Initialize the model
   - Define associations with other models

4. Apply the migration to update the database:
   ```bash
   npx sequelize-cli db:migrate
   ```
   
   OR use the sync script (development only):
   ```bash
   node src/utils/syncModels.js
   ```

5. Create routes and controllers for the new model if needed

## Database Migrations vs. Model Sync

- **Migrations** (recommended for production): Track schema changes over time, allowing safe upgrades and rollbacks
- **Model Sync** (development only): Quickly update the database schema based on current model definitions

For production environments, always use migrations to apply database changes. 