# 🔐 Admin Panel Documentation

## Overview

Your BikeMax admin panel is a complete product management system that allows administrators to:
- ✅ Add individual bikes manually
- ✅ Bulk upload bikes via CSV files
- ✅ View and manage all products
- ✅ Monitor inventory statistics
- ✅ Secure authentication with Supabase Auth

---

## 🚀 Getting Started

### 1. Create Admin User

Before you can access the admin panel, you need to create an admin user in Supabase:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user**
4. Enter email and password
5. Click **Create user**

**Option B: Using SQL (Recommended for first user)**
```sql
-- This creates a user with a known password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  raw_app_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@bikemax.com',
  crypt('your-secure-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{}',
  FALSE,
  '{}'
);
```

### 2. Enable Email Provider in Supabase

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email settings (or use default)

### 3. Update Environment Variables

Make sure your `.env.local` has the required Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📍 Admin Routes

### Login Page
**URL**: `/admin/login`
- Public route (redirects to dashboard if already logged in)
- Email/password authentication
- Secure session management

### Dashboard
**URL**: `/admin/dashboard`
- Protected route (requires authentication)
- Shows key statistics:
  - Total bikes count
  - Number of categories
  - Number of brands
  - Average price
- Quick action buttons
- Recent products list

### Add Product (Manual)
**URL**: `/admin/products/new`
- Manual single product entry form
- Fields included:
  - **Required**: Brand, Model, Year, Category
  - **Optional**: Price, Weight, Components, Ratings, Description
- Auto-generates slug from brand/model/year
- Validates data before submission

### Upload CSV
**URL**: `/admin/products/upload`
- Drag-and-drop file upload
- Bulk import from CSV files
- Shows upload progress and results
- Error reporting for failed rows
- Download sample CSV template

### All Products
**URL**: `/admin/products`
- List all bikes in database
- Table view with images
- Filter and search (coming soon)
- View/Delete actions
- Quick stats summary

---

## 📤 CSV Upload Guide

### CSV Format Requirements

**Required Columns:**
- `brand` - Manufacturer name (e.g., Trek)
- `model` - Model name (e.g., Domane SL 5)
- `year` - Model year (e.g., 2024)
- `category` - Must be one of: Road, Mountain, Gravel, Electric, Hybrid

**Optional Columns:**
- `price` - Price in USD (numeric, no $ symbol)
- `weight_kg` - Weight in kilograms (numeric)
- `frame_material` - e.g., Carbon, Aluminum
- `groupset` - e.g., Shimano 105
- `wheels` - Wheel model
- `tyres` - Tire specification
- `brakes` - Brake type
- `fork` - Fork specification
- `description` - Bike description (text)
- `vfm_score_1_to_10` - Value for money (0-10)
- `build_1_10` - Build quality (0-10)
- `speed_index` - Speed rating (numeric)
- `ride_comfort_1_10` - Comfort rating (0-10)

### Sample CSV

Download the template: `/sample-bikes.csv`

```csv
brand,model,year,category,price,weight_kg,frame_material,groupset,wheels,tyres,brakes,fork,description,vfm_score_1_to_10,build_1_10,speed_index,ride_comfort_1_10
Trek,Domane SL 5,2024,Road,2999,8.5,Carbon,Shimano 105,Bontrager Affinity,28mm,Hydraulic disc,Carbon,"Endurance road bike perfect for long rides",8.5,9.0,85.5,8.0
Specialized,Rockhopper Comp,2024,Mountain,1200,13.5,Aluminum,Shimano Deore,Stout XC,2.3",Hydraulic disc,SR Suntour XCR,"Trail-ready hardtail",8.0,7.5,70.0,7.0
```

### Upload Process

1. **Prepare your CSV file**
   - Use UTF-8 encoding
   - Include header row with column names
   - Ensure required fields are populated
   - Use consistent category names

2. **Upload the file**
   - Go to `/admin/products/upload`
   - Drag and drop CSV or click Browse
   - Click "Upload CSV" button

3. **Review results**
   - See total rows processed
   - View successful imports count
   - Check failed rows with error messages
   - Fix errors and re-upload if needed

4. **Automatic features**
   - Slugs are auto-generated
   - Duplicate slugs are handled
   - Invalid rows are skipped with errors
   - Batch processing for performance

---

## 🔒 Security Features

### Authentication
- ✅ Supabase Auth integration
- ✅ Secure session management
- ✅ JWT-based authentication
- ✅ Cookie-based sessions

### Route Protection
- ✅ Middleware guards all `/admin/*` routes
- ✅ Redirects unauthorized users to login
- ✅ Redirects logged-in users away from login page

### API Protection
- ✅ All admin API routes check authentication
- ✅ Uses service role key for database operations
- ✅ Prevents unauthorized data access

---

## 🎨 Admin Panel Features

### Dashboard
- **Real-time statistics** from database
- **Quick action cards** with gradient backgrounds
- **Recent products** feed
- **Responsive design** for mobile/tablet

### Navigation
- **Persistent top navigation** across all admin pages
- **Active route highlighting**
- **Mobile-responsive menu**
- **User email display**
- **Logout button**

### Forms
- **Comprehensive validation**
- **Loading states** with spinners
- **Success/error messages**
- **Auto-redirect after success**
- **Reset functionality**

