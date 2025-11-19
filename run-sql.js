
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
      console.error(`Error executing SQL from ${filePath}:`, error);
    } else {
      console.log(`Successfully executed SQL from ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to read or execute ${filePath}:`, err);
  }
}

async function main() {
  // First, create the function if it doesn't exist.
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
    RETURNS VOID AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql;
  `;

  const { error: funcError } = await supabase.rpc('execute_sql', { sql: createFunctionSql });
   if (funcError && funcError.code !== '42883') { // Ignore "function does not exist" error during the check
        console.error('Error creating helper function:', funcError);
        // Don't exit, as the main script might still work if the function exists
    } else {
        console.log('Helper function is ready.');
    }


  const filePath = path.join(__dirname, 'scripts', '15-create-hero-slides-table.sql');
  await runSqlFile(filePath);
}

main();
