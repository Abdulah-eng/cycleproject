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
    // Split query into individual terms for "all words match" logic
    const terms = query.trim().split(/\s+/).filter(t => t.length > 0)

    const sort = searchParams.get('sort') || 'year'
    let orderColumn = 'year'
    let ascending = false

    switch (sort) {
      case 'value':
        orderColumn = 'vfm_score_1_to_10'
        break
      case 'performance':
        orderColumn = 'performance_score'
        break
      case 'comfort':
        orderColumn = 'ride_comfort_1_10'
        break
      case 'position':
        orderColumn = 'posture_1_10'
        break
      default:
        orderColumn = 'year'
    }

    let queryBuilder = supabaseServer
      .from('bikes')
      .select('*', { count: 'exact' })

    // For each term, it must appear in AT LEAST ONE of the target columns.
    // Chaining .or() filters creates an AND relationship between the groups in Supabase/PostgREST.
    // So (field1 matches term1 OR field2 matches term1) AND (field1 matches term2 OR field2 matches term2)...
    terms.forEach(term => {
      // Removing title.ilike because database has misaligned titles
      const orClause = `brand.ilike.%${term}%,model.ilike.%${term}%,sub_category.ilike.%${term}%,category.ilike.%${term}%,slug.ilike.%${term}%`
      queryBuilder = queryBuilder.or(orClause)
    })

    // Apply sorting
    // We add nullsLast behavior for scores to ensure bikes with actual scores float to top
    const { data: bikes, error, count } = await queryBuilder
      .order(orderColumn, { ascending: ascending, nullsFirst: false })
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
