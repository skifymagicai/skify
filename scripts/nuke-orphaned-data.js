import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5o1PqCiAFbJM@ep-still-sun-a64b285p.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function nukeOrphanedData() {
  const pool = new Pool({ connectionString });
  try {
    // Delete all video_processing_jobs first
    await pool.query('DELETE FROM video_processing_jobs;');
    // Then delete all videos
    await pool.query('DELETE FROM videos;');
    // Then delete all users (should be empty already, but for safety)
    await pool.query('DELETE FROM users;');
    console.log('✅ All video_processing_jobs, videos, and users deleted. DB is clean for migration.');
  } catch (err) {
    console.error('❌ Error nuking orphaned data:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

nukeOrphanedData();
