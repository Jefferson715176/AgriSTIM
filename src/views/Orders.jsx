import React, { useState } from 'react'
import { Badge, Card, Field, Notice, Table, useTable } from '../components'
import { date, money, supabase, unwrap } from '../lib/supabase'

const statuses=['Pending','Confirmed','Preparing','Ready for Pickup','Completed','Cancelled']
const payments=['Unpaid','Partially Paid','Paid']
export default function Orders({ notify }) {
  const orders=useTable('bulk_orders','*',{order:'created_at',limit:100})
  const [form,setForm]=useState({customer_name:'',contact_number:'',pickup_date:'',pickup_time:'',total_amount:'',notes:''})
  const [busy,setBusy]=useState(false)
  async function submit(event) {
    event.preventDefault();setBusy(true)
    try {
      await unwrap(supabase.rpc('create_bulk_order',{p_customer_name:form.customer_name,p_contact_number:form.contact_number||null,p_pickup_date:form.pickup_date||null,p_pickup_time:form.pickup_time||null,p_total_amount:Number(form.total_amount),p_notes:form.notes||null}))
      setForm({customer_name:'',contact_number:'',pickup_date:'',pickup_time:'',total_amount:'',notes:''});orders.reload();notify('Bulk order saved.')
    } catch(issue){notify(issue.message,true)}finally{setBusy(false)}
  }
  async function update(id,key,value){try{await unwrap(supabase.from('bulk_orders').update({[key]:value}).eq('order_id',id));orders.reload();notify('Order updated.')}catch(issue){notify(issue.message,true)}}
  return <><p className="intro">Track pickup orders and payments alongside regular sales.</p><div className="two-col wide-left"><Card title="Bulk orders"><Notice error={orders.error} loading={orders.loading} /><Table heads={['Order','Customer','Pickup','Total','Status','Payment']} rows={orders.rows.map(o=>[<strong>{o.order_number}<small className="subline">{date(o.created_at)}</small></strong>,o.customer_name,<span>{o.pickup_date||'—'} {o.pickup_time?.slice(0,5)||''}</span>,money(o.total_amount),<select className="table-select" value={o.order_status} onChange={e=>update(o.order_id,'order_status',e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select>,<select className="table-select" value={o.payment_status} onChange={e=>update(o.order_id,'payment_status',e.target.value)}>{payments.map(s=><option key={s}>{s}</option>)}</select>])} /></Card><Card title="New pickup order"><form className="form-grid" onSubmit={submit}><Field label="Customer"><input required maxLength="150" value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} /></Field><Field label="Contact"><input maxLength="30" value={form.contact_number} onChange={e=>setForm({...form,contact_number:e.target.value})} /></Field><Field label="Pickup date"><input type="date" value={form.pickup_date} onChange={e=>setForm({...form,pickup_date:e.target.value})} /></Field><Field label="Pickup time"><input type="time" value={form.pickup_time} onChange={e=>setForm({...form,pickup_time:e.target.value})} /></Field><Field label="Total"><input required type="number" min="0" max="9999999999.99" step="0.01" value={form.total_amount} onChange={e=>setForm({...form,total_amount:e.target.value})} /></Field><Field label="Notes"><textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></Field><div className="form-actions"><button disabled={busy} className="button primary">Save order</button></div></form></Card></div></>
}
