-- Check for triggers on auth.users (run this in Supabase SQL Editor)

-- 1. Check for triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
   OR event_object_table LIKE '%user%' 
   OR event_object_table LIKE '%profile%';

-- 2. Check for foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name LIKE '%user%' OR tc.table_name LIKE '%profile%');

-- 3. Check if there's a profiles or customers table
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%profile%' OR table_name LIKE '%user%' OR table_name LIKE '%customer%');
