'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create the enum type if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_PurchaseOrders_status" AS ENUM ('PENDING', 'RECEIVED', 'PARTIAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Check if column exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'PurchaseOrders' 
      AND column_name = 'status';
    `);

    if (results.length === 0) {
      // Add the column with default value if it doesn't exist
      await queryInterface.addColumn('PurchaseOrders', 'status', {
        type: Sequelize.ENUM('PENDING', 'RECEIVED', 'PARTIAL'),
        allowNull: false,
        defaultValue: 'PENDING'
      });
    } else {
      // Update existing column to use the enum type
      await queryInterface.sequelize.query(`
        ALTER TABLE "PurchaseOrders" 
        ALTER COLUMN status TYPE "enum_PurchaseOrders_status" 
        USING status::"enum_PurchaseOrders_status";
      `);
    }

    // Update existing rows to 'PENDING' if they're null
    await queryInterface.sequelize.query(`
      UPDATE "PurchaseOrders" 
      SET status = 'PENDING' 
      WHERE status IS NULL;
    `);
  },

  async down (queryInterface, Sequelize) {
    // Remove the column
    await queryInterface.removeColumn('PurchaseOrders', 'status');
    
    // Drop the enum type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_PurchaseOrders_status";
    `);
  }
};
