# Database Migrations

This directory contains database migrations for the application. Migrations are a way to track and apply database schema changes over time.

## Setup

1. The migrations use the configuration from `config.js` which reads values from your `.env` file.
2. Make sure your `.env` file has the correct database credentials:

```
DB_HOST=your-postgres-host.render.com
DB_PORT=5432
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_NAME=yourdatabase
```

## Commands

### Generate Initial Migrations

If you need to generate migration files for your existing models:

```bash
npm run db:generate-migrations
```

This will create a basic migration file for each model. You'll need to edit these files to add the correct columns based on your models.

### Run Migrations

To apply all pending migrations:

```bash
npm run db:migrate
```

### Undo Migrations

To undo the most recent migration:

```bash
npm run db:migrate:undo
```

To undo all migrations:

```bash
npm run db:migrate:undo:all
```

### Create Superadmin User

To create a superadmin user:

```bash
npm run db:seed-superadmin
```

### Complete Setup

To run all migrations and create the superadmin:

```bash
npm run db:setup
```

## Deployment on Render

For Render deployments, the `render-postbuild` script will automatically:

1. Build the TypeScript code
2. Run all migrations
3. Create a superadmin user if none exists

You can add this script to the Render "Build Command" field or it will be automatically run if configured in your service settings.

## Writing Migrations Manually

To create a new migration manually:

```bash
npx sequelize-cli migration:generate --name add-some-column
```

This will create a new file in the migrations directory with `up` and `down` methods that you can edit.

## Custom SQL

For complex changes, you can use raw SQL in your migrations:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('YOUR SQL QUERY HERE');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('YOUR ROLLBACK SQL QUERY HERE');
  }
};
``` 