import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5o1PqCiAFbJM@ep-still-sun-a64b285p.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function cleanOrphanedData() {
  const pool = new Pool({ connectionString });
  try {
    // Delete video_processing_jobs with video_id not present in videos
    await pool.query('DELETE FROM video_processing_jobs WHERE video_id IS NOT NULL AND video_id NOT IN (SELECT id FROM videos);');
    // Delete videos with user_id not present in users
    await pool.query('DELETE FROM videos WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);');
    console.log('✅ Orphaned video_processing_jobs and videos deleted successfully.');
  } catch (err) {
    console.error('❌ Error cleaning orphaned data:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanOrphanedData();
