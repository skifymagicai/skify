import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/skify-schema.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/skify';

// Create postgres connection
const sql = postgres(DATABASE_URL, {
  max: 20,
  onnotice: () => {}, // Ignore notice messages
});

// Initialize drizzle with schema
export const db = drizzle(sql, { schema });

// Export schema for use in other files
export * from '../../shared/skify-schema.js';