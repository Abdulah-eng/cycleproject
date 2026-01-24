# Troubleshooting & Fixes Guide

## Issues Identified

After uploading 6k bikes to Supabase, you're experiencing:
1. ✅ **Homepage shows 6 bikes** (correct - this is the FeaturedBikes component)
2. ✅ **Category pages show all bikes** (correct - no limit set)
3. ✅ **Admin panel shows up to 10,000 bikes** (correct - intentional limit)
4. ❌ **Delete doesn't work** - Reloads page but doesn't delete from database

## Root Cause Analysis

### Delete Issue
The delete functionality is failing due to **Row Level Security (RLS)** being enabled on the `bikes` table in Supabase. Even though your code uses the SERVICE_ROLE_KEY, RLS policies may be blocking DELETE operations.

**Evidence:**
- SERVICE_ROLE_KEY is properly configured in `.env.local` ✓
- Delete API endpoint code is correct ✓
- Supabase server client is configured to use SERVICE_ROLE_KEY ✓
- **But RLS policies may still block the operation**

## Solutions

### Solution 1: Disable RLS (Recommended - Simplest)

**Step 1:** Run this SQL in Supabase SQL Editor:
```sql
ALTER TABLE bikes DISABLE ROW LEVEL SECURITY;
```

**Why this works:**
- Disables all RLS policies
- Allows SERVICE_ROLE_KEY full access
- Simplest solution for admin-only tables

**When to use:**
- If only admins will modify the bikes table
- If you don't need user-level permissions
- If you want the simplest setup

---

### Solution 2: Configure RLS Policies Correctly

If you want to keep RLS enabled for security:

**Step 1:** Run the comprehensive fix script:
```bash
# Open: d:\projects\cycleapp\supabase_fix_rls_and_consistency.sql
# Copy the entire PART 3 section
# Paste and run in Supabase SQL Editor
```

**Step 2:** Verify policies are created:
```sql
SELECT * FROM pg_policies WHERE tablename = 'bikes';
```

**What this does:**
- Creates policy for public READ access
- Creates policy for authenticated users FULL access
- Creates policy for service_role FULL access
- Allows delete operations while maintaining security

---

### Solution 3: Quick Test Delete Manually

To verify the issue is RLS-related:

**Step 1:** Try deleting directly in Supabase:
1. Open Supabase Dashboard
2. Go to Table Editor → bikes
3. Try to delete a row manually
4. If it fails → RLS is blocking it

**Step 2:** Check current RLS status:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'bikes';
```

If `rowsecurity = true`, RLS is enabled.

---

## Complete Fix Process

### Phase 1: Fix Database (Choose ONE option)

**Option A: Disable RLS (Quick Fix)**
```sql
-- Run in Supabase SQL Editor
ALTER TABLE bikes DISABLE ROW LEVEL SECURITY;
```

**Option B: Configure RLS Properly**
```sql
-- Run the entire script from:
d:\projects\cycleapp\supabase_fix_rls_and_consistency.sql
```

### Phase 2: Verify Environment Variables

Check that your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://cenzkykbmfjzntkuuxcs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Your file is correct!**

### Phase 3: Test Delete Functionality

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to admin panel:**
   ```
   http://localhost:3000/admin/products
   ```

3. **Try deleting a bike:**
   - Click "Delete" button
   - Confirm the dialog
   - Page should reload
   - Bike should be removed from list
   - **Verify in Supabase:** Bike should be deleted from table

### Phase 4: Verify Database Consistency

Run this query in Supabase SQL Editor:
```sql
-- Check total bikes
SELECT COUNT(*) FROM bikes;

-- Check by category
SELECT category, COUNT(*)
FROM bikes
GROUP BY category
ORDER BY COUNT(*) DESC;
```

Expected results:
- Should show actual count from your CSV (around 6000)
- Categories should match your data

---

## Understanding The System

### Query Limits Explained

| Page/Component | Limit | Reason | Correct? |
|---|---|---|---|
| **Homepage** | | | |
| - Hero stats | No limit | Shows total count | ✅ Yes |
| - Featured Bikes | 6 bikes | Top 6 by VFM score | ✅ Yes |
| - Categories | No limit | All categories | ✅ Yes |
| **Category Pages** | No limit | All bikes in category | ✅ Yes |
| **Search Results** | 50 bikes | Prevents overwhelming UI | ✅ Yes |
| **Admin Dashboard** | 5 bikes | Recent bikes widget | ✅ Yes |
| **Admin Products** | 10,000 bikes | Full inventory view | ✅ Yes |
| **Product Detail (ISR)** | 1,000 pages | Build-time generation | ✅ Yes |

**All limits are intentional and correct!**

### Why Homepage Shows "24+"

This is just placeholder text in the design. The actual count comes from the database:
- The Hero section shows: `{totalBikes}+` (e.g., "6000+")
- This pulls from all bikes in the database
- No 24-bike limit exists in the code

If you're seeing "24" specifically:
1. Check your browser cache (hard refresh: Ctrl+Shift+R)
2. Check if old data is cached
3. Verify database has 6000 bikes

---

## Delete Functionality Deep Dive

### How It Should Work

1. **User clicks Delete** → Confirmation dialog appears
2. **User confirms** → JavaScript calls `/api/admin/bikes/[id]`
3. **API checks auth** → Verifies user is logged in
4. **API calls Supabase** → Uses SERVICE_ROLE_KEY to delete
5. **Supabase deletes** → Row removed from database
6. **API returns success** → Page reloads
7. **Bike is gone** → No longer in admin list or database

### What's Happening (Current Bug)

1. ✅ User clicks Delete → Works
2. ✅ Confirmation dialog → Works
3. ✅ API called → Works
4. ✅ Auth check passes → Works
5. ❌ **Supabase delete BLOCKED** → RLS denies operation
6. ⚠️ API returns "success" → No error thrown (bad!)
7. ✅ Page reloads → Works
8. ❌ Bike still there → Delete never happened

### The Fix

**Root cause:** RLS policy blocks DELETE even for SERVICE_ROLE

**Solution:** Disable RLS or add proper policies (see Solution 1 or 2 above)

---

## Post-Fix Verification Checklist

After applying fixes:

### ✅ Database Checks
- [ ] Run RLS status check: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'bikes';`
- [ ] Verify RLS is disabled OR proper policies exist
- [ ] Count bikes: `SELECT COUNT(*) FROM bikes;` → Should match your CSV
- [ ] Check indexes created: `SELECT indexname FROM pg_indexes WHERE tablename = 'bikes';`

