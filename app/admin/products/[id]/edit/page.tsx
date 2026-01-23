import EditProductForm from '@/components/admin/EditProductForm'
import { supabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: bike, error } = await supabaseServer
    .from('bikes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !bike) {
    notFound()
  }

  return <EditProductForm bike={bike} />
}
