'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Customers', 'street', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Customers', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Customers', 'state', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Customers', 'pincode', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Customers', 'maps_link', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Customers', 'street');
    await queryInterface.removeColumn('Customers', 'city');
    await queryInterface.removeColumn('Customers', 'state');
    await queryInterface.removeColumn('Customers', 'pincode');
    await queryInterface.removeColumn('Customers', 'maps_link');
  }
}; 