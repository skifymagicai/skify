import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5o1PqCiAFbJM@ep-still-sun-a64b285p.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function cleanOrphanedVideos() {
  const pool = new Pool({ connectionString });
  try {
    // Delete videos with user_id not present in users
    await pool.query('DELETE FROM videos WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);');
    console.log('✅ Orphaned videos deleted successfully.');
  } catch (err) {
    console.error('❌ Error deleting orphaned videos:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanOrphanedVideos();
