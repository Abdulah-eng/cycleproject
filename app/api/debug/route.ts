import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabaseServer
    .from('bikes')
    .select('id, brand, model, title, category, sub_category')
    .or('brand.ilike.%cube%,model.ilike.%cube%,title.ilike.%cube%')
    .limit(10)

  if (error) return NextResponse.json({ error })

  return NextResponse.json({ data })
}
