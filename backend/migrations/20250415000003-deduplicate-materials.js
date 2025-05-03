'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Get all materials
    const materials = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Materials" ORDER BY id ASC',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Step 2: Find duplicates and keep only the first occurrence
    const uniqueNames = new Set();
    const duplicateIds = [];

    materials.forEach(material => {
      if (uniqueNames.has(material.name)) {
        duplicateIds.push(material.id);
      } else {
        uniqueNames.add(material.name);
      }
    });

    // Step 3: Remove duplicates if there are any
    if (duplicateIds.length > 0) {
      await queryInterface.sequelize.query(
        `DELETE FROM "Materials" WHERE id IN (${duplicateIds.join(',')})`,
        { type: queryInterface.sequelize.QueryTypes.DELETE }
      );
    }

    // Step 4: Update the table structure to make name unique
    await queryInterface.changeColumn('Materials', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
    
    // Step 5: Make uom field optional
    await queryInterface.changeColumn('Materials', 'uom', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove unique constraint from name field
    await queryInterface.changeColumn('Materials', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
    
    // Make uom field required again
    await queryInterface.changeColumn('Materials', 'uom', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
}; 