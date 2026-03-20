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
 * Helper to get value from row using multiple possible keys (case-insensitive safety)
 */
function getValue(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return null;
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
    brand: getValue(row, ['brand', 'Brand']),
    model: getValue(row, ['model', 'Model']),
    year: parseInt(getValue(row, ['year', 'Year'])),
    price: parseNumber(getValue(row, ['price', 'Price'])),
    weight: getValue(row, ['weight', 'Weight']),
    category: getValue(row, ['category', 'Category']) || 'Other',
    sub_category: getValue(row, ['sub_category', 'Sub_Category', 'Sub Category']),
    frame: getValue(row, ['frame', 'Frame']),
    travel_front: getValue(row, ['travel_front', 'Travel_Front']),
    travel_rear: getValue(row, ['travel_rear', 'Travel_Rear']),
    wheels: getValue(row, ['wheels', 'Wheels']),
    groupset: getValue(row, ['groupset', 'Groupset']),
    fork: getValue(row, ['fork', 'Fork']),
    suspension: getValue(row, ['suspension', 'Suspension']),
    motor: getValue(row, ['motor', 'Motor']),
    battery: getValue(row, ['battery', 'Battery']),
    drivetrain: getValue(row, ['drivetrain', 'Drivetrain']),
    brakes: getValue(row, ['brakes', 'Brakes']),
    brakes2: getValue(row, ['brakes2', 'Brakes2', 'BRAKES2']),
    spokes: getValue(row, ['spokes', 'Spokes']),
    brake_levers: getValue(row, ['brake_levers', 'Brake_Levers']),
    stem: getValue(row, ['stem', 'Stem']),
    handlebar: getValue(row, ['handlebar', 'Handlebar']),
    frame_description: getValue(row, ['frame_description', 'Frame_Description']),
    suspension_fork_description: getValue(row, ['suspension_fork_description', 'Suspension_Fork_Description']),
    rear_shock_description: getValue(row, ['rear_shock_description', 'Rear_Shock_Description']),
    rear_derailleur: getValue(row, ['rear_derailleur', 'Rear_Derailleur']),
    front_derailleur: getValue(row, ['front_derailleur', 'Front_Derailleur']),
    shift_levers: getValue(row, ['shift_levers', 'Shift_Levers']),
    cassette: getValue(row, ['cassette', 'Cassette']),
    crank: getValue(row, ['crank', 'Crank']),
    bottom_bracket: getValue(row, ['bottom_bracket', 'Bottom_Bracket']),
    chain: getValue(row, ['chain', 'Chain']),
    pedals: getValue(row, ['pedals', 'Pedals']),
    front_hub: getValue(row, ['front_hub', 'Front_Hub']),
    rear_hub: getValue(row, ['rear_hub', 'Rear_Hub']),
    grips: getValue(row, ['grips', 'Grips']),
    saddle: getValue(row, ['saddle', 'Saddle']),
    seatpost: getValue(row, ['seatpost', 'Seatpost']),
    motor3: getValue(row, ['motor3', 'Motor3', 'MOTOR3']),
    battery4: getValue(row, ['battery4', 'Battery4', 'BATTERY4']),
    charger: getValue(row, ['charger', 'Charger']),
    rims: getValue(row, ['rims', 'Rims']),
    tires: getValue(row, ['tires', 'Tires']),
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
    fit_flexibility_1_10: parseNumber(getValue(row, ['fit_flexibility_1_10', 'Fit_Flexibility_1_10'])),
    fit_flexibility_bucket: getValue(row, ['fit_flexibility_bucket', 'Fit_Flexibility_bucket', 'Fit_flexibility_bucket']),
    vfm_score_1_to_10: parseNumber(getValue(row, ['vfm_score_1_to_10', 'VFM_score_1_to_10', 'Vfm_score_1_to_10'])),
    vfm_score_bucket: getValue(row, ['vfm_score_bucket', 'VFM_score_bucket', 'Vfm_score_bucket']),
    build_1_10: parseNumber(getValue(row, ['build_1_10', 'Build_1_10'])),
    build_bucket: getValue(row, ['build_bucket', 'Build_bucket']),
    aero_1_10: parseNumber(getValue(row, ['aero_1_10', 'Aero_1_10', 'AERO_1_10'])),
    aero_bucket: getValue(row, ['aero_bucket', 'Aero_bucket', 'AERO_BUCKET']),
    climb_1_10: parseNumber(getValue(row, ['climb_1_10', 'Climb_1_10', 'CLIMB_1_10'])),
    climb_bucket: getValue(row, ['climb_bucket', 'Climb_bucket', 'CLIMB_BUCKET']),
    suspension_1_10: parseNumber(getValue(row, ['suspension_1_10', 'Suspension_1_10'])),
    suspension_bucket: getValue(row, ['suspension_bucket', 'Suspension_bucket']),
    posture_1_10: parseNumber(getValue(row, ['posture_1_10', 'Posture_1_10'])),
    posture_bucket: getValue(row, ['posture_bucket', 'Posture_bucket']),
    torso_angle_deg: parseNumber(getValue(row, ['torso_angle_deg', 'Torso_angle_deg'])),
    responsiveness_1_10: parseNumber(getValue(row, ['responsiveness_1_10', 'Responsiveness_1_10'])),
    responsiveness_bucket: getValue(row, ['responsiveness_bucket', 'Responsiveness_bucket']),
    category_fit: getValue(row, ['category_fit', 'Category_fit', 'Category_Fit']),
    speed_index: parseNumber(getValue(row, ['speed_index', 'Speed_index'])),
    speed_bucket: getValue(row, ['speed_bucket', 'Speed_bucket']),
    ride_comfort_1_10: parseNumber(getValue(row, ['ride_comfort_1_10', 'Ride_comfort_1_10', 'Ride_Comfort_1_10'])),
    ride_comfort_bucket: getValue(row, ['ride_comfort_bucket', 'Ride_comfort_bucket']),
    surface_range: getValue(row, ['surface_range', 'Surface_range']),
    battery_range: getValue(row, ['battery_range', 'Battery_range']),
    battery_bucket: getValue(row, ['battery_bucket', 'Battery_bucket']),
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
