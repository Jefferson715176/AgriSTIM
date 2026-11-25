import React, { useEffect, useState } from 'react'
import { Card, Empty, Notice, Table, Badge } from '../components'
import { supabase, unwrap, money, date } from '../lib/supabase'

export default function Overview({ profile }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        await unwrap(supabase.rpc('refresh_alerts'))
        const [products, batches, sales, alerts, units] = await Promise.all([
          unwrap(supabase.from('products').select('id,name,cost_price,reorder_level,archived')),
          unwrap(supabase.from('batches').select('id,product_id,qty_remaining,expiry')),
          unwrap(supabase.from('sales').select('id,total,created_at').order('created_at', { ascending: false }).limit(100)),
          unwrap(supabase.from('alerts').select('*').neq('status','resolved').order('created_at', { ascending: false })),
          unwrap(supabase.from('storage_units').select('id,name')),
        ])
        if (mounted) setData({ products, batches, sales, alerts, units })
      } catch (issue) { if (mounted) setError(issue.message) }
    }
    load()
    return () => { mounted = false }
  }, [])
  if (!data) return <Notice loading={!error} error={error} />
  const today = new Date().toLocaleDateString('en-CA')
  const todaysSales = data.sales.filter(row => row.created_at?.slice(0,10) === today)
  const active = data.products.filter(row => !row.archived)
  const stockValue = data.batches.reduce((sum,b) => sum + Number(b.qty_remaining) * Number(data.products.find(p => p.id === b.product_id)?.cost_price || 0),0)
  const expiry = data.batches.filter(b => b.qty_remaining > 0 && b.expiry && b.expiry <= new Date(Date.now() + 30*86400000).toISOString().slice(0,10))
  return <><p className="intro">A clear view of your store, from the shelves to the cold room.</p><div className="stat-grid"><div className="stat"><span>Active products</span><strong>{active.length}</strong><small>{profile.role === 'owner' ? `${money(stockValue)} at cost` : 'Across all categories'}</small></div><div className="stat"><span>Sales today</span><strong>{money(todaysSales.reduce((sum,row) => sum + Number(row.total),0))}</strong><small>{todaysSales.length} transactions</small></div><div className="stat"><span>Open alerts</span><strong>{data.alerts.length}</strong><small>Needs attention</small></div><div className="stat"><span>Expiring soon</span><strong>{expiry.length}</strong><small>Within 30 days</small></div></div><div className="two-col"><Card title="Recent alerts" action={<a href="#alerts" className="text-link">View all →</a>}>{data.alerts.length ? <Table heads={['Alert','Status','When']} rows={data.alerts.slice(0,6).map(a => [a.message,<Badge tone={a.status === 'open' ? 'danger' : 'warn'}>{a.status}</Badge>,date(a.created_at)])} /> : <Empty>All clear. No active alerts.</Empty>}</Card><Card title="Quick access"><div className="quick-links"><a href="#stock"><span>◈</span><strong>Record stock</strong><small>New deliveries and losses</small></a><a href="#sales"><span>₱</span><strong>New sale</strong><small>Sell available stock</small></a><a href="#temperature"><span>◉</span><strong>Cold storage</strong><small>{data.units.length} monitored units</small></a><a href="#reports"><span>▥</span><strong>Reports</strong><small>Sales and inventory</small></a></div></Card></div></>
}
