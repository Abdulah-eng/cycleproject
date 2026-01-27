-- Add new score columns to bikes table
-- These columns will store pre-calculated scores from the CSV instead of calculating them on the fly

ALTER TABLE bikes ADD COLUMN IF NOT EXISTS overall_score DECIMAL(3,1);
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS performance_score DECIMAL(3,1);
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS value_score DECIMAL(3,1);
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS fit_score DECIMAL(3,1);
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS general_score DECIMAL(3,1);

-- Add SEO title column
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS title_seo TEXT;

-- Add reason columns (these map to the explanation text for each metric)
-- Note: Some of these might already exist as _explanation columns, but we're adding the CSV column names
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS fit_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS vfm_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS build_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS aero_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS climb_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS posture_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS responsiveness_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS comfort_reason TEXT;
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS surface_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN bikes.overall_score IS 'Pre-calculated overall score from CSV (0-10)';
COMMENT ON COLUMN bikes.performance_score IS 'Pre-calculated performance score from CSV (0-10)';
COMMENT ON COLUMN bikes.value_score IS 'Pre-calculated value score from CSV (0-10)';
COMMENT ON COLUMN bikes.fit_score IS 'Pre-calculated fit score from CSV (0-10)';
COMMENT ON COLUMN bikes.general_score IS 'Pre-calculated general score from CSV (0-10)';
COMMENT ON COLUMN bikes.title_seo IS 'SEO-optimized title for <title> tag';

-- Optional: Create indexes for frequently queried score columns
CREATE INDEX IF NOT EXISTS idx_bikes_overall_score ON bikes(overall_score);
CREATE INDEX IF NOT EXISTS idx_bikes_performance_score ON bikes(performance_score);
CREATE INDEX IF NOT EXISTS idx_bikes_value_score ON bikes(value_score);

-- Check that columns were added successfully
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bikes'
  AND column_name IN ('overall_score', 'performance_score', 'value_score', 'fit_score', 'general_score', 'title_seo')
ORDER BY column_name;
