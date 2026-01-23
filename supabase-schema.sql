-- Create bikes table with all fields from CSV
CREATE TABLE IF NOT EXISTS bikes (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  price DECIMAL(10, 2),
  weight TEXT,
  category TEXT NOT NULL,
  sub_category TEXT,
  frame TEXT,
  travel_front TEXT,
  travel_rear TEXT,
  wheels TEXT,
  groupset TEXT,
  fork TEXT,
  suspension TEXT,
  motor TEXT,
  battery TEXT,
  drivetrain TEXT,
  brakes TEXT,
  brakes2 TEXT,
  spokes TEXT,
  brake_levers TEXT,
  stem TEXT,
  handlebar TEXT,
  frame_description TEXT,
  suspension_fork_description TEXT,
  rear_shock_description TEXT,
  rear_derailleur TEXT,
  front_derailleur TEXT,
  shift_levers TEXT,
  cassette TEXT,
  crank TEXT,
  bottom_bracket TEXT,
  chain TEXT,
  pedals TEXT,
  front_hub TEXT,
  rear_hub TEXT,
  grips TEXT,
  saddle TEXT,
  seatpost TEXT,
  motor3 TEXT,
  battery4 TEXT,
  charger TEXT,
  rims TEXT,
  tires TEXT,

  -- Images and geometry
  images TEXT[], -- Array of image URLs
  geometry_data TEXT, -- Multi-line geometry string

  -- Size guide (dynamic attributes)
  size_guide JSONB, -- Store size guide as JSON

  -- URLs and metadata
  url TEXT,
  image_urls TEXT[],

  -- Geometry measurements (averaged or for specific size)
  stack_reach_ratio DECIMAL(10, 3),
  bottom_bracket_height DECIMAL(10, 2),
  front_center DECIMAL(10, 2),
  rake DECIMAL(10, 2),
  trail DECIMAL(10, 2),
  stack DECIMAL(10, 2),
  reach DECIMAL(10, 2),
  top_tube_length DECIMAL(10, 2),
  seat_tube_angle DECIMAL(10, 2),
  seat_tube_length DECIMAL(10, 2),
  head_tube_angle DECIMAL(10, 2),
  head_tube_length DECIMAL(10, 2),
  chainstay_length DECIMAL(10, 2),
  wheelbase DECIMAL(10, 2),
  bottom_bracket_drop DECIMAL(10, 2),
  standover_height DECIMAL(10, 2),
  rider_min_height DECIMAL(10, 2),
  rider_max_height DECIMAL(10, 2),
  front_travel TEXT,
  rear_travel TEXT,

  -- SEO fields
  title TEXT,
  meta_desc TEXT,
  slug TEXT UNIQUE NOT NULL,

  -- Performance metrics (1-10 scale)
  fit_flexibility_1_10 INTEGER,
  fit_flexibility_bucket TEXT,
  vfm_score_1_to_10 INTEGER,
  vfm_score_bucket TEXT,
  build_1_10 INTEGER,
  build_bucket TEXT,
  aero_1_10 INTEGER,
  aero_bucket TEXT,
  climb_1_10 INTEGER,
  climb_bucket TEXT,
  suspension_1_10 INTEGER,
  suspension_bucket TEXT,
  posture_1_10 INTEGER,
  posture_bucket TEXT,
  torso_angle_deg INTEGER,
  responsiveness_1_10 INTEGER,
  responsiveness_bucket TEXT,
  category_fit TEXT,
  speed_index INTEGER,
  speed_bucket TEXT,
  ride_comfort_1_10 INTEGER,
  ride_comfort_bucket TEXT,
  surface_range TEXT,
  battery_range TEXT,
  battery_bucket TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bikes_category ON bikes(category);
CREATE INDEX IF NOT EXISTS idx_bikes_sub_category ON bikes(sub_category);
CREATE INDEX IF NOT EXISTS idx_bikes_brand ON bikes(brand);
CREATE INDEX IF NOT EXISTS idx_bikes_slug ON bikes(slug);
CREATE INDEX IF NOT EXISTS idx_bikes_price ON bikes(price);
CREATE INDEX IF NOT EXISTS idx_bikes_year ON bikes(year);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_bikes_search ON bikes USING gin(to_tsvector('english',
  coalesce(brand, '') || ' ' ||
  coalesce(model, '') || ' ' ||
  coalesce(title, '') || ' ' ||
  coalesce(meta_desc, '')
));

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_bikes_updated_at
  BEFORE UPDATE ON bikes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON bikes
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to insert/update (for admin purposes)
CREATE POLICY "Allow authenticated insert" ON bikes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON bikes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create a view for bike listings (optimized for list pages)
CREATE OR REPLACE VIEW bike_listings AS
SELECT
  id,
  brand,
  model,
  year,
  price,
  category,
  sub_category,
  slug,
  title,
  meta_desc,
  images[1] as primary_image, -- First image only
  vfm_score_1_to_10,
  vfm_score_bucket,
  build_1_10,
  build_bucket,
  speed_index,
  speed_bucket,
  ride_comfort_1_10,
  ride_comfort_bucket
FROM bikes;

-- Comments for documentation
COMMENT ON TABLE bikes IS 'Main table storing all bicycle data for the catalog';
COMMENT ON COLUMN bikes.slug IS 'URL-friendly identifier, must be unique';
COMMENT ON COLUMN bikes.images IS 'Array of image URLs for the bike';
COMMENT ON COLUMN bikes.geometry_data IS 'Multi-line string containing size-specific geometry data';
COMMENT ON COLUMN bikes.size_guide IS 'JSON object containing size guide attributes and values';
