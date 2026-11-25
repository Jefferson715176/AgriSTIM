import React, { useState } from 'react'
import { Card, Field, Notice, Table, useTable } from '../components'
import { date, money, supabase, unwrap } from '../lib/supabase'

export default function Sales({ notify }) {
  const products = useTable('products','id,name,unit,retail_price,bulk_price,archived',{order:'name',ascending:true})
  const batches = useTable('batches','product_id,qty_remaining,expiry')
  const sales = useTable('sales','id,type,customer,total,created_at,sale_items(qty,unit_price,products(name))',{order:'created_at',limit:60})
  const [type,setType] = useState('retail')
  const [customer,setCustomer] = useState('')
  const [items,setItems] = useState([{product_id:'',qty:'1'}])
  const [busy,setBusy] = useState(false)
  const available = products.rows.filter(p => !p.archived).map(p => ({...p, stock:batches.rows.filter(b => b.product_id === p.id && (!b.expiry || b.expiry >= new Date().toISOString().slice(0,10))).reduce((sum,b) => sum + Number(b.qty_remaining),0)})).filter(p => p.stock > 0)
  const setItem = (i,key,value) => setItems(items.map((item,index) => index === i ? {...item,[key]:value} : item))
  const estimate = items.reduce((sum,item) => { const p=available.find(p=>p.id===Number(item.product_id));return sum+(p ? Number(item.qty||0)*Number(type==='bulk'&&Number(p.bulk_price)>0?p.bulk_price:p.retail_price):0) },0)
  async function submit(event) {
    event.preventDefault(); setBusy(true)
    try {
      const lines=items.map(item=>({product_id:Number(item.product_id),qty:Number(item.qty)}))
      if (lines.some(item=>!Number.isInteger(item.qty)||item.qty<1||item.qty>1000000||!item.product_id)) throw new Error('Choose a product and valid quantity for each line.')
      const id=await unwrap(supabase.rpc('record_sale',{p_type:type,p_customer:customer,p_items:lines}))
      setCustomer('');setItems([{product_id:'',qty:'1'}]);sales.reload();batches.reload();notify(`Sale #${id} recorded.`)
    } catch (issue) { notify(issue.message,true) } finally { setBusy(false) }
  }
  return <><p className="intro">Record a retail or bulk sale. Stock is deducted in one database transaction.</p><Card title="New sale"><form onSubmit={submit}><div className="form-grid"><Field label="Type"><select value={type} onChange={e=>setType(e.target.value)}><option value="retail">Retail</option><option value="bulk">Bulk price</option></select></Field><Field label="Customer (optional)"><input maxLength="100" value={customer} onChange={e=>setCustomer(e.target.value)} /></Field></div><div className="line-items"><div className="line-head"><span>Product</span><span>Quantity</span><span>Amount</span><span></span></div>{items.map((item,i)=>{const p=available.find(p=>p.id===Number(item.product_id));return <div className="line-item" key={i}><select required value={item.product_id} onChange={e=>setItem(i,'product_id',e.target.value)}><option value="">Choose product…</option>{available.map(p=><option key={p.id} value={p.id}>{p.name} ({p.stock} left)</option>)}</select><input required type="number" min="1" max="1000000" step="1" value={item.qty} onChange={e=>setItem(i,'qty',e.target.value)} /><strong>{money(p ? Number(item.qty||0)*Number(type==='bulk'&&Number(p.bulk_price)>0?p.bulk_price:p.retail_price) : 0)}</strong><button type="button" className="icon-button" aria-label="Remove line" onClick={()=>setItems(items.filter((_,index)=>index!==i))}>×</button></div>})}</div><div className="sale-footer"><button type="button" className="button" onClick={()=>setItems([...items,{product_id:'',qty:'1'}])}>+ Add line</button><div><span>Estimated total</span><strong>{money(estimate)}</strong><button disabled={busy||!items.length} className="button primary">{busy?'Saving…':'Record sale'}</button></div></div></form></Card><Card title="Sales history"><Notice error={sales.error} loading={sales.loading} /><Table heads={['Date','Sale','Customer','Items','Total']} rows={sales.rows.map(s=>[date(s.created_at),`#${s.id} · ${s.type}`,s.customer||'Walk-in',<span title={s.sale_items?.map(i=>`${i.qty} × ${i.products?.name||'Product'}`).join(', ')}>{s.sale_items?.reduce((sum,i)=>sum+i.qty,0)||0} units</span>,<strong>{money(s.total)}</strong>])} /></Card></>
}
