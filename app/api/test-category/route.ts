import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || 'roadbikes'

  // Test the category conversion logic
  const categoryName = slug.replace(/bikes$/i, '').trim()

  // Test 1: Direct category query
  const { data: test1, error: error1 } = await supabase
    .from('bikes')
    .select('id, brand, model, category')
    .ilike('category', `%${categoryName}%`)
    .limit(3)

  // Test 2: Get all unique categories
  const { data: categories } = await supabase
    .from('bikes')
    .select('category')

  const uniqueCategories = Array.from(new Set(categories?.map(b => b.category) || []))

  return NextResponse.json({
    input: {
      slug,
      convertedCategoryName: categoryName,
      searchPattern: `%${categoryName}%`,
    },
    test1_ilike_query: {
      success: !error1,
      error: error1?.message,
      results: test1?.length || 0,
      bikes: test1,
    },
    allCategories: uniqueCategories,
    suggestion: test1?.length === 0
      ? `No bikes found matching "%${categoryName}%". Available categories: ${uniqueCategories.join(', ')}`
      : 'Query working correctly',
  })
}
