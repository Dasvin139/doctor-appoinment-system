'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// SEEDER: Creates the default Super Admin account
// Run with: npm run db:seed
// Admin credentials: admin@medbook.com / Admin@123

module.exports = {
  up: async (queryInterface) => {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        email: 'admin@medbook.com',
        password: hashedPassword,
        role: 'super_admin',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '9999999999',
        is_active: true,
        reset_password_token: null,
        reset_password_expires: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@medbook.com' }, {});
  },
};
