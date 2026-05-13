import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import type { Shipment } from '@/types'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: shipments } = await supabase
    .from('shipments')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const userName: string =
    session.user.user_metadata?.full_name ?? session.user.email ?? 'Merchant'

  return (
    <DashboardContent
      shipments={(shipments ?? []) as Shipment[]}
      userName={userName}
    />
  )
}
