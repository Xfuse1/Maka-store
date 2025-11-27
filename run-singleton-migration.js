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
  const filePath = path.join(__dirname, 'scripts', 'update-store-settings-singleton.sql');
  await runSqlFile(filePath);
}

main();
