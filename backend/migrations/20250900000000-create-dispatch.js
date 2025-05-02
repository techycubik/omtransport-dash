'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Dispatches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      crusher_run_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CrusherRuns',
          key: 'id'
        }
      },
      sales_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'SalesOrders',
          key: 'id'
        }
      },
      dispatch_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      quantity: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicle_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      driver: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pickup_quantity: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      drop_quantity: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      delivery_status: {
        type: Sequelize.ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      delivery_duration: {
        type: Sequelize.INTEGER, // In days
        allowNull: true
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Dispatches');
  }
}; 