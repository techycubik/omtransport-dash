'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename columns from camelCase to snake_case to match the underscored: true option
    await queryInterface.renameColumn('SalesOrders', 'customerId', 'customer_id');
    await queryInterface.renameColumn('SalesOrders', 'materialId', 'material_id');
    await queryInterface.renameColumn('SalesOrders', 'vehicleNo', 'vehicle_no');
    await queryInterface.renameColumn('SalesOrders', 'orderDate', 'order_date');
    await queryInterface.renameColumn('SalesOrders', 'createdAt', 'created_at');
    await queryInterface.renameColumn('SalesOrders', 'updatedAt', 'updated_at');
  },

  async down(queryInterface, Sequelize) {
    // Revert column names from snake_case back to camelCase
    await queryInterface.renameColumn('SalesOrders', 'customer_id', 'customerId');
    await queryInterface.renameColumn('SalesOrders', 'material_id', 'materialId');
    await queryInterface.renameColumn('SalesOrders', 'vehicle_no', 'vehicleNo');
    await queryInterface.renameColumn('SalesOrders', 'order_date', 'orderDate');
    await queryInterface.renameColumn('SalesOrders', 'created_at', 'createdAt');
    await queryInterface.renameColumn('SalesOrders', 'updated_at', 'updatedAt');
  }
}; 