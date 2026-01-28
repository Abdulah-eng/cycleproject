import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ bikes: [], total: 0 })
  }

  try {
    const searchTerm = query.trim()
    const terms = searchTerm.split(/\s+/).filter(t => t.length > 0)

    let queryBuilder = supabaseServer
      .from('bikes')
      .select('*', { count: 'exact' })

    // Build OR filter: match if ANY term appears in ANY field
    // This creates a more permissive search that returns results if any word matches
    const orConditions = terms.map(term =>
      `brand.ilike.%${term}%,model.ilike.%${term}%,title.ilike.%${term}%,sub_category.ilike.%${term}%,category.ilike.%${term}%`
    ).join(',')

    if (orConditions) {
      queryBuilder = queryBuilder.or(orConditions)
    }

    const { data: bikes, error, count } = await queryBuilder
      .order('year', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ bikes: [], total: 0, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bikes: bikes || [], total: count || 0 })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ bikes: [], total: 0, error: 'Internal server error' }, { status: 500 })
  }
}
