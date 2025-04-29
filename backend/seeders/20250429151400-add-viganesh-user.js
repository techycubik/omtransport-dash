'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed the user's email
    const now = new Date();
    await queryInterface.bulkInsert('Users', [
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
      email: 'viganeshgulekar2205@gmail.com'
    });
  }
}; 