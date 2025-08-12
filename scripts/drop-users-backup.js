import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5o1PqCiAFbJM@ep-still-sun-a64b285p.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function dropUsersBackup() {
  const pool = new Pool({ connectionString });
  try {
    await pool.query('DROP TABLE IF EXISTS users_backup CASCADE;');
    console.log('✅ users_backup table dropped successfully.');
  } catch (err) {
    console.error('❌ Error dropping users_backup table:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

dropUsersBackup();
