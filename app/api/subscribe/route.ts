import { supabaseServer } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        const { error } = await supabaseServer
            .from('subscribers')
            .insert({ email })

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json(
                    { message: 'You are already subscribed!' },
                    { status: 200 }
                )
            }
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: 'Successfully subscribed!' },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
