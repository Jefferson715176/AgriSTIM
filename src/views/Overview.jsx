import React, { useEffect, useState } from 'react'
import { Card, Empty, Notice, Table, Badge } from '../components'
import { supabase, unwrap, money, date, philippineDay } from '../lib/supabase'

const overviewCache = new Map()

export default function Overview({ profile }) {
  const [data, setData] = useState(() => overviewCache.get(profile.id) || null)
  const [error, setError] = useState('')
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        await unwrap(supabase.rpc('refresh_alerts'))
        const [products, batches, sales, alerts, units] = await Promise.all([
          unwrap(supabase.from('products').select('id,name,cost_price,reorder_level,archived')),
          unwrap(supabase.from('batches').select('id,product_id,qty_remaining,expiry')),
          unwrap(supabase.from('sales').select('id,total,created_at').is('voided_at', null).order('created_at', { ascending: false }).limit(100)),
          unwrap(supabase.from('alerts').select('*').neq('status','resolved').order('created_at', { ascending: false })),
          unwrap(supabase.from('storage_units').select('id,name')),
        ])
        if (mounted) { const next = { products, batches, sales, alerts, units }; overviewCache.set(profile.id, next); setData(next) }
      } catch (issue) { if (mounted) setError(issue.message) }
    }
    load()
    return () => { mounted = false }
  }, [])
  if (!data) return <><p className="intro">A clear view of your store, from the shelves to the cold room.</p><Notice loading={!error} error={error} /><div className="stat-grid">{[1,2,3,4].map(i=><div className="stat skeleton-stat" key={i}><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}</div><div className="two-col"><div className="card skeleton-card" /><div className="card skeleton-card" /></div></>
  const today = philippineDay(Date.now())
  const todaysSales = data.sales.filter(row => row.created_at && philippineDay(row.created_at) === today)
  const active = data.products.filter(row => !row.archived)
  const usable = data.batches.filter(b => !b.expiry || b.expiry >= today)
  const lowStock = active.map(p => ({ ...p, available: usable.filter(b => b.product_id === p.id).reduce((sum,b) => sum + Number(b.qty_remaining), 0) })).filter(p => p.available <= Number(p.reorder_level)).sort((a,b) => a.available-b.available)
  const stockValue = data.batches.reduce((sum,b) => sum + Number(b.qty_remaining) * Number(data.products.find(p => p.id === b.product_id)?.cost_price || 0),0)
  const expiry = data.batches.filter(b => b.qty_remaining > 0 && b.expiry && b.expiry >= today && b.expiry <= philippineDay(Date.now() + 30*86400000))
  return <><p className="intro">A clear view of your store, from the shelves to the cold room.</p>{error && <Notice error={`Could not refresh overview: ${error}`} />}<div className="stat-grid"><div className="stat"><span>Low stock</span><strong>{lowStock.length}</strong><small>{active.length} active products{profile.role === 'owner' ? ` · ${money(stockValue)} at cost` : ''}</small></div><div className="stat"><span>Sales today</span><strong>{money(todaysSales.reduce((sum,row) => sum + Number(row.total),0))}</strong><small>{todaysSales.length} transactions</small></div><div className="stat"><span>Open alerts</span><strong>{data.alerts.length}</strong><small>Needs attention</small></div><div className="stat"><span>Expiring soon</span><strong>{expiry.length}</strong><small>Within 30 days</small></div></div><div className="two-col"><Card title="Reorder now" action={<a href="#stock" className="text-link">View stock →</a>}>{lowStock.length ? <Table heads={['Product','Available','Reorder at']} rows={lowStock.slice(0,6).map(p => [p.name,p.available,p.reorder_level])} /> : <Empty>All active products are above their reorder levels.</Empty>}</Card><Card title="Recent alerts" action={<a href="#alerts" className="text-link">View all →</a>}>{data.alerts.length ? <Table heads={['Alert','Status','When']} rows={data.alerts.slice(0,6).map(a => [a.message,<Badge tone={a.status === 'open' ? 'danger' : 'warn'}>{a.status}</Badge>,date(a.created_at)])} /> : <Empty>All clear. No active alerts.</Empty>}</Card></div><Card title="Quick access"><div className="quick-links"><a href="#stock"><span>◈</span><strong>Record stock</strong><small>New deliveries and losses</small></a><a href="#sales"><span>₱</span><strong>New sale</strong><small>Sell available stock</small></a><a href="#temperature"><span>◉</span><strong>Cold storage</strong><small>{data.units.length} monitored units</small></a><a href="#reports"><span>▥</span><strong>Reports</strong><small>Sales and inventory</small></a></div></Card></>
}
