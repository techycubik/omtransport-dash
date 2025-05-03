'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to SalesOrders table
    await queryInterface.addColumn('SalesOrders', 'challan_no', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('SalesOrders', 'address', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Create SalesOrderItems table
    await queryInterface.createTable('SalesOrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sales_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SalesOrders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      material_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Materials',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      crusher_site_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'CrusherSites',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      qty: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      rate: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      uom: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Ton'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Migrate existing data - this is a critical step!
    try {
      // Get all existing sales orders
      const salesOrders = await queryInterface.sequelize.query(
        'SELECT id, material_id, qty, rate FROM "SalesOrders"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Create corresponding items for each sales order
      if (salesOrders.length > 0) {
        const items = salesOrders.map(order => ({
          sales_order_id: order.id,
          material_id: order.material_id,
          qty: order.qty,
          rate: order.rate,
          uom: 'Ton', // Default UOM
          created_at: new Date(),
          updated_at: new Date()
        }));

        await queryInterface.bulkInsert('SalesOrderItems', items);
      }
    } catch (error) {
      console.error('Error migrating existing data:', error);
      // Continue with migration even if data migration fails
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert changes in reverse order
    await queryInterface.dropTable('SalesOrderItems');
    await queryInterface.removeColumn('SalesOrders', 'address');
    await queryInterface.removeColumn('SalesOrders', 'challan_no');
  }
}; 