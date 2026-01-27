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

    // Search across brand, model, title, and sub_category fields with more results
    const { data: bikes, error, count } = await supabaseServer
      .from('bikes')
      .select('*', { count: 'exact' })
      .or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,sub_category.ilike.%${searchTerm}%`)
      .order('year', { ascending: false })
      .limit(50) // Return more results for search page

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
