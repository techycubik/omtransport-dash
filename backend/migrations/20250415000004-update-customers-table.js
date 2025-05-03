'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if gst_no has unique constraint
    const tableInfo = await queryInterface.describeTable('Customers');
    
    // Add missing columns if they don't exist
    const columnsToAdd = {};
    
    if (!tableInfo.contact) {
      columnsToAdd.contact = {
        type: Sequelize.STRING,
        allowNull: true
      };
    }
    
    if (!tableInfo.street) {
      columnsToAdd.street = {
        type: Sequelize.STRING,
        allowNull: true
      };
    }
    
    if (!tableInfo.city) {
      columnsToAdd.city = {
        type: Sequelize.STRING,
        allowNull: true
      };
    }
    
    if (!tableInfo.state) {
      columnsToAdd.state = {
        type: Sequelize.STRING,
        allowNull: true
      };
    }
    
    if (!tableInfo.pincode) {
      columnsToAdd.pincode = {
        type: Sequelize.STRING,
        allowNull: true
      };
    }
    
    if (!tableInfo.maps_link) {
      columnsToAdd.maps_link = {
        type: Sequelize.STRING,
        allowNull: true
      };
    }
    
    // Add all the missing columns
    if (Object.keys(columnsToAdd).length > 0) {
      await queryInterface.addColumns('Customers', columnsToAdd);
    }
    
    // Make sure gst_no is unique
    await queryInterface.changeColumn('Customers', 'gst_no', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove unique constraint from gst_no
    await queryInterface.changeColumn('Customers', 'gst_no', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
    
    // Remove the added columns
    await queryInterface.removeColumn('Customers', 'contact');
    await queryInterface.removeColumn('Customers', 'street');
    await queryInterface.removeColumn('Customers', 'city');
    await queryInterface.removeColumn('Customers', 'state');
    await queryInterface.removeColumn('Customers', 'pincode');
    await queryInterface.removeColumn('Customers', 'maps_link');
  }
}; 