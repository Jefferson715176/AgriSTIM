import React, { useState } from 'react'
import { Card, Field, Notice, Table, useTable } from '../components'
import { csvDownload, money } from '../lib/supabase'

export default function Reports() {
  const sales=useTable('sales','id,total,created_at',{order:'created_at',limit:1000})
  const items=useTable('sale_items','sale_id,qty,unit_price,unit_cost,product_id',{order:'id',limit:1000})
  const products=useTable('products','id,name,category,cost_price,retail_price,archived',{order:'name',ascending:true})
  const batches=useTable('batches','product_id,qty_remaining,expiry',{order:'id',limit:1000})
  const losses=useTable('losses','product_id,qty,reason,amount,created_at',{order:'created_at',limit:1000})
  const [type,setType]=useState('sales')
  const [from,setFrom]=useState(new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10))
  const [to,setTo]=useState(new Date().toISOString().slice(0,10))
  const product=id=>products.rows.find(p=>p.id===id)
  let headers=[],rows=[]
  if(type==='sales'){
    headers=['Date','Sales','Revenue','Cost','Profit'];const grouped={}
    sales.rows.filter(s=>s.created_at?.slice(0,10)>=from&&s.created_at?.slice(0,10)<=to).forEach(s=>{const day=s.created_at.slice(0,10);grouped[day]||={count:0,total:0,cost:0};grouped[day].count++;grouped[day].total+=Number(s.total);grouped[day].cost+=items.rows.filter(i=>i.sale_id===s.id).reduce((sum,i)=>sum+Number(i.qty)*Number(i.unit_cost),0)})
    rows=Object.entries(grouped).sort().map(([day,v])=>[day,v.count,money(v.total),money(v.cost),money(v.total-v.cost)])
  } else if(type==='stock'){
    headers=['Product','Category','In stock','Value at cost','Value at retail']
    rows=products.rows.filter(p=>!p.archived).map(p=>{const qty=batches.rows.filter(b=>b.product_id===p.id).reduce((s,b)=>s+Number(b.qty_remaining),0);return[p.name,p.category,qty,money(qty*Number(p.cost_price)),money(qty*Number(p.retail_price))]})
  } else if(type==='losses'){
    headers=['Date','Product','Reason','Quantity','Cost']
    rows=losses.rows.filter(l=>l.created_at?.slice(0,10)>=from&&l.created_at?.slice(0,10)<=to).map(l=>[l.created_at.slice(0,10),product(l.product_id)?.name||'Unknown',l.reason,l.qty,money(l.amount)])
  } else if(type==='expiry'){
    headers=['Product','Quantity','Expiry']
    rows=batches.rows.filter(b=>b.qty_remaining>0&&b.expiry).sort((a,b)=>a.expiry.localeCompare(b.expiry)).map(b=>[product(b.product_id)?.name||'Unknown',b.qty_remaining,b.expiry])
  } else {
    headers=['Product','Units sold','Revenue','Profit'];const grouped={}
    const dates=Object.fromEntries(sales.rows.map(s=>[s.id,s.created_at?.slice(0,10)]))
    items.rows.filter(item=>dates[item.sale_id]>=from&&dates[item.sale_id]<=to).forEach(item=>{const id=item.product_id;grouped[id]||={qty:0,revenue:0,profit:0};grouped[id].qty+=Number(item.qty);grouped[id].revenue+=Number(item.qty)*Number(item.unit_price);grouped[id].profit+=Number(item.qty)*(Number(item.unit_price)-Number(item.unit_cost))})
    rows=Object.entries(grouped).sort((a,b)=>b[1].qty-a[1].qty).map(([id,v])=>[product(Number(id))?.name||'Unknown',v.qty,money(v.revenue),money(v.profit)])
  }
  return <><p className="intro">Review sales, stock, losses, and expiry dates. Download a CSV for sharing.</p><Card title="Report" action={<button className="button primary" onClick={()=>csvDownload(`agristim-${type}.csv`,headers,rows)}>↓ Download CSV</button>}><div className="report-filters"><Field label="Report"><select value={type} onChange={e=>setType(e.target.value)}><option value="sales">Sales by day</option><option value="best">Best selling</option><option value="stock">Inventory value</option><option value="losses">Losses</option><option value="expiry">Batches & expiry</option></select></Field>{['sales','best','losses'].includes(type)&&<><Field label="From"><input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></Field><Field label="To"><input type="date" value={to} onChange={e=>setTo(e.target.value)} /></Field></>}</div><Notice error={sales.error||items.error||products.error||batches.error||losses.error} loading={sales.loading||items.loading||products.loading||batches.loading||losses.loading} /><Table heads={headers} rows={rows} /></Card><p className="fine-print">Reports show the latest 1,000 records per data source. Use Supabase SQL for larger historical exports.</p></>
}
