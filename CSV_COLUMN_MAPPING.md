# CSV Column Mapping Guide

## Overview

The BikeMax CSV upload system supports both new column names and legacy column names for backwards compatibility. This guide explains how CSV columns map to database fields.

## Score Explanation Columns

The system now supports **score explanations** that appear when users click on score cards. Your CSV can use either the new column names or the legacy "reason" column names.

### Column Name Mapping

| Database Field | New CSV Column | Legacy CSV Column (bike_sample_6k.csv) |
|---|---|---|
| `fit_flexibility_explanation` | fit_flexibility_explanation | **fit_reason** |
| `value_for_money_explanation` | value_for_money_explanation | **vfm_reason** |
| `build_quality_explanation` | build_quality_explanation | **build_reason** |
| `aerodynamics_explanation` | aerodynamics_explanation | **aero_reason** |
| `climbing_efficiency_explanation` | climbing_efficiency_explanation | **climb_reason** |
| `riding_position_explanation` | riding_position_explanation | **posture_reason** |
| `handling_explanation` | handling_explanation | **responsiveness_reason** |
| `ride_comfort_explanation` | ride_comfort_explanation | **comfort_reason** |
| `surface_range_explanation` | surface_range_explanation | **surface_reason** |
| `performance_score_explanation` | performance_score_explanation | **speed_reason** |
| `overall_score_explanation` | overall_score_explanation | (new - no legacy equivalent) |
| `value_score_explanation` | value_score_explanation | (new - no legacy equivalent) |
| `fit_score_explanation` | fit_score_explanation | (new - no legacy equivalent) |
| `general_score_explanation` | general_score_explanation | (new - no legacy equivalent) |

### How It Works

The upload system checks for columns in this order:
1. **New column name** (e.g., `climbing_efficiency_explanation`)
2. **Legacy column name** (e.g., `climb_reason`)
3. Uses the first match found

This means:
- ✅ Your existing `bike_sample_6k.csv` file will work without modifications
- ✅ New CSVs can use either naming convention
- ✅ You can mix and match column names in the same file

## Image Column Mapping

| Database Field | Supported CSV Columns |
|---|---|
| `images` | `images`, `image urls`, `Image URLs`, `image_urls` |

The system automatically:
- Splits comma-separated URLs
- Trims whitespace
- Filters out empty values
- Stores as an array

## Other Important Columns

### Required Columns
- `brand` (required)
- `model` (required)
- `year` (required)
- `category` (required)

### Auto-Generated Fields
- `slug` - Generated from brand, model, year, and optional ID
  - Format: `brand-model-year` or `brand-model-year-id`
  - Automatically lowercased and hyphenated

### Case-Insensitive Matching
All CSV column headers are automatically converted to lowercase, so these are all equivalent:
- `Brand`, `brand`, `BRAND`
- `Image URLs`, `image urls`, `IMAGE_URLS`
- `Aero_bucket`, `aero_bucket`, `AERO_BUCKET`

## Score and Rating Columns

### Numeric Score Fields (1-10)
- `fit_flexibility_1_10`
- `vfm_score_1_to_10`
- `build_1_10`
- `aero_1_10`
- `climb_1_10`
- `suspension_1_10`
- `posture_1_10`
- `responsiveness_1_10`
- `speed_index`
- `ride_comfort_1_10`

### Bucket/Category Fields
- `fit_flexibility_bucket`
- `vfm_score_bucket`
- `build_bucket`
- `aero_bucket` (also accepts `Aero_bucket`)
- `climb_bucket`
- `suspension_bucket`
- `posture_bucket`
- `responsiveness_bucket`
- `speed_bucket`
- `ride_comfort_bucket`
- `battery_bucket`

## Geometry Data

The `geometry_data` column supports multi-line data enclosed in quotes:

```csv
"Size // SM // MD // LG
Stack Reach Ratio // 1.379 mm // 1.405 mm // 1.43 mm
Bottom Bracket Height // 266 mm // 266 mm // 269 mm"
```

## Sample CSV Structure

### Minimal Required Columns
```csv
brand,model,year,category
Trek,Domane SL,2025,Road
```

### With Explanations (bike_sample_6k.csv format)
```csv
brand,model,year,category,price,fit_reason,vfm_reason,build_reason,aero_reason,climb_reason
Giant,TCR Advanced Pro 2,2025,Road,4992,"Flexible fit options...","Great value...","High quality...","Aero design...","Lightweight..."
```

### With New Column Names
```csv
brand,model,year,category,price,fit_flexibility_explanation,value_for_money_explanation
Giant,TCR Advanced Pro 2,2025,Road,4992,"Flexible fit options...","Great value at this price..."
```

## Tips for CSV Preparation

1. **Quotes for Text with Commas**
   ```csv
   "This explanation has a comma, so it needs quotes"
   ```

2. **Multi-line Text**
   ```csv
   "This explanation
   spans multiple lines"
   ```

3. **Empty Values**
   - Leave blank or use empty quotes `""`
   - Both are treated as `null` in the database

4. **Special Characters**
   - Quotes inside text: Use double quotes `""`
   - Example: `"This is a ""great"" bike"`

5. **Numeric Values**
   - Price: `4999.99` or `$4,999.99` (both work)
   - Scores: `8` or `8.5` (decimals supported)
   - The system strips currency symbols and commas

## Upload Process

1. Navigate to `/admin/products/upload`
2. Select your CSV file
3. Click "Upload CSV"
4. The system will:
   - Parse the CSV (handling multi-line quoted fields)
   - Map legacy column names to new names
   - Validate required fields
   - Insert bikes in batches of 100
   - Report progress and errors

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|---|---|---|
| "Missing required fields" | Missing brand, model, year, or category | Ensure all required columns exist |
| "Duplicate slug" | Same brand/model/year combination | Add unique ID column or modify model names |
| Row-specific errors | Data format issues | Check the error message for the specific row number |

## Testing Your CSV

Before uploading 6k bikes:
1. Create a test CSV with 2-3 rows
2. Upload and verify:
   - All fields mapped correctly
   - Explanations appear on product pages
   - Images display properly
3. Once confirmed, upload the full dataset

---

**Your bike_sample_6k.csv is ready to upload without any modifications!**

The system will automatically map:
- `fit_reason` → `fit_flexibility_explanation`
- `vfm_reason` → `value_for_money_explanation`
- `build_reason` → `build_quality_explanation`
- `aero_reason` → `aerodynamics_explanation`
- `climb_reason` → `climbing_efficiency_explanation`
- `posture_reason` → `riding_position_explanation`
- `responsiveness_reason` → `handling_explanation`
- `comfort_reason` → `ride_comfort_explanation`
- `surface_reason` → `surface_range_explanation`
- `speed_reason` → `performance_score_explanation`
