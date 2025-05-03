'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CrusherSiteMaterials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      crusher_site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CrusherSites',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'crusher_site_id'
      },
      material_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Materials',
          key: 'id'
        },
        onDelete: 'CASCADE',
        field: 'material_id'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      }
    });
    
    // Add composite unique index to prevent duplicate relationships
    await queryInterface.addIndex('CrusherSiteMaterials', ['crusher_site_id', 'material_id'], {
      unique: true,
      name: 'crusher_site_material_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CrusherSiteMaterials');
  }
}; 