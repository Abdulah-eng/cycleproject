import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ bikes: [], total: 0 })
  }

  try {
    // User requested strict "side-by-side" matching.
    // We treat the query as a single phrase/substring.
    // We normalize multiple spaces to single space to be slightly forgiving, but keep sequence.
    const searchTerm = query.trim().replace(/\s+/g, ' ')

    let queryBuilder = supabaseServer
      .from('bikes')
      .select('*', { count: 'exact' })

    // Strict substring match across fields
    // Strict substring match across fields
    // Removing title.ilike because database has misaligned titles (some rows have title of different bike)
    const orClause = `brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,sub_category.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`
    queryBuilder = queryBuilder.or(orClause)

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
