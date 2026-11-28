import React, { useState } from 'react'
import { Badge, Card, Field, FormError, Notice, Table, useTable, useConfirm } from '../components'
import { date, money, supabase, unwrap } from '../lib/supabase'

export default function Stock({ session, notify }) {
  const [ask, confirmDialog] = useConfirm()
  const products = useTable('products','id,name,unit,archived,cost_price',{order:'name',ascending:true})
  const units = useTable('storage_units','id,name',{order:'name',ascending:true})
  const batches = useTable('batches','*',{order:'received_at',limit:100})
  const losses = useTable('losses','*',{order:'created_at',limit:50})
  const [incoming,setIncoming] = useState({ product_id:'',qty:'',batch_no:'',supplier:'',unit_id:'',expiry:'' })
  const [outgoing,setOutgoing] = useState({ batch_id:'',qty:'',reason:'expired' })
  const [busy,setBusy] = useState(false)
  const [stockInError,setStockInError] = useState('')
  const [stockOutError,setStockOutError] = useState('')
  const product = id => products.rows.find(p => p.id === id)
  async function stockIn(event) {
    event.preventDefault(); setBusy(true); setStockInError('')
    try {
      await unwrap(supabase.rpc('stock_in',{p_product_id:Number(incoming.product_id),p_qty:Number(incoming.qty),p_batch_no:incoming.batch_no,p_supplier:incoming.supplier || null,p_unit_id:incoming.unit_id ? Number(incoming.unit_id) : null,p_expiry:incoming.expiry || null}))
      setIncoming({ product_id:'',qty:'',batch_no:'',supplier:'',unit_id:'',expiry:'' }); batches.reload(); notify('Delivery added to stock.')
    } catch (issue) { setStockInError(issue.message) } finally { setBusy(false) }
  }
  async function stockOut(event) {
    event.preventDefault()
    const batch = batches.rows.find(b => b.id === Number(outgoing.batch_id))
    if (!await ask({ title:'Record loss?', message:`Remove ${outgoing.qty} ${product(batch?.product_id)?.unit || 'units'} of ${product(batch?.product_id)?.name || 'this product'} (batch ${batch?.batch_no || outgoing.batch_id}) as ${outgoing.reason}. This can't be undone.`, action:'Record loss', danger:true })) return
    setBusy(true); setStockOutError('')
    try {
      await unwrap(supabase.rpc('stock_out',{p_batch_id:Number(outgoing.batch_id),p_qty:Number(outgoing.qty),p_reason:outgoing.reason}))
      setOutgoing({batch_id:'',qty:'',reason:'expired'}); batches.reload(); losses.reload(); notify('Loss recorded.')
    } catch (issue) { setStockOutError(issue.message) } finally { setBusy(false) }
  }
  return <>{confirmDialog}<p className="intro">Each delivery becomes a batch. Sales use the earliest non-expired stock first.</p><div className="two-col"><Card title="New delivery"><form className="form-grid" onSubmit={stockIn}><FormError message={stockInError} /><Field label="Product"><select required value={incoming.product_id} onChange={e => setIncoming({...incoming,product_id:e.target.value})}><option value="">Choose…</option>{products.rows.filter(p => !p.archived).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="Quantity"><input required type="number" min="1" max="1000000" step="1" value={incoming.qty} onChange={e => setIncoming({...incoming,qty:e.target.value})} /></Field><Field label="Batch no. (optional)"><input maxLength="40" value={incoming.batch_no} onChange={e => setIncoming({...incoming,batch_no:e.target.value})} /></Field><Field label="Supplier"><input maxLength="100" value={incoming.supplier} onChange={e => setIncoming({...incoming,supplier:e.target.value})} /></Field><Field label="Expiry"><input type="date" value={incoming.expiry} onChange={e => setIncoming({...incoming,expiry:e.target.value})} /></Field><Field label="Storage"><select value={incoming.unit_id} onChange={e => setIncoming({...incoming,unit_id:e.target.value})}><option value="">Shelf / no cold storage</option>{units.rows.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field><div className="form-actions"><button disabled={busy} className="button primary">{busy?'Saving…':'Add to stock'}</button></div></form></Card><Card title="Record a loss"><form className="form-grid" onSubmit={stockOut}><FormError message={stockOutError} /><Field label="Batch"><select required value={outgoing.batch_id} onChange={e => setOutgoing({...outgoing,batch_id:e.target.value})}><option value="">Choose…</option>{batches.rows.filter(b => b.qty_remaining > 0).map(b => <option key={b.id} value={b.id}>{product(b.product_id)?.name} · {b.batch_no} · {b.qty_remaining} left</option>)}</select></Field><Field label="Quantity"><input required type="number" min="1" step="1" value={outgoing.qty} onChange={e => setOutgoing({...outgoing,qty:e.target.value})} /></Field><Field label="Reason"><select value={outgoing.reason} onChange={e => setOutgoing({...outgoing,reason:e.target.value})}><option value="expired">Expired</option><option value="damaged">Damaged</option><option value="spoiled">Spoiled</option></select></Field><div className="form-actions"><button disabled={busy} className="button danger">{busy?'Saving…':'Record loss'}</button></div></form></Card></div><Card title="Recent batches"><Notice error={batches.error} loading={batches.loading} /><Table heads={['Product','Batch','Remaining','Expiry','Storage','Received']} rows={batches.rows.map(b => [product(b.product_id)?.name || 'Unknown',b.batch_no,`${b.qty_remaining} / ${b.qty_received} ${product(b.product_id)?.unit || ''}`,b.expiry || '—',units.rows.find(u => u.id === b.unit_id)?.name || 'Shelf',date(b.received_at)])} /></Card><Card title="Loss history"><Notice error={losses.error} loading={losses.loading} /><Table heads={['Date','Product','Reason','Quantity','Cost']} rows={losses.rows.map(l => [date(l.created_at),product(l.product_id)?.name || 'Unknown',<Badge tone="danger">{l.reason}</Badge>,l.qty,money(l.amount)])} /></Card></>
}
