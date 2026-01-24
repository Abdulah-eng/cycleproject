import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

// PUT - Update bike
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bikeData = await request.json()

    // Update bike
    const { data, error } = await supabaseServer
      .from('bikes')
      .update(bikeData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bike:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in PUT /api/admin/bikes/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete bike
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ DELETE request for bike ID:', params.id)

    // Check authentication
    const user = await getUser()
    if (!user) {
      console.error('❌ Unauthorized delete attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.email)
    console.log('🔑 Using SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'MISSING!')

    // Delete bike
    const { data, error } = await supabaseServer
      .from('bikes')
      .delete()
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('❌ Supabase delete error:', error)
      console.error('Error code:', error.code)
      console.error('Error hint:', error.hint)
      console.error('Error details:', error.details)
      return NextResponse.json({
        error: error.message,
        code: error.code,
        hint: 'This might be due to Row Level Security (RLS) policies. Check TROUBLESHOOTING_FIXES.md'
      }, { status: 500 })
    }

    console.log('✅ Bike deleted successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Bike deleted successfully',
      deletedCount: data?.length || 0
    })
  } catch (error: any) {
    console.error('❌ Error in DELETE /api/admin/bikes/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
