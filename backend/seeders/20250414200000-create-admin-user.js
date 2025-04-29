'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed admin users
    const now = new Date();
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@example.com',
        name: 'Test Admin',
        role: 'SUPER_ADMIN',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'test@test.com',
        name: 'Test User',
        role: 'STAFF',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'viganeshgulekar2205@gmail.com',
        name: 'Viganesh',
        role: 'SUPER_ADMIN',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: {
        [Sequelize.Op.in]: ['admin@example.com', 'test@test.com', 'viganeshgulekar2205@gmail.com']
      }
    });
  }
}; 