### ✅ Frontend Checks
- [ ] Homepage shows correct total (6000+)
- [ ] Featured bikes section shows 6 bikes
- [ ] Category pages show all bikes (no 24 limit)
- [ ] Search works and shows up to 50 results
- [ ] Admin dashboard shows recent 5 bikes
- [ ] Admin products page shows all bikes (up to 10,000)

### ✅ Delete Functionality
- [ ] Navigate to `/admin/products`
- [ ] Click Delete on any bike
- [ ] Confirm deletion
- [ ] Bike disappears from list
- [ ] **Verify in Supabase:** Bike is deleted from table
- [ ] **Verify count decreases:** Run `SELECT COUNT(*) FROM bikes;`

---

## Common Errors & Solutions

### Error: "Failed to delete bike"

**Cause:** RLS is blocking the operation

**Solution:**
```sql
ALTER TABLE bikes DISABLE ROW LEVEL SECURITY;
```

### Error: "Unauthorized"

**Cause:** User is not logged in

**Solution:**
1. Go to `/admin/login`
2. Log in with your credentials
3. Try delete again

### Error: Delete seems to work but bike reappears

**Cause:** RLS is silently failing, API returns success anyway

**Solution:**
1. Check Supabase logs in Dashboard → Logs
2. Look for DELETE errors
3. Run RLS fix script

### Bikes not showing on category pages

**Cause:** Case sensitivity in category names

**Current Fix:** Code uses `.ilike()` for case-insensitive matching ✓

**Verify:**
```sql
SELECT DISTINCT category FROM bikes;
```

Should show categories like: "Road", "Mountain", etc.

### Admin panel only shows 1000 bikes

**Cause:** Admin products page has `.limit(10000)`

**Solution:** This is intentional. If you have more than 10,000 bikes:
- Implement pagination
- Or increase limit
- Or add filtering

**Code location:** `app/admin/products/page.tsx:11`

---

## Quick Reference

### Supabase SQL Editor
`https://supabase.com/dashboard/project/cenzkykbmfjzntkuuxcs/editor`

### Important SQL Queries

**Check RLS status:**
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'bikes';
```

**Disable RLS:**
```sql
ALTER TABLE bikes DISABLE ROW LEVEL SECURITY;
```

**Count bikes:**
```sql
SELECT COUNT(*) FROM bikes;
```

**Check categories:**
```sql
SELECT category, COUNT(*) FROM bikes GROUP BY category;
```

**View recent deletes (if logging enabled):**
```sql
-- Requires audit logging - not enabled by default
```

---

## Still Having Issues?

### Debug Steps

1. **Enable verbose logging:**
   ```typescript
   // In app/api/admin/bikes/[id]/route.ts
   console.log('🗑️ Delete request for bike ID:', params.id)
   console.log('🔑 Using key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20))
   ```

2. **Check Supabase logs:**
   - Dashboard → Logs → API
   - Look for DELETE requests
   - Check for 403/401 errors

3. **Test with direct SQL:**
   ```sql
   DELETE FROM bikes WHERE id = 123;  -- Replace with actual ID
   ```
   If this fails in SQL Editor → RLS is the issue

4. **Verify SERVICE_ROLE_KEY:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy SERVICE_ROLE_KEY
   - Compare with `.env.local`
   - Should match exactly

---

## Summary

**Main Issue:** RLS blocking DELETE operations

**Quick Fix:**
```sql
ALTER TABLE bikes DISABLE ROW LEVEL SECURITY;
```

**Verification:**
1. Restart server: `npm run dev`
2. Login to admin: `/admin/login`
3. Go to products: `/admin/products`
4. Delete a bike
5. Verify in Supabase table

**Expected Result:** Bike deleted successfully from both admin panel and database
