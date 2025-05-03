'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed sample users
    const now = new Date();
    await queryInterface.bulkInsert('Users', [
      {
        email: 'staff1@example.com',
        name: 'Staff User 1',
        role: 'STAFF',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'staff2@example.com',
        name: 'Staff User 2',
        role: 'STAFF',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'admin1@example.com',
        name: 'Admin User 1',
        role: 'ADMIN',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'admin2@example.com',
        name: 'Admin User 2',
        role: 'ADMIN',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'inactive@example.com',
        name: 'Inactive User',
        role: 'STAFF',
        is_active: false,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: {
        [Sequelize.Op.in]: [
          'staff1@example.com', 
          'staff2@example.com', 
          'admin1@example.com', 
          'admin2@example.com',
          'inactive@example.com'
        ]
      }
    });
  }
}; 