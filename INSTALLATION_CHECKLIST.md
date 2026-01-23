# Installation Checklist

Use this checklist to verify your setup is complete and working.

## ✅ Pre-Installation

- [ ] Node.js 18 or higher installed
  - Run: `node --version` (should show v18.x.x or higher)
- [ ] npm installed
  - Run: `npm --version`
- [ ] Git installed (optional, for version control)
  - Run: `git --version`

## ✅ Supabase Setup

- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] New project created in Supabase
- [ ] Project URL copied from Settings → API
- [ ] Anon key copied from Settings → API
- [ ] Service role key copied from Settings → API
- [ ] Database schema created:
  - [ ] Opened SQL Editor in Supabase
  - [ ] Copied content from `supabase-schema.sql`
  - [ ] Ran SQL successfully (no errors)
  - [ ] Verified `bikes` table exists in Table Editor

## ✅ Project Setup

- [ ] Dependencies installed
  ```bash
  npm install
  ```
- [ ] No installation errors
- [ ] `node_modules` folder created
- [ ] `.env.local` file created (copied from `.env.local.example`)
- [ ] All environment variables filled in `.env.local`:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (your project URL)
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your anon key)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (your service role key)
  - [ ] `NEXT_PUBLIC_SITE_URL` (http://localhost:3000 for dev)

## ✅ Data Import

- [ ] `sample_for_website.csv` file exists in project root
- [ ] Import script ran successfully
  ```bash
  npm run import-data
  ```
- [ ] Import summary shows successful imports
- [ ] No errors in import process
- [ ] Verified bikes in Supabase Table Editor:
  - [ ] Go to Supabase → Table Editor → bikes
  - [ ] See 11 bikes (from sample CSV)
  - [ ] Data looks correct

## ✅ Development Server

- [ ] Server starts without errors
  ```bash
  npm run dev
  ```
- [ ] Server running on http://localhost:3000
- [ ] No error messages in terminal

## ✅ Homepage Test

- [ ] Open http://localhost:3000
- [ ] Page loads successfully
- [ ] See "BikeMax" title
- [ ] See 4 category cards:
  - [ ] Road Bikes
  - [ ] Mountain Bikes
  - [ ] Gravel Bikes
  - [ ] Electric Bikes
- [ ] Category cards are clickable
- [ ] No console errors (F12 → Console)

## ✅ Category Page Test

- [ ] Click "Road Bikes" category
- [ ] URL changes to `/roadbikes`
- [ ] See list of bikes
- [ ] Each bike shows:
  - [ ] Image (or placeholder)
  - [ ] Brand name
  - [ ] Model name
  - [ ] Price (if available)
  - [ ] Quick stats
- [ ] "Back to Home" link works
- [ ] No console errors

## ✅ Bike Detail Page Test

- [ ] Click on any bike in the list
- [ ] URL is like `/roadbikes/trek-checkpoint-alr-4-2025`
- [ ] Page loads successfully
- [ ] Desktop view (if screen > 1024px):
  - [ ] Two-column layout
  - [ ] Left: Name, description, image
  - [ ] Right: Scores and metrics
- [ ] Mobile view (if screen < 1024px):
  - [ ] Stacked layout
  - [ ] Score prominent at top
  - [ ] All content readable
- [ ] Content displays:
  - [ ] Bike name and model
  - [ ] Overall score (e.g., 8.4)
  - [ ] Star rating
  - [ ] Score summary cards (4 cards)
  - [ ] Performance metrics
  - [ ] Fit scores
  - [ ] Value scores
- [ ] Image gallery:
  - [ ] Main image shows
  - [ ] Thumbnails visible (if multiple images)
  - [ ] Click thumbnail changes main image
- [ ] Specifications section:
  - [ ] Organized by category (Frame, Drivetrain, etc.)
  - [ ] Data displays correctly
- [ ] Geometry section:
  - [ ] Table with size data
  - [ ] Multiple sizes shown
  - [ ] Measurements display correctly
- [ ] No console errors
- [ ] No 404 or loading errors

## ✅ Image Loading Test

- [ ] Images load (not broken)
- [ ] Main bike image visible
- [ ] Thumbnails load
- [ ] Images are optimized (Next.js blur placeholder)
- [ ] No CORS errors
- [ ] Check Network tab (F12) - images return 200 status

## ✅ SEO Test

- [ ] Visit http://localhost:3000/sitemap.xml
- [ ] XML sitemap displays
- [ ] See homepage entry
- [ ] See category entries
- [ ] See bike page entries
- [ ] All URLs are absolute (include domain)

- [ ] Visit http://localhost:3000/robots.txt
- [ ] robots.txt displays
- [ ] Contains sitemap reference
- [ ] Contains crawl rules

- [ ] Check page source (right-click → View Page Source)
  - [ ] See `<title>` tag with bike name
  - [ ] See `<meta name="description">` with content
  - [ ] See Open Graph tags (`og:title`, `og:description`, etc.)

## ✅ Responsive Design Test

- [ ] Test on mobile (or use browser DevTools)
  - [ ] F12 → Toggle device toolbar
  - [ ] Choose iPhone or Android device
  - [ ] Layout adjusts correctly
  - [ ] Text is readable
  - [ ] Buttons are touchable
  - [ ] Images resize properly

- [ ] Test on tablet
  - [ ] Choose iPad from DevTools
  - [ ] Layout works well
  - [ ] No horizontal scroll

- [ ] Test on desktop
  - [ ] Full-width layout
  - [ ] Two-column bike page
  - [ ] All content visible

## ✅ Performance Test

- [ ] Page loads in under 3 seconds
- [ ] Images load progressively
- [ ] No flickering or layout shifts
- [ ] Smooth scrolling
- [ ] Transitions work smoothly

## ✅ TypeScript Test

- [ ] No TypeScript errors shown in IDE
- [ ] Run build to check:
  ```bash
  npm run build
  ```
- [ ] Build completes successfully
- [ ] No type errors reported
- [ ] `.next` folder created

## ✅ Database Connection Test

- [ ] Bike data loads from Supabase (not hardcoded)
- [ ] Check Supabase logs:
  - [ ] Go to Supabase → Logs → API
  - [ ] See SELECT queries when loading pages
  - [ ] No error logs
  - [ ] Response times < 200ms

## ✅ Edge Cases

- [ ] Visit non-existent bike URL: `/roadbikes/fake-bike-123`
  - [ ] Shows 404 page
  - [ ] "Return Home" button works

- [ ] Visit non-existent category: `/fakecategory`
  - [ ] Shows 404 page or empty state

- [ ] Bike with no images
  - [ ] Shows placeholder
  - [ ] Doesn't crash

- [ ] Bike with missing data
  - [ ] Sections with no data don't show
  - [ ] No "null" or "undefined" displayed

## ✅ Console & Network

- [ ] Open DevTools (F12)
- [ ] Console tab:
  - [ ] No red errors
  - [ ] No warnings about missing env variables
  - [ ] No CORS errors

- [ ] Network tab:
  - [ ] All requests return 200 or 304
  - [ ] Images load successfully
  - [ ] No 404s or 500s
  - [ ] API calls to Supabase succeed

## ✅ Final Verification

- [ ] Can navigate: Home → Category → Bike → Back → Home
- [ ] All links work
- [ ] No broken images
- [ ] Data is accurate (matches CSV)
- [ ] Site looks professional
- [ ] Ready to add more bikes
- [ ] Ready to deploy

---

## 🎉 If All Checked

**Congratulations!** Your bike catalog is working perfectly!

### Next Steps:

1. **Add your bike data**: Replace `sample_for_website.csv` with your data and run import again
2. **Customize design**: Edit `tailwind.config.ts` and component styles
3. **Deploy to production**: Follow `DEPLOYMENT.md`

---

## ❌ If Something Failed

### Common Issues:

#### Environment Variables Not Loading
- Restart terminal/command prompt
- Ensure `.env.local` is in project root (not in subfolder)
- No extra spaces in variable values
- Restart dev server: `Ctrl+C` then `npm run dev`

#### Database Connection Errors
- Check Supabase credentials are correct
- Verify project is not paused (free tier pauses after 1 week)
- Check Supabase status page
- Try regenerating anon key in Supabase settings

#### Images Not Loading
- Check image URLs are accessible in browser
- Verify `next.config.js` has correct domains
- Try a different image URL format
- Clear Next.js cache: delete `.next` folder and rebuild

#### Import Script Fails
- Ensure CSV file is in root directory
- Check CSV format (UTF-8 encoding)
- Verify all column headers match expected format
- Check Supabase service role key has correct permissions

#### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check for TypeScript errors
- Update dependencies: `npm update`

---

## 📞 Need Help?

1. Check `README.md` for detailed docs
2. Review `SETUP_GUIDE.md` for step-by-step instructions
3. Read `DEPLOYMENT.md` if deploying
4. Check `PROJECT_SUMMARY.md` for overview

---

## 🔄 Reset & Start Fresh

If you need to start over:

```bash
# 1. Delete node_modules and build files
rm -rf node_modules .next

# 2. Delete environment file
rm .env.local

# 3. Reinstall
npm install

# 4. Copy environment template
cp .env.local.example .env.local

# 5. Fill in .env.local with your credentials

# 6. Re-import data
npm run import-data

# 7. Start server
npm run dev
```

---

**Save this checklist** - you can use it again when setting up on a new machine or for production deployment!
