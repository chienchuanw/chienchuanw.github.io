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

async function testCreatePostWithAuth() {
  try {
    console.log('Step 1: Login to get auth token...');
    
    // Login to get auth token
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: '5xchuan',
        password: 'Chien2022Chuan',
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed with status: ${loginResponse.status}`);
    }
    
    // Get the auth token from the Set-Cookie header
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('Cookies received:', cookies);
    
    if (!cookies || cookies.length === 0) {
      throw new Error('No cookies received from login');
    }
    
    // Extract the auth_token cookie
    const authTokenCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
    if (!authTokenCookie) {
      throw new Error('No auth_token cookie found');
    }
    
    const authToken = authTokenCookie.split(';')[0].split('=')[1];
    console.log('Auth token extracted:', authToken);
    
    console.log('Step 2: Create a post with auth token...');
    
    // Create a post with auth token
    const createPostResponse = await fetch('http://localhost:3002/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${authToken}`,
      },
      body: JSON.stringify({
        title: 'Test Post with Auth',
        content: 'This is a test post created with authentication.',
        excerpt: 'Test excerpt',
        tags: ['test', 'auth'],
        published: true,
      }),
    });
    
    const createPostData = await createPostResponse.json();
    
    console.log('Create post response status:', createPostResponse.status);
    console.log('Create post response data:', createPostData);
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testCreatePostWithAuth();
