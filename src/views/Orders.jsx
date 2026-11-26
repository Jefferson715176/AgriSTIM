import React, { useState } from 'react'
import { Card, Empty, Field, FormError, Notice, Table, useTable } from '../components'
import { date, money, supabase, unwrap } from '../lib/supabase'

const statuses=['Pending','Confirmed','Preparing','Ready for Pickup','Completed','Cancelled']
const payments=['Unpaid','Partially Paid','Paid']
const blank={customer_name:'',contact_number:'',pickup_date:'',pickup_time:'',total_amount:'',notes:''}

export default function Orders() {
  const orders=useTable('bulk_orders','*',{order:'created_at',limit:100})
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
      const id=await unwrap(supabase.rpc('create_bulk_order',{p_customer_name:form.customer_name,p_contact_number:form.contact_number||null,p_pickup_date:form.pickup_date||null,p_pickup_time:form.pickup_time||null,p_total_amount:Number(form.total_amount),p_notes:form.notes||null}))
      setSavedOrder({id,customer:form.customer_name.trim()})
      setForm(blank)
      await orders.reload()
    } catch(issue){setFormError(issue.message)}
    finally{setBusy(false)}
  }
  async function update(id,key,value) {
    const slot=`${id}:${key}`
    if (pending[slot]) return
    setPending(current=>({...current,[slot]:true}))
    setDraft(current=>({...current,[slot]:value}))
    setFeedback(current=>({...current,[slot]:{kind:'pending',text:'Saving…'}}))
    try {
      await unwrap(supabase.from('bulk_orders').update({[key]:value}).eq('order_id',id))
      await orders.reload()
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
      <select className="table-select" aria-label={`${label} for ${order.order_number}`} disabled={Boolean(pending[slot])} value={draft[slot]??order[key]} onChange={e=>update(order.order_id,key,e.target.value)}>{choices.map(choice=><option key={choice}>{choice}</option>)}</select>
      {state && <small className={state.kind==='error'?'inline-feedback error':'inline-feedback'} role="status">{state.text}</small>}
    </div>
  }
  return <>
    <p className="intro">Track pickup orders and payments alongside regular sales.</p>
    <div className="two-col wide-left">
      <Card title="Bulk orders">
        <Notice error={orders.error} loading={orders.loading} />
        {orders.rows.length ? <Table heads={['Order','Customer','Pickup','Total','Status','Payment']} rows={orders.rows.map(o=>[
          <strong>{o.order_number}<small className="subline">{date(o.created_at)}</small></strong>,
          o.customer_name,
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
          <Field label="Total"><input required type="number" min="0" max="9999999999.99" step="0.01" value={form.total_amount} onChange={e=>setForm({...form,total_amount:e.target.value})} /></Field>
          <Field label="Notes"><textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></Field>
          <div className="form-actions"><button disabled={busy} className="button primary">{busy?'Saving…':'Save order'}</button></div>
        </form>
      </Card>
    </div>
  </>
}
