'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // Check if columns exist in their camelCase format
      const [columns] = await queryInterface.sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'PurchaseOrders' 
        AND column_name IN ('vendorId', 'materialId', 'orderDate', 'createdAt', 'updatedAt');
      `);

      if (columns.length > 0) {
        // Rename columns to snake_case
        await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "vendorId" TO "vendor_id";`);
        await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "materialId" TO "material_id";`);
        await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "orderDate" TO "order_date";`);
        await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "createdAt" TO "created_at";`);
        await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "updatedAt" TO "updated_at";`);
      }

      console.log('PurchaseOrders table columns renamed successfully');
    } catch (error) {
      console.error('Error renaming PurchaseOrders columns:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      // Rename columns back to camelCase
      await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "vendor_id" TO "vendorId";`);
      await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "material_id" TO "materialId";`);
      await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "order_date" TO "orderDate";`);
      await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "created_at" TO "createdAt";`);
      await queryInterface.sequelize.query(`ALTER TABLE "PurchaseOrders" RENAME COLUMN "updated_at" TO "updatedAt";`);
      
      console.log('PurchaseOrders table columns reverted to camelCase successfully');
    } catch (error) {
      console.error('Error reverting PurchaseOrders columns:', error);
      throw error;
    }
  }
}; 