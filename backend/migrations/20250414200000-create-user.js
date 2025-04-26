'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('SUPER_ADMIN', 'ADMIN', 'STAFF'),
        allowNull: false,
        defaultValue: 'STAFF'
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Create an enum type for audit actions
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_UserAuditLogs_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create user audit logs table
    await queryInterface.createTable('UserAuditLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      action: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      changes: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING,
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

    // Create index on user_id for fast lookups
    await queryInterface.addIndex('UserAuditLogs', ['user_id']);

    // Seed a super admin user
    const now = new Date();
    await queryInterface.bulkInsert('Users', [{
      email: 'admin@omtransport.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      is_active: true,
      created_at: now,
      updated_at: now
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserAuditLogs');
    await queryInterface.dropTable('Users');
    
    // Drop the enum type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_UserAuditLogs_action";
    `);
  }
}; 