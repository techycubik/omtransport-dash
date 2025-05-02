'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check and add foreign key for CrusherRun to Material if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'crusher_runs_material_id_fkey'
        ) THEN
          ALTER TABLE "CrusherRuns"
          ADD CONSTRAINT crusher_runs_material_id_fkey
          FOREIGN KEY ("materialId") REFERENCES "Materials" (id);
        END IF;
      END
      $$;
    `);

    // Check and add foreign key for CrusherRun to CrusherMachine if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'crusher_runs_machine_id_fkey'
        ) THEN
          ALTER TABLE "CrusherRuns"
          ADD CONSTRAINT crusher_runs_machine_id_fkey
          FOREIGN KEY (machine_id) REFERENCES "CrusherMachines" (id);
        END IF;
      END
      $$;
    `);

    // Check and add foreign key for Dispatch to CrusherRun if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'dispatches_crusher_run_id_fkey'
        ) THEN
          ALTER TABLE "Dispatches"
          ADD CONSTRAINT dispatches_crusher_run_id_fkey
          FOREIGN KEY (crusher_run_id) REFERENCES "CrusherRuns" (id);
        END IF;
      END
      $$;
    `);

    // Check and add foreign key for Dispatch to SalesOrder if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'dispatches_sales_order_id_fkey'
        ) THEN
          ALTER TABLE "Dispatches"
          ADD CONSTRAINT dispatches_sales_order_id_fkey
          FOREIGN KEY (sales_order_id) REFERENCES "SalesOrders" (id) DEFERRABLE INITIALLY DEFERRED;
        END IF;
      END
      $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign keys if needed
    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS "CrusherRuns" DROP CONSTRAINT IF EXISTS crusher_runs_material_id_fkey;
      ALTER TABLE IF EXISTS "CrusherRuns" DROP CONSTRAINT IF EXISTS crusher_runs_machine_id_fkey;
      ALTER TABLE IF EXISTS "Dispatches" DROP CONSTRAINT IF EXISTS dispatches_crusher_run_id_fkey;
      ALTER TABLE IF EXISTS "Dispatches" DROP CONSTRAINT IF EXISTS dispatches_sales_order_id_fkey;
    `);
  }
}; 