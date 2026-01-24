-- SQL script to fix RLS policies and ensure database consistency
-- Run this in your Supabase SQL Editor

-- ===================================
-- PART 1: Check Current RLS Status
-- ===================================

-- Check if RLS is enabled on bikes table
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'bikes';

-- View existing RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'bikes';

-- ===================================
-- PART 2: Disable RLS (Recommended for Admin Access)
-- ===================================

-- Option 1: Disable RLS entirely (simplest solution)
-- This allows full access to the bikes table for all operations
ALTER TABLE bikes DISABLE ROW LEVEL SECURITY;

-- ===================================
-- PART 3: Alternative - Configure RLS with Policies
-- ===================================

-- If you prefer to keep RLS enabled, use these policies instead:
-- (Only run this section if you want RLS enabled)

/*
-- Enable RLS
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON bikes;
DROP POLICY IF EXISTS "Allow public read access" ON bikes;
DROP POLICY IF EXISTS "Allow admin full access" ON bikes;

-- Policy 1: Allow public read access (for website visitors)
CREATE POLICY "Allow public read access"
ON bikes
FOR SELECT
TO public
USING (true);

-- Policy 2: Allow authenticated users full access (for admin operations)
CREATE POLICY "Allow admin full access"
ON bikes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 3: Allow service role full access (for API operations)
CREATE POLICY "Allow service role full access"
ON bikes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
*/

-- ===================================
-- PART 4: Verify Database State
-- ===================================

-- Count total bikes
SELECT COUNT(*) as total_bikes FROM bikes;

-- Check bikes by category
SELECT
    category,
    COUNT(*) as count
FROM bikes
GROUP BY category
ORDER BY count DESC;

-- Check for duplicate slugs
SELECT
    slug,
    COUNT(*) as count
FROM bikes
GROUP BY slug
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check bikes with images
SELECT
    COUNT(*) as bikes_with_images
FROM bikes
WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- Check bikes with explanations
SELECT
    COUNT(*) as bikes_with_performance_explanation
FROM bikes
WHERE performance_score_explanation IS NOT NULL AND performance_score_explanation != '';

-- ===================================
-- PART 5: Fix Any Data Inconsistencies
-- ===================================

-- Update null image arrays to empty arrays (optional)
-- UPDATE bikes SET images = '{}' WHERE images IS NULL;

-- Ensure all bikes have slugs
UPDATE bikes
SET slug = lower(brand || '-' || model || '-' || year || '-' || id)
WHERE slug IS NULL OR slug = '';

-- ===================================
-- PART 6: Create Indexes for Performance
-- ===================================

-- Index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_bikes_category ON bikes(category);

-- Index on brand for faster sorting
CREATE INDEX IF NOT EXISTS idx_bikes_brand ON bikes(brand);

-- Index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_bikes_slug ON bikes(slug);

-- Index on created_at for admin dashboard
CREATE INDEX IF NOT EXISTS idx_bikes_created_at ON bikes(created_at DESC);

-- Composite index for category pages
CREATE INDEX IF NOT EXISTS idx_bikes_category_brand_model ON bikes(category, brand, model);

-- ===================================
-- PART 7: Verify Fixes
-- ===================================

-- Verify RLS status after changes
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'bikes';

-- Show final count
SELECT
    'Total Bikes' as metric,
    COUNT(*)::text as value
FROM bikes
UNION ALL
SELECT
    'Categories',
    COUNT(DISTINCT category)::text
FROM bikes
UNION ALL
SELECT
    'Brands',
    COUNT(DISTINCT brand)::text
FROM bikes
UNION ALL
SELECT
    'With Images',
    COUNT(*)::text
FROM bikes
WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- ===================================
-- NOTES
-- ===================================

-- After running this script:
-- 1. RLS should be disabled (allowing full access)
-- 2. Delete operations should work properly
-- 3. All 6000 bikes should be visible
-- 4. Database should be optimized with indexes

-- If you encounter permission errors:
-- Make sure you're using the SERVICE ROLE key in your .env:
-- SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

COMMIT;
