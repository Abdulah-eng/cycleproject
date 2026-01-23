import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Insert bike
    const { data, error } = await supabaseServer
      .from('bikes')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error inserting bike:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in POST /api/admin/bikes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
