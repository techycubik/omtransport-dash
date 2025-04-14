'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('Materials', [
      {
        name: 'Sand',
        uom: 'Ton',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Gravel',
        uom: 'Ton',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Cement',
        uom: 'Ton',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Materials', {
      name: ['Sand', 'Gravel', 'Cement']
    }, {});
  }
}; 