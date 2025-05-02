'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if input_qty column already exists
    const tableInfo = await queryInterface.describeTable('CrusherRuns');
    const columnExists = tableInfo.hasOwnProperty('input_qty');
    
    if (!columnExists) {
      // Add input_qty column if it doesn't exist
      await queryInterface.addColumn('CrusherRuns', 'input_qty', {
        type: Sequelize.FLOAT,
        allowNull: true
      });
    }
    
    // Update input_qty with values from producedQty where input_qty is NULL
    await queryInterface.sequelize.query(`
      UPDATE "CrusherRuns" 
      SET "input_qty" = "producedQty" 
      WHERE "input_qty" IS NULL
    `);
    
    // Make input_qty NOT NULL if it's not already
    if (!columnExists || tableInfo.input_qty.allowNull !== false) {
      await queryInterface.changeColumn('CrusherRuns', 'input_qty', {
        type: Sequelize.FLOAT,
        allowNull: false
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the column
    await queryInterface.removeColumn('CrusherRuns', 'input_qty');
  }
}; 