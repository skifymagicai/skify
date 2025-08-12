import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5o1PqCiAFbJM@ep-still-sun-a64b285p.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function truncateUsers() {
  const pool = new Pool({ connectionString });
  try {
    await pool.query('TRUNCATE TABLE users CASCADE;');
    console.log('✅ users table truncated successfully.');
  } catch (err) {
    console.error('❌ Error truncating users table:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

truncateUsers();
