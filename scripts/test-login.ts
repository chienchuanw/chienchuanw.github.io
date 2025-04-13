import { config } from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';
import fetch from 'node-fetch';

// Load environment variables first
const envPath = join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from: ${envPath}`);
  config({ path: envPath });
} else {
  console.error(`Environment file not found: ${envPath}`);
  process.exit(1);
}

// Set DATABASE_URL explicitly
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/db_blog';

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    // Test login
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: '5xchuan',
        password: 'Chien2022Chuan',
      }),
    });
    
    const data = await response.json();
    
    console.log('Login response status:', response.status);
    console.log('Login response data:', data);
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to test login:', error);
    process.exit(1);
  }
}

testLogin();
