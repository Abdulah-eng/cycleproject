import { supabaseServer, Bike } from '@/lib/supabase'

export async function getSameBrandBikes(currentBike: Bike, limit = 10): Promise<Bike[]> {
    const { data } = await supabaseServer
        .from('bikes')
        .select('*')
        .eq('category', currentBike.category)
        .eq('brand', currentBike.brand)
        .neq('id', currentBike.id)
        .order('year', { ascending: false })
        .limit(limit)

    return data || []
}

export async function getBikesByYear(year: number, category: string, subCategory?: string | null, limit = 10): Promise<Bike[]> {
    let query = supabaseServer
        .from('bikes')
        .select('*')
        .eq('year', year)
        .ilike('category', `%${category}%`)

    if (subCategory) {
        query = query.ilike('sub_category', `%${subCategory}%`)
    }

    const { data } = await query
        .limit(limit)
        .order('vfm_score_1_to_10', { ascending: false }) // Show best value bikes first for that year

    return data || []
}

export async function getBetterValueBikes(currentBike: Bike, limit = 10): Promise<Bike[]> {
    const currentScore = currentBike.vfm_score_1_to_10 || 0

    let query = supabaseServer
        .from('bikes')
        .select('*')
        .eq('category', currentBike.category)
        .gt('vfm_score_1_to_10', currentScore)
        .neq('id', currentBike.id)
        .order('vfm_score_1_to_10', { ascending: false })
        .limit(limit)

    if (currentBike.sub_category) {
        query = query.eq('sub_category', currentBike.sub_category)
    }

    const { data } = await query
    return data || []
}
