-- ============================================
-- FIX: Supabase RLS (Row Level Security) Issue
-- ============================================
-- The bikes table has RLS enabled but policies aren't working correctly
-- This script fixes the issue

-- Step 1: Drop ALL existing policies on bikes table
DROP POLICY IF EXISTS "Allow public read access" ON bikes;
DROP POLICY IF EXISTS "Enable read access for all users" ON bikes;
DROP POLICY IF EXISTS "Allow authenticated insert" ON bikes;
DROP POLICY IF EXISTS "Allow authenticated update" ON bikes;

-- Step 2: Completely disable RLS temporarily to verify data exists
ALTER TABLE bikes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TEST: After running this, refresh your browser
-- You should now see bikes on http://localhost:3000
-- ============================================

-- Once confirmed working, you can re-enable RLS with proper policies:

-- Step 3: Re-enable RLS (run this AFTER confirming site works)
-- ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, working policy for public read access
-- CREATE POLICY "public_read_bikes" ON bikes
--   FOR SELECT
--   TO anon, authenticated
--   USING (true);

-- Step 5: Create policies for authenticated users (admin)
-- CREATE POLICY "authenticated_insert_bikes" ON bikes
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- CREATE POLICY "authenticated_update_bikes" ON bikes
--   FOR UPDATE
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "authenticated_delete_bikes" ON bikes
--   FOR DELETE
--   TO authenticated
--   USING (true);

-- ============================================
-- INSTRUCTIONS:
-- 1. Copy this entire SQL
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and click "Run"
-- 4. Refresh your browser at http://localhost:3000
-- 5. You should now see the homepage with categories
-- 6. Click a category to see bike listings
-- ============================================
