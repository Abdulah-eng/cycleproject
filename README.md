# BikeMax - Scalable Bicycle Catalog Website

A high-performance, SEO-optimized bicycle catalog built with Next.js 14, Supabase, and TypeScript. Designed to scale to 30,000-50,000 bike listings with server-side rendering (SSR) and Incremental Static Regeneration (ISR).

## Features

- **SEO Optimized**: Server-side rendering with dynamic meta tags and automatic sitemap generation
- **High Performance**: ISR with 1-hour revalidation for optimal speed and freshness
- **Scalable**: Efficiently handles 30k-50k bike listings
- **Responsive Design**: Mobile-first design matching provided mockups
- **Rich Metrics**: Performance scores, fit metrics, and detailed specifications
- **Dynamic Routing**: SEO-friendly URLs like `/roadbikes/trek-checkpoint-alr-4-2025`
- **Image Gallery**: Multi-image support with thumbnail navigation
- **Database-Driven**: PostgreSQL via Supabase with full-text search

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Image Optimization**: Next.js Image component

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git

### 1. Clone and Install

```bash
cd cycleapp
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and keys

### 3. Create Database Schema

1. In Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Run the SQL to create the `bikes` table and indexes

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### 5. Import Bike Data

Import the sample CSV data into your Supabase database:

```bash
npm run import-data
```

This will:
- Read `sample_for_website.csv`
- Transform and validate the data
- Import all bikes into your Supabase database
- Handle slug generation and data normalization

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
cycleapp/
├── app/
│   ├── [category]/
│   │   └── [slug]/
│   │       └── page.tsx        # Dynamic bike detail pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles
│   ├── sitemap.ts              # Dynamic sitemap generation
│   └── robots.ts               # Robots.txt configuration
├── components/
│   ├── ScoreCard.tsx           # Score display component
│   ├── SpecsTable.tsx          # Specifications table
│   └── ImageGallery.tsx        # Image gallery with thumbnails
├── lib/
│   ├── supabase.ts             # Supabase client & types
│   └── utils.ts                # Utility functions
├── scripts/
│   └── import-bikes.js         # CSV import script
├── supabase-schema.sql         # Database schema
├── sample_for_website.csv      # Sample bike data
└── package.json
```

## Key Features Explained

### ISR (Incremental Static Regeneration)

Pages are statically generated at build time and revalidated every hour:

```typescript
export const revalidate = 3600 // 1 hour
```

This provides:
- Lightning-fast page loads
- Fresh content updates
- Reduced database load
- SEO benefits of static pages

### Dynamic Routing

Bikes are accessible via SEO-friendly URLs:
- `/roadbikes/trek-checkpoint-alr-4-2025`
- `/mountainbikes/giant-tcr-advanced-1-kom-2025`

### Automatic Sitemap

The sitemap is automatically generated from your database and includes:
- Homepage
- Category pages
- All bike detail pages

Access at: `/sitemap.xml`

### Performance Metrics

Each bike displays calculated metrics:
- Overall Score
- Performance (climbing, aerodynamics)
- Value (build quality, value for money)
- Fit (flexibility, comfort)
- General scores

### Mobile-First Design

The UI adapts seamlessly:
- Desktop: Two-column layout with specs and scores
- Mobile: Stacked layout optimized for touch

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Build for Production

```bash
npm run build
npm start
```

## Database Schema

The `bikes` table includes:
- Basic info (brand, model, year, price)
- Specifications (frame, drivetrain, wheels, etc.)
- Performance metrics (scores 1-10)
- Geometry data
- SEO fields (title, meta_desc, slug)
- Images (array of URLs)

## Import Script Details

The import script (`scripts/import-bikes.js`):
- Reads CSV with all bike data
- Generates unique slugs
- Parses arrays (images, size guide)
- Validates and transforms data types
- Batch imports for efficiency
- Uses upsert for idempotency

## Customization

### Adding New Categories

Update the homepage in `app/page.tsx`:

```typescript
const categories = [
  { name: 'Road Bikes', slug: 'roadbikes', ... },
  // Add your category here
]
```

### Modifying Score Calculations

Edit `lib/utils.ts` → `calculateBikeMetrics()` function.

### Styling Changes

All styles use Tailwind CSS. Modify:
- `tailwind.config.ts` for theme changes
- `app/globals.css` for global styles

## Performance Optimization

- Images are optimized via Next.js Image component
- Database queries use select() to fetch only needed fields
- Indexes on category, brand, and slug for fast queries
- ISR reduces database load
- Batch imports handle large datasets efficiently

## SEO Features

- Dynamic meta tags (title, description)
- Open Graph tags for social sharing
- Automatic sitemap.xml generation
- Semantic HTML structure
- Mobile-friendly design
- Fast page loads (Core Web Vitals)

## Troubleshooting

### Import Fails

- Check `.env.local` has correct credentials
- Verify `sample_for_website.csv` exists in root
- Ensure database schema is created

### Images Not Loading

- Check image URLs are accessible
- Verify `next.config.js` has correct domain
- Ensure images array is properly formatted

### Build Errors

- Run `npm install` to ensure dependencies
- Check TypeScript errors with `npm run build`
- Verify environment variables are set

## Future Enhancements

- [ ] Search functionality
- [ ] Filter by specifications
- [ ] Comparison tool
- [ ] User reviews
- [ ] Wishlist feature
- [ ] Price tracking
- [ ] Admin dashboard

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
