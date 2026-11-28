import React, { useState } from 'react'
import { Card, Empty, Field, FormError, Notice, Table, useTable, useConfirm } from '../components'
import { date, money, philippineDay, supabase, unwrap } from '../lib/supabase'

const statuses=['Pending','Confirmed','Preparing','Ready for Pickup','Completed','Cancelled']
const payments=['Unpaid','Partially Paid','Paid']
const blank={customer_name:'',contact_number:'',pickup_date:'',pickup_time:'',notes:'',items:[{product_id:'',qty:'1'}]}
const open=status=>!['Completed','Cancelled'].includes(status)

export default function Orders({ notify }) {
  const [ask, confirmDialog] = useConfirm()
  const orders=useTable('bulk_orders','*,bulk_order_items(product_id,qty,unit_price,products(name))',{order:'created_at',limit:100})
  const products=useTable('products','id,name,unit,retail_price,bulk_price,archived',{order:'name',ascending:true})
  const batches=useTable('batches','product_id,qty_remaining,expiry')
  const today=philippineDay(Date.now())
  const reservedQty=id=>orders.rows.filter(o=>open(o.order_status)).flatMap(o=>o.bulk_order_items||[]).filter(i=>i.product_id===id).reduce((s,i)=>s+i.qty,0)
  const available=products.rows.filter(p=>!p.archived).map(p=>({...p,price:Number(p.bulk_price)>0?Number(p.bulk_price):Number(p.retail_price),free:batches.rows.filter(b=>b.product_id===p.id&&(!b.expiry||b.expiry>=today)).reduce((s,b)=>s+Number(b.qty_remaining),0)-reservedQty(p.id)})).filter(p=>p.free>0)
  const estimate=form=>form.items.reduce((sum,i)=>sum+(available.find(p=>p.id===Number(i.product_id))?.price||0)*Number(i.qty||0),0)
  const [form,setForm]=useState(blank)
  const [busy,setBusy]=useState(false)
  const [formError,setFormError]=useState('')
  const [savedOrder,setSavedOrder]=useState(null)
  const [pending,setPending]=useState({})
  const [draft,setDraft]=useState({})
  const [feedback,setFeedback]=useState({})
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setFormError('')
    setSavedOrder(null)
    try {
      const items=form.items.map(i=>({product_id:Number(i.product_id),qty:Number(i.qty)}))
      if(items.some(i=>!i.product_id||!Number.isInteger(i.qty)||i.qty<1)) throw new Error('Choose a product and a whole-number quantity on every line.')
      const id=await unwrap(supabase.rpc('create_bulk_order',{p_customer_name:form.customer_name,p_contact_number:form.contact_number||null,p_pickup_date:form.pickup_date||null,p_pickup_time:form.pickup_time||null,p_items:items,p_notes:form.notes||null}))
      setSavedOrder({id,customer:form.customer_name.trim()})
      setForm(blank)
      await orders.reload()
    } catch(issue){setFormError(issue.message)}
    finally{setBusy(false)}
  }
  async function update(id,key,value) {
    const slot=`${id}:${key}`
    if (pending[slot]) return
    if (key==='order_status' && (value==='Cancelled' || value==='Completed')) {
      const order=orders.rows.find(o=>o.order_id===id)
      const itemised=order?.bulk_order_items?.length>0
      const message=value==='Completed'&&itemised?`${order.order_number} for ${order.customer_name} will be recorded as a ${money(order.total_amount)} sale and the stock deducted.`:value==='Cancelled'&&itemised?`${order.order_number} for ${order.customer_name} will be cancelled and its reserved stock released. It can't be reopened.`:`${order?.order_number||'This order'} for ${order?.customer_name||'this customer'} will be marked ${value}.`
      if (!await ask({title:value==='Completed'&&itemised?'Complete pickup?':`Mark order ${value.toLowerCase()}?`,message,action:value==='Completed'&&itemised?'Complete and record sale':`Mark ${value.toLowerCase()}`,danger:value==='Cancelled'})) return
    }
    setPending(current=>({...current,[slot]:true}))
    setDraft(current=>({...current,[slot]:value}))
    setFeedback(current=>({...current,[slot]:{kind:'pending',text:'Saving…'}}))
    try {
      const order=orders.rows.find(o=>o.order_id===id)
      if (key==='order_status'&&value==='Completed'&&order?.bulk_order_items?.length) {
        const sale=await unwrap(supabase.rpc('complete_bulk_order',{p_order_id:id}))
        notify?.(`Pickup completed. Recorded as sale #${sale}.`)
      } else await unwrap(supabase.from('bulk_orders').update({[key]:value}).eq('order_id',id))
      await Promise.all([orders.reload(),batches.reload()])
      setFeedback(current=>({...current,[slot]:{kind:'saved',text:'Saved'}}))
    } catch(issue) {
      setFeedback(current=>({...current,[slot]:{kind:'error',text:`Not saved: ${issue.message}`}}))
    } finally {
      setPending(current=>{const next={...current};delete next[slot];return next})
      setDraft(current=>{const next={...current};delete next[slot];return next})
    }
  }
  function statusSelect(order,key,choices,label) {
    const slot=`${order.order_id}:${key}`
    const state=feedback[slot]
    return <div className="inline-status">
      <select className="table-select" aria-label={`${label} for ${order.order_number}`} disabled={Boolean(pending[slot])||(key==='order_status'&&order.bulk_order_items?.length>0&&!open(order.order_status))} value={draft[slot]??order[key]} onChange={e=>update(order.order_id,key,e.target.value)}>{choices.map(choice=><option key={choice}>{choice}</option>)}</select>
      {state && <small className={state.kind==='error'?'inline-feedback error':'inline-feedback'} role="status">{state.text}</small>}
    </div>
  }
  return <>{confirmDialog}
    <p className="intro">Track pickup orders and payments alongside regular sales.</p>
    <div className="two-col wide-left">
      <Card title="Bulk orders">
        <Notice error={orders.error} loading={orders.loading} />
        {orders.rows.length ? <Table heads={['Order','Customer','Items','Pickup','Total','Status','Payment']} rows={orders.rows.map(o=>[
          <strong>{o.order_number}<small className="subline">{date(o.created_at)}</small></strong>,
          o.customer_name,
          o.bulk_order_items?.length?<span className="order-items">{o.bulk_order_items.map((i,n)=><span key={n}>{i.qty} × {i.products?.name||'Product'}</span>)}</span>:'—',
          <span>{o.pickup_date||'—'} {o.pickup_time?.slice(0,5)||''}</span>,
          money(o.total_amount),
          statusSelect(o,'order_status',statuses,'Order status'),
          statusSelect(o,'payment_status',payments,'Payment status'),
        ])} /> : !orders.loading && !orders.error && <Empty>No pickup orders yet. Create the first order using the form.</Empty>}
      </Card>
      <Card title="New pickup order">
        {savedOrder && <div className="confirmation" role="status"><strong>Order #{savedOrder.id} saved</strong><span>{savedOrder.customer} has been added to the order list.</span><button type="button" className="text-link" onClick={()=>setSavedOrder(null)}>Dismiss</button></div>}
        <form className="form-grid" onSubmit={submit}>
          <FormError message={formError} />
          <Field label="Customer"><input required maxLength="150" value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} /></Field>
          <Field label="Contact"><input maxLength="30" value={form.contact_number} onChange={e=>setForm({...form,contact_number:e.target.value})} /></Field>
          <Field label="Pickup date"><input type="date" value={form.pickup_date} onChange={e=>setForm({...form,pickup_date:e.target.value})} /></Field>
          <Field label="Pickup time"><input type="time" value={form.pickup_time} onChange={e=>setForm({...form,pickup_time:e.target.value})} /></Field>
          <div className="field"><span>Products</span>
            {form.items.map((item,i)=><div className="order-line" key={i}>
              <select aria-label={`Product for line ${i+1}`} required value={item.product_id} onChange={e=>setForm({...form,items:form.items.map((x,n)=>n===i?{...x,product_id:e.target.value}:x)})}><option value="">Choose product…</option>{available.map(p=><option key={p.id} value={p.id}>{p.name} ({p.free} free · {money(p.price)})</option>)}</select>
              <input aria-label={`Quantity for line ${i+1}`} required type="number" min="1" max={available.find(p=>p.id===Number(item.product_id))?.free} step="1" value={item.qty} onChange={e=>setForm({...form,items:form.items.map((x,n)=>n===i?{...x,qty:e.target.value}:x)})} />
              <button type="button" className="icon-button" aria-label={`Remove line ${i+1}`} disabled={form.items.length===1} onClick={()=>setForm({...form,items:form.items.filter((_,n)=>n!==i)})}>×</button>
            </div>)}
            <button type="button" className="button small" onClick={()=>setForm({...form,items:[...form.items,{product_id:'',qty:'1'}]})}>+ Add product</button>
            {!available.length&&!products.loading&&<small className="field-error">No products have free stock. Add a delivery on the Stock page first.</small>}
          </div>
          <p className="order-total"><span>Order total (bulk price)</span><strong>{money(estimate(form))}</strong></p>
          <Field label="Notes"><textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></Field>
          <div className="form-actions"><button disabled={busy} className="button primary">{busy?'Saving…':'Save order'}</button></div>
        </form>
      </Card>
    </div>
  </>
}
