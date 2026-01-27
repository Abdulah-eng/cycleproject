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

    // Build a complex filter: all terms must match at least one field
    // Since Supabase .or() is a bit limited for complex "AND(OR, OR)" structures via the standard SDK,
    // we use a RAW filter or multiple filter chains if possible.
    // For simplicity and effectiveness, we'll use a single .or() with all fields for each term.

    terms.forEach(term => {
      queryBuilder = queryBuilder.or(`brand.ilike.%${term}%,model.ilike.%${term}%,title.ilike.%${term}%,sub_category.ilike.%${term}%`)
    })

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
