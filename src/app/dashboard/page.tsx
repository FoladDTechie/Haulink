import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import type { Shipment } from '@/types'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: shipments } = await supabase
    .from('shipments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const userName: string =
    user.user_metadata?.full_name ?? user.email ?? 'Merchant'

  return (
    <DashboardContent
      shipments={(shipments ?? []) as Shipment[]}
      userName={userName}
    />
  )
}
