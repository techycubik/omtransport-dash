'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create enum type for machine status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_CrusherMachines_status" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('CrusherMachines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      last_maintenance_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
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

    // Create a default machine
    await queryInterface.bulkInsert('CrusherMachines', [{
      name: 'Default Crusher',
      status: 'ACTIVE',
      last_maintenance_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CrusherMachines');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_CrusherMachines_status";');
  }
}; 