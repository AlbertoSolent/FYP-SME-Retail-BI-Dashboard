/**
 * Seed the initial protected super user.
 * This user cannot be updated or deleted by anyone.
 *
 * Usage: node seed-superuser.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../backend/.env' });

async function seed() {
  const connection = process.env.DATABASE_URL
    ? await mysql.createConnection(process.env.DATABASE_URL)
    : await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

  // Create table if not exists
  const fs = require('fs');
  const schema = fs.readFileSync(__dirname + '/users.sql', 'utf8');
  await connection.query(schema);
  console.log('Users table ready.');

  // Check if super user already exists
  const [existing] = await connection.query(
    'SELECT user_id FROM Users WHERE is_protected = TRUE'
  );

  if (existing.length > 0) {
    console.log('Protected super user already exists. Skipping.');
    await connection.end();
    return;
  }

  // Create the protected super user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await connection.query(
    'INSERT INTO Users (name, email, password, role, is_protected) VALUES (?, ?, ?, ?, ?)',
    ['Alberto Dimitrov', 'admin@retailbi.com', hashedPassword, 'super', true]
  );

  console.log('Protected super user created:');
  console.log('  Email: admin@retailbi.com');
  console.log('  Password: admin123');
  console.log('  Role: super (protected - cannot be deleted or modified)');

  await connection.end();
}

seed().catch(console.error);