### CSV Upload
- **Drag-and-drop interface**
- **File preview** before upload
- **Progress tracking**
- **Detailed error reporting**
- **Batch processing** (100 rows per batch)

---

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** - App Router with Server Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hooks** - State management

### Backend
- **Next.js API Routes** - REST endpoints
- **Supabase** - Database and Auth
- **Server Components** - SSR for admin pages

### Authentication
- **Supabase Auth** - User management
- **@supabase/ssr** - Server-side auth
- **Middleware** - Route protection

---

## 📁 File Structure

```
app/
├── admin/
│   ├── layout.tsx              # Admin layout with navigation
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── dashboard/
│   │   └── page.tsx           # Main dashboard
│   ├── products/
│   │   ├── page.tsx           # Products list
│   │   ├── new/
│   │   │   └── page.tsx       # Add single product
│   │   └── upload/
│   │       └── page.tsx       # CSV upload
│   └── api/
│       └── admin/
│           └── bikes/
│               ├── route.ts    # Create bike API
│               └── upload/
│                   └── route.ts # CSV upload API

components/
└── admin/
    └── AdminNav.tsx            # Admin navigation component

lib/
├── auth.ts                     # Auth helper functions
└── supabase.ts                # Supabase clients

middleware.ts                   # Route protection
```

---

## 🚦 Common Operations

### Adding a Single Product

1. Navigate to `/admin/products/new`
2. Fill in required fields:
   - Brand (e.g., Trek)
   - Model (e.g., Domane SL 5)
   - Year (e.g., 2024)
   - Category (select from dropdown)
3. Add optional fields as needed
4. Click "Create Product"
5. Redirected to dashboard on success

### Bulk Upload via CSV

1. Prepare CSV file with correct format
2. Navigate to `/admin/products/upload`
3. Drag CSV file or click Browse
4. Review file preview
5. Click "Upload CSV"
6. Wait for processing
7. Review results (success/errors)
8. Fix any errors and re-upload if needed

### Viewing All Products

1. Navigate to `/admin/products`
2. See table with all bikes
3. Click "View" to see product page
4. Click "Delete" to remove (confirmation required)

### Logging Out

1. Click "Logout" button in top navigation
2. Session cleared
3. Redirected to login page

---

## ⚠️ Troubleshooting

### Cannot Login
**Problem**: Email/password not working
**Solutions**:
- Verify user exists in Supabase Auth dashboard
- Check email is confirmed
- Reset password in Supabase dashboard
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

### CSV Upload Fails
**Problem**: File won't upload or errors occur
**Solutions**:
- Check CSV format matches template
- Ensure UTF-8 encoding
- Verify required fields are present
- Check for special characters in data
- Review error messages for specific rows

### Products Not Showing
**Problem**: Uploaded products don't appear
**Solutions**:
- Check database using Supabase dashboard
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check browser console for errors
- Verify category names are valid

### Session Expires
**Problem**: Logged out unexpectedly
**Solutions**:
- Sessions last 1 hour by default
- Just log in again
- Session refresh can be configured in Supabase

---

## 🎯 Best Practices

### Data Entry
1. **Use consistent naming**
   - Capitalize brand names properly
   - Use full model names
   - Standardize component descriptions

2. **Complete information**
   - Add prices when available
   - Include key specifications
   - Write descriptive descriptions

3. **Quality images**
   - Use high-resolution product images
   - Maintain consistent aspect ratios
   - Optimize file sizes for web

### CSV Uploads
1. **Test with small batches first**
   - Upload 5-10 rows initially
   - Verify data looks correct
   - Then upload full dataset

2. **Keep backups**
   - Save original CSV files
   - Export from database periodically
   - Version control your data

3. **Validate before upload**
   - Check required fields
   - Verify numeric values
   - Remove duplicate rows

---

## 📊 Performance

### Upload Limits
- **Batch size**: 100 rows per batch
- **File size**: No hard limit (browser dependent)
- **Processing**: Sequential batches for reliability

### Optimization Tips
- Upload during off-peak hours for large datasets
- Split very large CSV files (>10,000 rows)
- Close other browser tabs during upload
- Ensure stable internet connection

---

## 🔮 Future Enhancements

Potential features to add:
- [ ] Product editing functionality
- [ ] Image upload for products
- [ ] Advanced search and filtering
- [ ] Bulk delete operations
- [ ] Export to CSV
- [ ] Product categories management
- [ ] User roles (admin/editor/viewer)
- [ ] Activity logs
- [ ] Analytics dashboard

---

## 🆘 Support

If you encounter issues:

1. **Check browser console** for error messages
2. **Review Supabase logs** in dashboard
3. **Verify environment variables** are correct
4. **Test with sample data** first
5. **Check network connectivity**

---

## ✅ Quick Start Checklist

- [ ] Create admin user in Supabase
- [ ] Set environment variables in `.env.local`
- [ ] Enable email auth in Supabase
- [ ] Access `/admin/login` and sign in
- [ ] Test adding a single product
- [ ] Download sample CSV template
- [ ] Test CSV upload with sample data
- [ ] View products on public site
- [ ] Customize as needed

---

## 🎉 You're Ready!

Your admin panel is fully functional and ready to manage your BikeMax inventory. Start by logging in at `/admin/login` and explore the features!

**Admin Login URL**: `http://localhost:3000/admin/login`

For production, update `NEXT_PUBLIC_SITE_URL` to your actual domain.
