'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Vendors', 'street', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Vendors', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Vendors', 'state', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Vendors', 'pincode', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Vendors', 'maps_link', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Vendors', 'street');
    await queryInterface.removeColumn('Vendors', 'city');
    await queryInterface.removeColumn('Vendors', 'state');
    await queryInterface.removeColumn('Vendors', 'pincode');
    await queryInterface.removeColumn('Vendors', 'maps_link');
  }
}; 