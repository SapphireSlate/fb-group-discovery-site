/**
 * Environment Variables Check Script
 * 
 * This script verifies that all required environment variables are set
 * and validates their format when possible.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Try to load .env.local file
try {
  dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
} catch (error) {
  console.error('Error loading .env.local file:', error.message);
}

// Required environment variables and their validation rules
const REQUIRED_ENV_VARS = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    validation: (value) => value && value.startsWith('https://') && value.includes('.supabase.co'),
    message: 'Should be a valid Supabase URL (https://your-project-id.supabase.co)'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    validation: (value) => value && value.length > 20,
    message: 'Should be a valid Supabase anon key (typically a long string)'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    validation: (value) => value && value.length > 20,
    message: 'Should be a valid Supabase service role key (typically a long string)'
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: true,
    validation: (value) => value && (value.startsWith('http://') || value.startsWith('https://')),
    message: 'Should be a valid URL starting with http:// or https://'
  },
  {
    name: 'SESSION_SECRET',
    required: true,
    validation: (value) => value && value.length >= 32,
    message: 'Should be at least 32 characters long for security'
  },
  {
    name: 'COOKIE_SECURE',
    required: false,
    validation: (value) => value === 'true' || value === 'false',
    message: 'Should be true or false (recommended true for production)'
  },
  {
    name: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    required: true,
    validation: (value) => value && value.length > 10,
    message: 'Should be a valid reCAPTCHA site key'
  },
  {
    name: 'RECAPTCHA_SECRET_KEY',
    required: true,
    validation: (value) => value && value.length > 10,
    message: 'Should be a valid reCAPTCHA secret key'
  },
  {
    name: 'EMAIL_SERVER_HOST',
    required: false,
    validation: (value) => !value || value.includes('.'),
    message: 'Should be a valid SMTP server hostname'
  },
  {
    name: 'EMAIL_SERVER_PORT',
    required: false,
    validation: (value) => !value || !isNaN(parseInt(value)),
    message: 'Should be a valid port number'
  },
  {
    name: 'RATE_LIMIT_MAX',
    required: false,
    validation: (value) => !value || !isNaN(parseInt(value)),
    message: 'Should be a number'
  },
  {
    name: 'RATE_LIMIT_WINDOW_MS',
    required: false,
    validation: (value) => !value || !isNaN(parseInt(value)),
    message: 'Should be a number (milliseconds)'
  }
];

console.log('🔒 Checking environment variables...');

let missingRequired = 0;
let invalidFormat = 0;

// Check each environment variable
REQUIRED_ENV_VARS.forEach(({ name, required, validation, message }) => {
  const value = process.env[name];
  
  if (!value && required) {
    console.log(`❌ Missing required env var: ${name}`);
    missingRequired++;
    return;
  }
  
  if (value && !validation(value)) {
    console.log(`⚠️ Invalid format for ${name}: ${message}`);
    invalidFormat++;
    return;
  }
  
  if (value) {
    // Don't show sensitive values, just indicate they're present
    if (name.includes('KEY') || name.includes('SECRET') || name.includes('PASSWORD')) {
      console.log(`✅ ${name}: [Sensitive value set]`);
    } else {
      console.log(`✅ ${name}: ${value}`);
    }
  } else {
    console.log(`ℹ️ Optional ${name} not set`);
  }
});

console.log('\n✨ Environment variables check complete:');
console.log(`    Missing required variables: ${missingRequired}`);
console.log(`    Variables with invalid format: ${invalidFormat}`);

// Provide a summary
if (missingRequired === 0 && invalidFormat === 0) {
  console.log('\n✅ All required environment variables are set and valid!');
} else {
  console.log('\n❌ Please correct the issues identified above.');
  console.log('   See README-security-setup.md for details on configuring environment variables.');
  
  // Check if .env.example exists and recommend copying it
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(envExamplePath)) {
    console.log('\nTip: You can copy .env.example to .env.local to get started:');
    console.log('cp .env.example .env.local');
    console.log('Then edit .env.local with your actual values.');
  }
}

// Export for use in combined test script
module.exports = {
  missingRequired,
  invalidFormat
}; 