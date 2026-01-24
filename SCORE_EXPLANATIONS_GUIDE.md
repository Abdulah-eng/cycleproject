# Score Explanations Feature Guide

## Overview

The BikeMax catalog now includes an **accordion-style expandable explanation feature** for all score cards. When users click on a score card, it expands to show a detailed explanation of why that particular score was assigned.

## Features

- **Interactive Score Cards**: Click any score card to expand and view explanation
- **Smooth Animations**: Accordion-style expansion with rotating chevron icon
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Optional Content**: Explanations only show if data is available
- **Visual Feedback**: Cursor changes to pointer when hovering over cards with explanations

## Implementation Guide

### 1. Database Setup

Run the SQL script to add explanation columns to your Supabase database:

**File**: `supabase_add_explanations.sql`

```bash
# In Supabase SQL Editor, run:
d:\projects\cycleapp\supabase_add_explanations.sql
```

This adds 14 new columns:
- `overall_score_explanation`
- `performance_score_explanation`
- `value_score_explanation`
- `fit_score_explanation`
- `general_score_explanation`
- `climbing_efficiency_explanation`
- `aerodynamics_explanation`
- `riding_position_explanation`
- `handling_explanation`
- `fit_flexibility_explanation`
- `ride_comfort_explanation`
- `build_quality_explanation`
- `value_for_money_explanation`
- `surface_range_explanation`

### 2. CSV Upload Format

Use the updated CSV format to include explanations when bulk uploading bikes.

**Sample File**: `sample_csv_with_explanations.csv`

**Column Headers**:
```csv
brand,model,year,category,...,overall_score_explanation,performance_score_explanation,...
```

**Tips for CSV Explanations**:
- Keep explanations concise (2-4 sentences)
- Focus on **why** the score was given, not just what it is
- Use quotes if your explanation contains commas
- Multi-line explanations are supported (use quotes)

**Example**:
```csv
Trek,Domane SL 7,2025,Road,Endurance,4999.99,...,"This bike offers an excellent balance of comfort and performance, making it ideal for long-distance rides.","The lightweight carbon frame provides efficient power transfer while maintaining rider comfort.",…
```

### 3. Manual Product Upload

When manually adding products through the admin panel:

1. Navigate to `/admin/products/new`
2. Fill in basic product information
3. Scroll to **"Score Explanations"** section
4. Add explanations for any scores you want users to understand better
5. All explanation fields are **optional**

**Form Sections**:
- Overall & Summary Scores (5 fields)
- Performance Metrics (2 fields)
- Fit & Comfort Metrics (4 fields)
- Value Metrics (3 fields)

### 4. User Experience

**On Desktop**:
- Hover over score card → cursor changes to pointer (if explanation exists)
- Click score card → smooth expansion with explanation text
- Chevron icon rotates to indicate state
- Click again to collapse

**On Mobile**:
- Tap score card to expand
- Tap again to collapse
- Touch-friendly target sizes

**Visual Indicators**:
- Chevron down arrow icon appears next to score when explanation exists
- No icon = no explanation available
- Smooth transition animations

## Best Practices for Writing Explanations

### Good Explanation Examples

✅ **Performance Score**: "The lightweight carbon frame and aerodynamic tube shapes deliver exceptional speed on flat roads and climbs. However, the aggressive geometry may sacrifice some comfort on longer rides."

✅ **Value Score**: "At $3,299, this bike offers Ultegra components and full carbon construction typically found on bikes $1,000 more expensive, making it an excellent value proposition."

✅ **Fit Score**: "The adjustable stem and multiple frame sizes accommodate riders from 5'4" to 6'4", but the aggressive race geometry requires good flexibility."

### Avoid These Mistakes

❌ Too vague: "This bike is good."
❌ Too technical: "The modulus carbon layup utilizes T700 fiber..."
❌ Just restating the score: "This bike scores 8.5 for performance."

### Writing Guidelines

1. **Be Specific**: Mention actual features or measurements
2. **Explain Trade-offs**: Why did it get this score instead of higher/lower?
3. **Consider the Audience**: Write for cyclists who know bikes but aren't engineers
4. **Keep it Concise**: 2-4 sentences max (50-100 words)
5. **Focus on "Why"**: Not just what the bike has, but why it matters

## Technical Details

### Component Changes

**ScoreCard Component** (`components/ScoreCard.tsx`):
- Now a client component ('use client')
- Added `explanation` prop (optional)
- Added `isExpanded` state
- Added click handler for accordion functionality
- Renders chevron icon when explanation exists
- Smooth height transitions

**Product Page** (`app/[category]/[slug]/page.tsx`):
- Passes explanation props to all ScoreCard components
- Both desktop and mobile layouts updated

**CSV Upload** (`app/api/admin/bikes/upload/route.ts`):
- Added explanation fields to parsing logic
- Automatically maps CSV columns to database fields

**Manual Form** (`app/admin/products/new/page.tsx`):
- Added 14 textarea fields for explanations
- Organized by category for easy data entry
- All fields optional

## Troubleshooting

### Explanations Not Showing

1. **Check Database**: Ensure SQL script ran successfully
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'bikes' AND column_name LIKE '%explanation%';
   ```

2. **Check Data**: Verify explanation text exists in database
   ```sql
   SELECT brand, model, performance_score_explanation
   FROM bikes
   WHERE performance_score_explanation IS NOT NULL
   LIMIT 5;
   ```

3. **Check Props**: Ensure product page is passing explanation to ScoreCard

### Click Not Working

- Verify ScoreCard component has 'use client' directive
- Check browser console for React errors
- Ensure explanation prop contains actual text (not null/empty)

### CSV Upload Issues

- Use quotes around explanation text containing commas
- Check for proper column header naming
- Verify file encoding is UTF-8

## Future Enhancements

Potential additions:
- Admin UI to edit explanations without re-uploading
- AI-generated explanation suggestions
- User feedback on explanation helpfulness
- Translation support for multi-language explanations

---

**Last Updated**: 2025-01-24
**Version**: 1.0.0
