'use strict';
require('dotenv').config();
// const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table exists
    try {
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('Users')) {
        console.log('Users table does not exist. Skipping superadmin creation.');
        return;
      }

      // Check the valid enum values for role
      const roleValues = await queryInterface.sequelize.query(
        `SELECT enum_range(NULL::"enum_Users_role")`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      console.log('Valid role values:', roleValues);
      
      // Use SUPER_ADMIN instead of superadmin
      const roleToUse = 'SUPER_ADMIN';
      
      // Check if superadmin already exists
      const superadminExists = await queryInterface.sequelize.query(
        `SELECT * FROM "Users" WHERE role = '${roleToUse}'`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (superadminExists && superadminExists.length > 0) {
        console.log('Superadmin already exists. Skipping.');
        return;
      }

      // Create superadmin with a plaintext password (for testing only)
      // In production, use bcrypt to hash the password
      // const hashedPassword = await bcrypt.hash('superadmin123', 10);
      const hashedPassword = 'superadmin123'; // This is just for testing!
      const now = new Date();

      await queryInterface.bulkInsert('Users', [{
        firstName: 'Super',
        lastName: 'Admin',
        email: 'niranjangaonkar.09@gmail.com',
        password: hashedPassword,
        role: roleToUse,
        isActive: true,
        created_at: now,
        updated_at: now
      }]);

      console.log('Superadmin user created successfully');
    } catch (error) {
      console.error('Error creating superadmin:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Users', { role: 'SUPER_ADMIN' });
    } catch (error) {
      console.error('Error removing superadmin:', error);
    }
  }
}; 