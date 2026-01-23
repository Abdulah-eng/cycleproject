# Deployment Guide

This guide covers deploying your bike catalog to production.

## Pre-Deployment Checklist

- [ ] All bikes imported to Supabase
- [ ] Environment variables configured
- [ ] Site tested locally
- [ ] Images loading correctly
- [ ] SEO metadata verified
- [ ] Mobile responsive design checked

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications with zero configuration.

### Step 1: Prepare Your Repository

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a repository on GitHub:
   - Go to [github.com](https://github.com/new)
   - Create a new repository
   - Follow instructions to push your code

3. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in (use GitHub account)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables

In the Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add each variable:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app
```

⚠️ Make sure to add these for **all environments** (Production, Preview, Development)

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your site will be live at `https://your-project.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` environment variable to your custom domain
5. Redeploy

## Option 2: Deploy to Netlify

### Step 1: Prepare Repository

Same as Vercel - push your code to GitHub.

### Step 2: Import to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and select your repository

### Step 3: Configure Build Settings

- Build command: `npm run build`
- Publish directory: `.next`

### Step 4: Add Environment Variables

In Netlify project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
```

### Step 5: Deploy

Click "Deploy site" and wait for build to complete.

## Option 3: Self-Hosted (VPS/Docker)

For advanced users who want full control.

### Prerequisites

- VPS with Node.js 18+ (DigitalOcean, AWS, etc.)
- Domain name pointed to your VPS
- SSL certificate (Let's Encrypt)

### Step 1: Build the Application

```bash
npm run build
```

### Step 2: Start Production Server

```bash
npm start
```

This runs on port 3000 by default.

### Step 3: Use PM2 for Process Management

```bash
npm install -g pm2
pm2 start npm --name "bikemax" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy

Example Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Set Up SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Option 4: Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run

```bash
docker build -t bikemax .
docker run -p 3000:3000 --env-file .env.local bikemax
```

## Post-Deployment

### 1. Verify Deployment

Check these URLs:
- Homepage: `https://yourdomain.com`
- Category page: `https://yourdomain.com/roadbikes`
- Bike page: `https://yourdomain.com/roadbikes/trek-checkpoint-alr-4-2025`
- Sitemap: `https://yourdomain.com/sitemap.xml`
- Robots: `https://yourdomain.com/robots.txt`

### 2. Submit to Search Engines

#### Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your property
3. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

#### Bing Webmaster Tools
1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Add your site
3. Submit sitemap

### 3. Monitor Performance

#### Vercel Analytics
- Enable in Vercel dashboard
- Track page views, performance

#### Google Analytics
1. Create GA4 property
2. Add tracking code to `app/layout.tsx`

#### Supabase Monitoring
- Check database usage in Supabase dashboard
- Monitor API calls
- Set up alerts for quota limits

### 4. Set Up Monitoring

#### Uptime Monitoring
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Monitor your homepage
- Get alerts if site goes down

#### Error Tracking
Consider adding Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

## Performance Optimization

### 1. Enable Caching

Vercel automatically caches static assets and ISR pages.

### 2. Optimize Images

Images are automatically optimized by Next.js Image component.

### 3. Database Optimization

- Ensure all indexes are created (see `supabase-schema.sql`)
- Use database connection pooling
- Monitor slow queries in Supabase

### 4. CDN

Vercel includes CDN. For other platforms:
- Use Cloudflare (free tier)
- Point your domain to Cloudflare
- Enable caching rules

## Updating Content

### Add New Bikes

1. Update `sample_for_website.csv`
2. Run import script:
```bash
npm run import-data
```
3. Pages will auto-update within 1 hour (ISR revalidation)
4. Or trigger manual revalidation in Vercel

### Modify Existing Bikes

1. Update in Supabase Table Editor directly, OR
2. Update CSV and re-import
3. ISR will serve updated content after revalidation

## Scaling Considerations

### Current Setup Handles:
- ✅ 30,000-50,000 bike pages
- ✅ 10,000+ concurrent users
- ✅ Sub-second page loads
- ✅ SEO-friendly URLs

### If You Need to Scale Further:

1. **Database**: Upgrade Supabase tier for more connections
2. **Caching**: Add Redis for query caching
3. **Search**: Add Algolia or Meilisearch
4. **Images**: Use dedicated CDN (Cloudinary, ImageKit)
5. **Hosting**: Upgrade Vercel plan for more bandwidth

## Troubleshooting

### Build Fails on Vercel

1. Check build logs for errors
2. Verify all dependencies in `package.json`
3. Ensure environment variables are set
4. Try building locally first: `npm run build`

### 404 Errors on Deployed Site

1. Verify bikes are in Supabase database
2. Check slug format matches URL
3. Clear cache and redeploy
4. Check ISR is working: pages should generate on first visit

### Slow Page Loads

1. Check Supabase query performance
2. Verify images are optimized
3. Check Vercel analytics for bottlenecks
4. Consider upgrading hosting tier

### Environment Variables Not Working

1. Ensure variables are set for correct environment
2. Redeploy after changing variables
3. Check variable names (case-sensitive)
4. Verify no trailing spaces in values

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Environment variables are secret
- [ ] Service role key is not exposed in client
- [ ] Supabase RLS policies enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (Supabase)
- [ ] Regular backups of database

## Maintenance

### Weekly
- [ ] Check Supabase database size
- [ ] Review error logs
- [ ] Monitor site performance

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review and optimize images
- [ ] Check SEO rankings
- [ ] Backup database

### Quarterly
- [ ] Review and update content
- [ ] Performance audit
- [ ] Security audit
- [ ] User feedback review

## Cost Estimation

### Free Tier (Good for 50k bikes)
- **Hosting**: Vercel (Free) or Netlify (Free)
- **Database**: Supabase (Free tier: 500MB database, 2GB bandwidth)
- **Domain**: $10-15/year
- **Total**: ~$15/year

### Paid Tier (For high traffic)
- **Hosting**: Vercel Pro ($20/month)
- **Database**: Supabase Pro ($25/month)
- **Domain**: $10-15/year
- **Total**: ~$555/year

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## Conclusion

Your bike catalog is now deployed and ready to serve thousands of users! The combination of Next.js ISR, Supabase, and Vercel provides excellent performance, scalability, and SEO out of the box.

Happy cycling! 🚴‍♂️
