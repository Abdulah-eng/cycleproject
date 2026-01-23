const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate a URL-friendly slug from brand and model
 */
function generateSlug(brand, model, year) {
  const text = `${brand}-${model}${year ? `-${year}` : ''}`;
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Parse size guide from CSV columns
 */
function parseSizeGuide(row) {
  const sizeGuide = [];
  for (let i = 1; i <= 12; i++) {
    const attrKey = `size_guide_attribute_${i}`;
    const valKey = `size_guide_value_${i}`;
    if (row[attrKey] && row[valKey]) {
      sizeGuide.push({
        attribute: row[attrKey],
        value: row[valKey],
      });
    }
  }
  return sizeGuide.length > 0 ? sizeGuide : null;
}

/**
 * Parse images from comma-separated string
 */
function parseImages(imagesString) {
  if (!imagesString) return null;
  return imagesString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

/**
 * Parse numeric value
 */
function parseNumber(value) {
  if (!value || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Parse integer value
 */
function parseInt(value) {
  if (!value || value === '') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Transform CSV row to database format
 */
function transformRow(row) {
  const slug = generateSlug(row.brand, row.model, row.year);
  const images = parseImages(row.images);
  const imageUrls = parseImages(row['Image URLs']);
  const sizeGuide = parseSizeGuide(row);

  return {
    brand: row.brand || null,
    model: row.model || null,
    year: parseInt(row.year),
    price: parseNumber(row.price),
    weight: row.weight || null,
    category: row.category || 'Other',
    sub_category: row.sub_category || null,
    frame: row.frame || null,
    travel_front: row.travel_front || null,
    travel_rear: row.travel_rear || null,
    wheels: row.wheels || null,
    groupset: row.groupset || null,
    fork: row.fork || null,
    suspension: row.suspension || null,
    motor: row.motor || null,
    battery: row.battery || null,
    drivetrain: row.Drivetrain || null,
    brakes: row.brakes || null,
    brakes2: row.Brakes2 || null,
    spokes: row.Spokes || null,
    brake_levers: row.Brake_Levers || null,
    stem: row.Stem || null,
    handlebar: row.Handlebar || null,
    frame_description: row.frame_description || null,
    suspension_fork_description: row.suspension_fork_description || null,
    rear_shock_description: row.rear_shock_description || null,
    rear_derailleur: row.Rear_Derailleur || null,
    front_derailleur: row.Front_Derailleur || null,
    shift_levers: row.Shift_Levers || null,
    cassette: row.Cassette || null,
    crank: row.Crank || null,
    bottom_bracket: row.Bottom_Bracket || null,
    chain: row.Chain || null,
    pedals: row.Pedals || null,
    front_hub: row.Front_Hub || null,
    rear_hub: row.Rear_Hub || null,
    grips: row.Grips || null,
    saddle: row.Saddle || null,
    seatpost: row.Seatpost || null,
    motor3: row.Motor3 || null,
    battery4: row.Battery4 || null,
    charger: row.Charger || null,
    rims: row.Rims || null,
    tires: row.Tires || null,
    images: images,
    geometry_data: row.geometry_data || null,
    size_guide: sizeGuide,
    url: row.url || null,
    image_urls: imageUrls,
    stack_reach_ratio: parseNumber(row.stack_reach_ratio),
    bottom_bracket_height: parseNumber(row.bottom_bracket_height),
    front_center: parseNumber(row.front_center),
    rake: parseNumber(row.rake),
    trail: parseNumber(row.trail),
    stack: parseNumber(row.stack),
    reach: parseNumber(row.reach),
    top_tube_length: parseNumber(row.top_tube_length),
    seat_tube_angle: parseNumber(row.seat_tube_angle),
    seat_tube_length: parseNumber(row.seat_tube_length),
    head_tube_angle: parseNumber(row.head_tube_angle),
    head_tube_length: parseNumber(row.head_tube_length),
    chainstay_length: parseNumber(row.chainstay_length),
    wheelbase: parseNumber(row.wheelbase),
    bottom_bracket_drop: parseNumber(row.bottom_bracket_drop),
    standover_height: parseNumber(row.standover_height),
    rider_min_height: parseNumber(row.rider_min_height),
    rider_max_height: parseNumber(row.rider_max_height),
    title: row.title || null,
    meta_desc: row.meta_desc || null,
    slug: slug,
    fit_flexibility_1_10: parseInt(row.fit_flexibility_1_10),
    fit_flexibility_bucket: row.fit_flexibility_bucket || null,
    vfm_score_1_to_10: parseInt(row.vfm_score_1_to_10),
    vfm_score_bucket: row.vfm_score_bucket || null,
    build_1_10: parseInt(row.build_1_10),
    build_bucket: row.build_bucket || null,
    aero_1_10: parseInt(row.aero_1_10),
    aero_bucket: row.Aero_bucket || null,
    climb_1_10: parseInt(row.Climb_1_10),
    climb_bucket: row.climb_bucket || null,
    suspension_1_10: parseInt(row.suspension_1_10),
    suspension_bucket: row.suspension_bucket || null,
    posture_1_10: parseInt(row.posture_1_10),
    posture_bucket: row.posture_bucket || null,
    torso_angle_deg: parseInt(row.torso_angle_deg),
    responsiveness_1_10: parseInt(row.responsiveness_1_10),
    responsiveness_bucket: row.responsiveness_bucket || null,
    category_fit: row.category_fit || null,
    speed_index: parseInt(row.speed_index),
    speed_bucket: row.speed_bucket || null,
    ride_comfort_1_10: parseInt(row.ride_comfort_1_10),
    ride_comfort_bucket: row.ride_comfort_bucket || null,
    surface_range: row.surface_range || null,
    battery_range: row.battery_range || null,
    battery_bucket: row.battery_bucket || null,
  };
}

/**
 * Main import function
 */
async function importBikes() {
  console.log('Starting bike import...');

  // Read CSV file
  const csvPath = './sample_for_website.csv';
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true, // Handle BOM if present
  });

  console.log(`Found ${records.length} bikes in CSV`);

  // Transform and insert in batches
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const transformedBatch = batch.map(transformRow);

    console.log(`Importing batch ${Math.floor(i / batchSize) + 1} (${transformedBatch.length} bikes)...`);

    const { data, error } = await supabase
      .from('bikes')
      .upsert(transformedBatch, { onConflict: 'slug' });

    if (error) {
      console.error(`Error importing batch: ${error.message}`);
      errorCount += transformedBatch.length;
    } else {
      successCount += transformedBatch.length;
      console.log(`✓ Successfully imported batch`);
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total bikes processed: ${records.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Run import
importBikes()
  .then(() => {
    console.log('\nImport complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport failed:', error);
    process.exit(1);
  });
