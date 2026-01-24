-- SQL script to add score explanation columns to the bikes table
-- Run this in your Supabase SQL Editor

ALTER TABLE bikes
ADD COLUMN IF NOT EXISTS overall_score_explanation TEXT,
ADD COLUMN IF NOT EXISTS performance_score_explanation TEXT,
ADD COLUMN IF NOT EXISTS value_score_explanation TEXT,
ADD COLUMN IF NOT EXISTS fit_score_explanation TEXT,
ADD COLUMN IF NOT EXISTS general_score_explanation TEXT,
ADD COLUMN IF NOT EXISTS climbing_efficiency_explanation TEXT,
ADD COLUMN IF NOT EXISTS aerodynamics_explanation TEXT,
ADD COLUMN IF NOT EXISTS riding_position_explanation TEXT,
ADD COLUMN IF NOT EXISTS handling_explanation TEXT,
ADD COLUMN IF NOT EXISTS fit_flexibility_explanation TEXT,
ADD COLUMN IF NOT EXISTS ride_comfort_explanation TEXT,
ADD COLUMN IF NOT EXISTS build_quality_explanation TEXT,
ADD COLUMN IF NOT EXISTS value_for_money_explanation TEXT,
ADD COLUMN IF NOT EXISTS surface_range_explanation TEXT;

-- Optional: Add comments to describe each column
COMMENT ON COLUMN bikes.overall_score_explanation IS 'Explanation for the overall bike score';
COMMENT ON COLUMN bikes.performance_score_explanation IS 'Explanation for the performance score';
COMMENT ON COLUMN bikes.value_score_explanation IS 'Explanation for the value score';
COMMENT ON COLUMN bikes.fit_score_explanation IS 'Explanation for the fit score';
COMMENT ON COLUMN bikes.general_score_explanation IS 'Explanation for the general score';
COMMENT ON COLUMN bikes.climbing_efficiency_explanation IS 'Explanation for climbing efficiency score';
COMMENT ON COLUMN bikes.aerodynamics_explanation IS 'Explanation for aerodynamics score';
COMMENT ON COLUMN bikes.riding_position_explanation IS 'Explanation for riding position score';
COMMENT ON COLUMN bikes.handling_explanation IS 'Explanation for handling score';
COMMENT ON COLUMN bikes.fit_flexibility_explanation IS 'Explanation for fit flexibility score';
COMMENT ON COLUMN bikes.ride_comfort_explanation IS 'Explanation for ride comfort score';
COMMENT ON COLUMN bikes.build_quality_explanation IS 'Explanation for build quality score';
COMMENT ON COLUMN bikes.value_for_money_explanation IS 'Explanation for value for money score';
COMMENT ON COLUMN bikes.surface_range_explanation IS 'Explanation for surface range score';
