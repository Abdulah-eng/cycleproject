import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const searchTerm = query.trim()

    // Search across brand, model, and title fields
    const { data: bikes, error } = await supabaseServer
      .from('bikes')
      .select('id, brand, model, year, category, sub_category, slug, price, images')
      // Removing title search due to data misalignment in DB
      .or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
      .order('year', { ascending: false })
      .limit(8)

    if (error) {
      console.error('Search suggestions error:', error)
      return NextResponse.json({ suggestions: [], error: error.message }, { status: 500 })
    }

    // Format the suggestions
    const suggestions = bikes?.map(bike => ({
      id: bike.id,
      label: `${bike.brand} ${bike.model}${bike.year ? ` (${bike.year})` : ''}`,
      brand: bike.brand,
      model: bike.model,
      year: bike.year,
      category: bike.category,
      sub_category: bike.sub_category,
      slug: bike.slug,
      price: bike.price,
      image: bike.images && bike.images.length > 0 ? bike.images[0] : null,
    })) || []

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ suggestions: [], error: 'Internal server error' }, { status: 500 })
  }
}
