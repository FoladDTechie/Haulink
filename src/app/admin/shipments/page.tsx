import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ShipmentsTable, type AdminShipmentRow } from '@/components/admin/ShipmentsTable'

export default async function AdminShipmentsPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!user || user.email !== adminEmail) {
    redirect('/')
  }

  const { data: shipments, error } = await supabase
    .from('shipments')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('[admin/shipments] count:', shipments?.length, 'error:', error)

  const shipmentList = (shipments ?? []) as unknown as AdminShipmentRow[]

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden font-grotesk">
      <div className="absolute inset-0 slot-grid-dark pointer-events-none" />

      <div className="relative z-10 max-w-[1240px] mx-auto px-8 py-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="eyebrow mb-4 flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-brand"
                style={{ boxShadow: '0 0 0 4px rgba(46,204,82,0.2)' }} />
              Admin · Shipments
            </div>
            <h1 className="font-grotesk font-medium text-white leading-none tracking-[-0.04em] text-[56px]">
              Shipment <em className="font-serif-italic text-green-brand font-normal">tracking.</em>
            </h1>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2.5 border border-white/20 text-white/70 font-medium text-[13.5px] px-6 py-3 rounded-full hover:border-white/40 hover:text-white transition-all"
          >
            ← Admin home
          </Link>
        </div>

        {/* Table */}
        <div className="bg-paper rounded-3xl border border-white/[0.06] shadow-2xl shadow-black/40 overflow-hidden">
          <ShipmentsTable shipments={shipmentList} />
        </div>
      </div>
    </div>
  )
}
