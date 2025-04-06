/**
 * Security Headers Check Script
 * 
 * This script verifies that all required security headers are configured correctly
 * in both the middleware.ts and next.config.mjs files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Required security headers
const REQUIRED_HEADERS = [
  'X-DNS-Prefetch-Control',
  'Strict-Transport-Security',
  'X-XSS-Protection',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Content-Security-Policy' // Optional but recommended
];

console.log('🔒 Checking security headers configuration...');

// Check middleware.ts
try {
  const middlewarePath = path.join(__dirname, '..', 'middleware.ts');
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  console.log('\n📝 Checking middleware.ts...');
  
  let middlewareHeadersFound = 0;
  
  REQUIRED_HEADERS.forEach(header => {
    if (middlewareContent.includes(header)) {
      console.log(`✅ Found ${header}`);
      middlewareHeadersFound++;
    } else {
      console.log(`❌ Missing ${header}`);
    }
  });
  
  console.log(`\n${middlewareHeadersFound}/${REQUIRED_HEADERS.length} headers found in middleware.ts`);
} catch (error) {
  console.error('Error checking middleware.ts:', error.message);
}

// Check next.config.mjs
try {
  const configPath = path.join(__dirname, '..', 'next.config.mjs');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  console.log('\n📝 Checking next.config.mjs...');
  
  let configHeadersFound = 0;
  
  REQUIRED_HEADERS.forEach(header => {
    if (configContent.includes(header)) {
      console.log(`✅ Found ${header}`);
      configHeadersFound++;
    } else {
      console.log(`❌ Missing ${header}`);
    }
  });
  
  console.log(`\n${configHeadersFound}/${REQUIRED_HEADERS.length} headers found in next.config.mjs`);
} catch (error) {
  console.error('Error checking next.config.mjs:', error.message);
}

// Test localhost headers if server is running
try {
  console.log('\n📝 Checking runtime headers (requires server to be running)...');
  console.log('Attempting to check headers from localhost:3000...');
  
  try {
    // This will throw an error if the server is not running
    const headersOutput = execSync('curl -s -I http://localhost:3000', { stdio: 'pipe' }).toString();
    console.log('\nHTTP Headers from localhost:3000:');
    console.log(headersOutput);
    
    let runtimeHeadersFound = 0;
    
    REQUIRED_HEADERS.forEach(header => {
      if (headersOutput.includes(header)) {
        console.log(`✅ Found ${header} at runtime`);
        runtimeHeadersFound++;
      } else {
        console.log(`❌ Missing ${header} at runtime`);
      }
    });
    
    console.log(`\n${runtimeHeadersFound}/${REQUIRED_HEADERS.length} headers found at runtime`);
  } catch (e) {
    console.log('❌ Could not check runtime headers. Is the development server running?');
    console.log('   Run npm run dev in another terminal window and try again.');
  }
} catch (error) {
  console.error('Error checking runtime headers:', error.message);
}

console.log('\n✨ Security headers check complete.');
console.log('\nMore details on security headers:');
console.log('https://nextjs.org/docs/advanced-features/security-headers');
console.log('https://owasp.org/www-project-secure-headers/'); 