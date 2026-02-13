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

        const { ids } = await request.json()

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty IDs provided' }, { status: 400 })
        }

        console.log('🗑️ Batch DELETE request for bike IDs:', ids.length, 'bikes')

        // 1. Delete dependent translations first
        const { error: translationError } = await supabaseServer
            .from('bike_translations')
            .delete()
            .in('bike_id', ids)

        if (translationError) {
            console.error('❌ Error deleting translations:', translationError)
            // Attempt to continue, though foreign key constraints might block the next step
        }

        // 2. Delete bikes
        const { data, error } = await supabaseServer
            .from('bikes')
            .delete()
            .in('id', ids)
            .select()

        if (error) {
            console.error('❌ Supabase batch delete error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log(`✅ Batch delete successful. Deleted ${data?.length || 0} bikes.`)

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${data?.length || 0} bikes`,
            deletedCount: data?.length || 0
        })

    } catch (error: any) {
        console.error('❌ Error in batch DELETE:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
