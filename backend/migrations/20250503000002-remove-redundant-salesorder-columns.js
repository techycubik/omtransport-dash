'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove columns that are now in SalesOrderItems
    await queryInterface.removeColumn('SalesOrders', 'material_id');
    await queryInterface.removeColumn('SalesOrders', 'qty');
    await queryInterface.removeColumn('SalesOrders', 'rate');
  },

  async down(queryInterface, Sequelize) {
    // Add back the removed columns if needed to downgrade
    await queryInterface.addColumn('SalesOrders', 'material_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Materials',
        key: 'id'
      }
    });
    
    await queryInterface.addColumn('SalesOrders', 'qty', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    
    await queryInterface.addColumn('SalesOrders', 'rate', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  }
}; 