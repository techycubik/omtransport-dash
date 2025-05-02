'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "CrusherRuns" ADD COLUMN "machine_id" INTEGER'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "CrusherRuns" ALTER COLUMN "machine_id" SET DEFAULT 1'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "CrusherRuns" DROP COLUMN "machine_id"'
    );
  }
}; 