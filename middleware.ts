import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { generateBikeUrl } from '@/lib/utils'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if it exists
  const { data: { session } } = await supabase.auth.getSession()

  // Handle old URL format redirects (category/slug -> category/subcategory/brand/year/model)
  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/').filter(Boolean)
  
  // Check if this matches old URL pattern: /category/slug (2 segments)
  // Exclude admin, api, search, and other special routes
  if (segments.length === 2 && 
      !pathname.startsWith('/admin') && 
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/search')) {
    
    const slug = segments[1]
    
    // Try to find bike by slug and redirect to new URL
    const { data: bike, error } = await supabase
      .from('bikes')
      .select('category, sub_category, brand, year, model, slug')
      .eq('slug', slug)
      .single()
    
    if (!error && bike) {
      // Generate new SEO-friendly URL and redirect (301 permanent redirect)
      const newUrl = generateBikeUrl(bike)
      return NextResponse.redirect(new URL(newUrl, request.url), { status: 301 })
    }
  }

  // If accessing admin routes (except login) and not authenticated, redirect to login
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login') &&
      !session) {
    const redirectUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing login page and already authenticated, redirect to dashboard
  if (request.nextUrl.pathname.startsWith('/admin/login') && session) {
    const redirectUrl = new URL('/admin/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
