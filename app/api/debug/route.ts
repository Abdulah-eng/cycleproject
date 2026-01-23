import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Test 1: Query with anon key (what the website uses)
    const anonClient = createClient(supabaseUrl, anonKey)
    const { data: anonData, error: anonError } = await anonClient
      .from('bikes')
      .select('id, brand, model, slug')
      .limit(3)

    // Test 2: Query with service role key (bypasses RLS)
    const serviceClient = createClient(supabaseUrl, serviceKey)
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('bikes')
      .select('id, brand, model, slug')
      .limit(3)

    // Test 3: Get count with both
    const { count: anonCount } = await anonClient
      .from('bikes')
      .select('*', { count: 'exact', head: true })

    const { count: serviceCount } = await serviceClient
      .from('bikes')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      diagnosis: {
        rlsIssue: !anonError && anonCount === 0 && serviceCount! > 0,
        issue: anonError ? 'RLS is blocking anonymous access' : anonCount === 0 ? 'No data found with anon key but data exists (RLS issue)' : 'Everything works!',
      },
      anonKeyTest: {
        success: !anonError,
        error: anonError?.message || null,
        dataCount: anonData?.length || 0,
        totalCount: anonCount,
        bikes: anonData,
      },
      serviceKeyTest: {
        success: !serviceError,
        error: serviceError?.message || null,
        dataCount: serviceData?.length || 0,
        totalCount: serviceCount,
        bikes: serviceData,
      },
      solution: anonCount === 0 && serviceCount! > 0
        ? 'RLS is blocking access. Run FIX_RLS_ISSUE.sql in Supabase SQL Editor'
        : anonError
        ? 'RLS policy error. Check FIX_RLS_ISSUE.sql'
        : 'Data should be visible on the site',
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
