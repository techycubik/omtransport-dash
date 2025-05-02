'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Dispatches', 'purchase_order_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'PurchaseOrders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Dispatches', 'purchase_order_id');
  }
}; 