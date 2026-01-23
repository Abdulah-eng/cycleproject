# Quick Setup Guide

Follow these steps to get your bike catalog website running.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details and create

### 2.2 Get Your Credentials
1. Go to Project Settings → API
2. Copy the following:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - `anon` `public` key
   - `service_role` `secret` key

### 2.3 Create Database Schema
1. In Supabase dashboard, click "SQL Editor"
2. Click "New Query"
3. Open `supabase-schema.sql` from this project
4. Copy all the SQL code
5. Paste into Supabase SQL Editor
6. Click "Run" to execute

This creates:
- `bikes` table with all columns
- Indexes for performance
- Row Level Security policies
- Helper functions and views

## Step 3: Configure Environment Variables

### 3.1 Create .env.local file
```bash
cp .env.local.example .env.local
```

### 3.2 Edit .env.local
Open `.env.local` and replace with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

⚠️ **Important**:
- Use the exact URLs and keys from your Supabase project
- Don't share your service role key publicly
- For production, update `NEXT_PUBLIC_SITE_URL` to your domain

## Step 4: Import Bike Data

Make sure `sample_for_website.csv` is in the project root, then run:

```bash
npm run import-data
```

You should see:
```
Starting bike import...
Found 11 bikes in CSV
Importing batch 1 (11 bikes)...
✓ Successfully imported batch

=== Import Summary ===
Total bikes processed: 11
Successfully imported: 11
Errors: 0

Import complete!
```

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the homepage with bike categories.

## Step 6: Test the Site

### Test Homepage
- Go to `http://localhost:3000`
- You should see category cards

### Test Category Page
- Click on a category (e.g., "Road Bikes")
- URL should be like: `http://localhost:3000/roadbikes`
- You should see a grid of bikes

### Test Bike Detail Page
- Click on any bike
- URL should be like: `http://localhost:3000/roadbikes/trek-checkpoint-alr-4-2025`
- You should see:
  - Bike images
  - Performance scores
  - Specifications
  - Geometry table

### Test SEO
- Visit `http://localhost:3000/sitemap.xml`
- You should see XML sitemap with all bike URLs

## Troubleshooting

### Problem: "Missing Supabase environment variables"

**Solution**: Check that `.env.local` exists and has all required variables.

### Problem: Import script fails with "Missing Supabase credentials"

**Solution**:
1. Make sure `.env.local` is in the project root
2. Restart your terminal/command prompt
3. Try running the import again

### Problem: "CSV file not found"

**Solution**: Make sure `sample_for_website.csv` is in the project root directory.

### Problem: Database error during import

**Solution**:
1. Verify you ran the `supabase-schema.sql` in Supabase SQL Editor
2. Check that the `bikes` table exists in Supabase Table Editor
3. Verify your service role key has correct permissions

### Problem: Images not loading

**Solution**:
1. Check that image URLs in CSV are accessible
2. Verify `next.config.js` has correct image domains
3. Wait a few seconds for Next.js to optimize images

### Problem: 404 on bike pages

**Solution**:
1. Make sure bikes were imported successfully
2. Check Supabase Table Editor to verify data exists
3. Try building the site: `npm run build`

## Next Steps

### Add More Bikes
1. Update `sample_for_website.csv` with your bike data
2. Run `npm run import-data` again
3. Bikes with existing slugs will be updated, new ones will be added

### Deploy to Production

#### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy

#### Option 2: Build Locally
```bash
npm run build
npm start
```

### Customize Design
- Edit `tailwind.config.ts` for theme colors
- Modify components in `components/` folder
- Update layouts in `app/` folder

## Support

If you encounter issues:
1. Check this guide again
2. Review error messages carefully
3. Verify all environment variables are correct
4. Check Supabase logs in dashboard

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase project created
- [ ] Database schema created in Supabase
- [ ] `.env.local` file created with correct credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Data imported (`npm run import-data`)
- [ ] Dev server running (`npm run dev`)
- [ ] Site accessible at localhost:3000
- [ ] Bike pages loading correctly
- [ ] Images displaying properly

Once all checkboxes are complete, your bike catalog is ready! 🚴‍♂️
