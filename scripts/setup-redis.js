import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function createUpstashRedis() {
  const accountEmail = process.env.UPSTASH_EMAIL;
  const accountPassword = process.env.UPSTASH_PASSWORD;
  
  if (!accountEmail || !accountPassword) {
    console.error('❌ Missing UPSTASH_EMAIL or UPSTASH_PASSWORD in env');
    return;
  }

  try {
    console.log('🔄 Logging into Upstash...');
    const loginRes = await fetch('https://api.upstash.com/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: accountEmail, password: accountPassword })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;

    console.log('🔄 Creating Redis database...');
    const dbRes = await fetch('https://api.upstash.com/v1/redis', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        name: 'skifymagicai-db', 
        region: 'ap-south-1' 
      })
    });
    
    if (!dbRes.ok) {
      const errorData = await dbRes.json();
      console.log('Database might already exist, fetching existing...');
      
      // Try to get existing databases
      const listRes = await fetch('https://api.upstash.com/v1/redis', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const databases = await listRes.json();
      const existingDb = databases.find(db => db.database_name === 'skifymagicai-db');
      
      if (existingDb) {
        console.log('✅ Using existing Redis database');
        const envVars = `
REDIS_URL=${existingDb.endpoint}
REDIS_TOKEN=${existingDb.rest_token}
`;
        fs.appendFileSync('.env', envVars);
        console.log('✅ Redis configuration added to .env');
        return;
      } else {
        throw new Error(`Database creation failed: ${errorData.message}`);
      }
    }
    
    const dbData = await dbRes.json();
    const envVars = `
REDIS_URL=${dbData.endpoint}
REDIS_TOKEN=${dbData.rest_token}
`;
    
    fs.appendFileSync('.env', envVars);
    console.log('✅ Upstash Redis created and .env updated');
    
  } catch (error) {
    console.error('❌ Redis setup failed:', error.message);
    console.log('📝 Using fallback Redis configuration for development...');
    
    const fallbackEnv = `
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=
`;
    fs.appendFileSync('.env', fallbackEnv);
  }
}

createUpstashRedis();