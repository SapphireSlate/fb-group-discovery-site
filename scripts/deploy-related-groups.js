// Script to deploy the SQL function for related groups
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

// Read the SQL file
const sqlFunction = fs.readFileSync(
  path.join(__dirname, '../supabase/functions/get_related_groups.sql'),
  'utf8'
);

async function deployFunction() {
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Deploying get_related_groups SQL function...');

  try {
    // Execute the SQL function via rpc
    const { error } = await supabase.rpc('exec_sql', { sql: sqlFunction });

    if (error) {
      console.error('Error deploying SQL function:', error);
      process.exit(1);
    }

    console.log('SQL function deployed successfully!');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Execute the function
deployFunction(); 