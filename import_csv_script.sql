-- SQL Script to import bike_sample_6k_v2.csv into Supabase
-- This script assumes you have already run supabase_schema_update.sql to add the new columns

-- Step 1: First, run the schema update if you haven't already
-- \i supabase_schema_update.sql

-- Step 2: Clear existing data (OPTIONAL - only if you want to replace all data)
-- TRUNCATE TABLE bikes;

-- Step 3: Import CSV data
-- In Supabase Dashboard:
-- 1. Go to Table Editor
-- 2. Select 'bikes' table
-- 3. Click 'Insert' > 'Import data from CSV'
-- 4. Upload bike_sample_6k_v2.csv
-- 5. Map columns (Supabase should auto-map them)
-- 6. Important column mappings:
--    CSV Column          -> Database Column
--    Id                  -> id
--    title_seo           -> title_seo
--    overall_score       -> overall_score
--    performance_score   -> performance_score
--    value_score         -> value_score
--    fit_score           -> fit_score
--    general_score       -> general_score
--    fit_reason          -> fit_reason
--    vfm_reason          -> vfm_reason
--    build_reason        -> build_reason
--    aero_reason         -> aero_reason
--    climb_reason        -> climb_reason
--    suspension_reason   -> suspension_reason
--    posture_reason      -> posture_reason
--    responsiveness_reason -> responsiveness_reason
--    speed_reason        -> speed_reason
--    comfort_reason      -> comfort_reason
--    surface_reason      -> surface_reason
--    battery_reason      -> battery_reason

-- Step 4: Update slugs for all bikes (if needed)
UPDATE bikes
SET slug = LOWER(
  REGEXP_REPLACE(
    category || '/' ||
    COALESCE(sub_category, 'general') || '/' ||
    brand || '/' ||
    COALESCE(year::text, 'unknown') || '/' ||
    model,
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Step 5: Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_bikes_title_seo ON bikes(title_seo);
CREATE INDEX IF NOT EXISTS idx_bikes_category_subcategory ON bikes(category, sub_category);
CREATE INDEX IF NOT EXISTS idx_bikes_brand_category ON bikes(brand, category);

-- Step 6: Verify the import
SELECT COUNT(*) as total_bikes FROM bikes;
SELECT COUNT(*) as bikes_with_overall_score FROM bikes WHERE overall_score IS NOT NULL;
SELECT COUNT(*) as bikes_with_title_seo FROM bikes WHERE title_seo IS NOT NULL;
SELECT COUNT(*) as bikes_with_reasons FROM bikes WHERE fit_reason IS NOT NULL OR vfm_reason IS NOT NULL;

-- Step 7: Check sample data
SELECT
  id,
  brand,
  model,
  year,
  overall_score,
  performance_score,
  value_score,
  fit_score,
  general_score,
  title_seo,
  CASE WHEN fit_reason IS NOT NULL THEN 'Yes' ELSE 'No' END as has_fit_reason,
  CASE WHEN vfm_reason IS NOT NULL THEN 'Yes' ELSE 'No' END as has_vfm_reason
FROM bikes
LIMIT 10;

-- Alternative: If CSV import via UI doesn't work, you can use psql command:
-- \copy bikes(Id, brand, model, year, price, weight, category, sub_category, frame, travel_front, travel_rear, wheels, groupset, fork, suspension, motor, battery, Drivetrain, brakes, Brakes2, Spokes, Brake_Levers, Stem, Handlebar, frame_description, suspension_fork_description, rear_shock_description, Rear_Derailleur, Front_Derailleur, Shift_Levers, Cassette, Crank, Bottom_Bracket, Chain, Pedals, Front_Hub, Rear_Hub, Grips, Saddle, Seatpost, Motor3, Battery4, Charger, Rims, Tires, images, geometry_data, size_guide_attribute_1, size_guide_value_1, size_guide_attribute_2, size_guide_value_2, size_guide_attribute_3, size_guide_value_3, size_guide_attribute_4, size_guide_value_4, size_guide_attribute_5, size_guide_value_5, size_guide_attribute_6, size_guide_value_6, size_guide_attribute_7, size_guide_value_7, size_guide_attribute_8, size_guide_value_8, size_guide_attribute_9, size_guide_value_9, size_guide_attribute_10, size_guide_value_10, size_guide_attribute_11, size_guide_value_11, size_guide_attribute_12, size_guide_value_12, url, Image URLs, stack_reach_ratio, bottom_bracket_height, front_center, rake, trail, stack, reach, top_tube_length, seat_tube_angle, seat_tube_length, head_tube_angle, head_tube_length, chainstay_length, wheelbase, bottom_bracket_drop, standover_height, wheels, rider_min_height, rider_max_height, front_travel, rear_travel, title, bike_desc, meta_desc, fit_flexibility_1_10, fit_flexibility_bucket, vfm_score_1_to_10, vfm_score_bucket, build_1_10, build_bucket, aero_1_10, Aero_bucket, Climb_1_10, climb_bucket, suspension_1_10, suspension_bucket, posture_1_10, posture_bucket, torso_angle_deg, responsiveness_1_10, responsiveness_bucket, category_fit, speed_index, speed_bucket, ride_comfort_1_10, ride_comfort_bucket, surface_range, battery_range, battery_bucket, fit_reason, vfm_reason, build_reason, aero_reason, climb_reason, suspension_reason, posture_reason, responsiveness_reason, speed_reason, comfort_reason, surface_reason, battery_reason, overall_score, performance_score, value_score, fit_score, general_score, title_seo) FROM 'bike_sample_6k_v2.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
