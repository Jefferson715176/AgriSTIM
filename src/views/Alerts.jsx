import React, { useState } from 'react'
import { Badge, Card, Field, Notice, Table, useTable } from '../components'
import { date, supabase, unwrap } from '../lib/supabase'

export default function Alerts({ notify }) {
  const alerts=useTable('alerts','*',{order:'created_at',limit:200})
  const [filter,setFilter]=useState('active')
  const [remarks,setRemarks]=useState({})
  const rows=alerts.rows.filter(a=>filter==='all'||(filter==='active'?a.status!=='resolved':a.status==='resolved'))
  async function update(alert,status){
    const note=(remarks[alert.id]||alert.remarks||'').trim()
    if(status==='resolved'&&!note)return notify('Write the action taken before resolving.',true)
    try{await unwrap(supabase.from('alerts').update({status,remarks:note||null}).eq('id',alert.id));alerts.reload();notify('Alert updated.')}
    catch(issue){notify(issue.message,true)}
  }
  return <><div className="toolbar"><p className="intro">Acknowledge issues and record what was done to resolve them.</p><div className="toolbar-actions">{['active','resolved','all'].map(value=><button key={value} className={`button ${filter===value?'selected':''}`} onClick={()=>setFilter(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div></div><Card title={`${rows.length} ${filter} alerts`}><Notice error={alerts.error} loading={alerts.loading} /><Table heads={['Date','Type','Message','Status','Action']} rows={rows.map(a=>[date(a.created_at),<Badge tone={a.type==='temp'?'danger':'warn'}>{a.type.replace('_',' ')}</Badge>,a.message,<Badge tone={a.status==='open'?'danger':a.status==='ack'?'warn':'good'}>{a.status}</Badge>,a.status==='resolved'?(a.remarks||'—'):<div className="alert-action"><input placeholder="Action taken" maxLength="255" value={remarks[a.id]??a.remarks??''} onChange={e=>setRemarks({...remarks,[a.id]:e.target.value})} /><button className="button small" onClick={()=>update(a,'ack')}>Acknowledge</button><button className="button small primary" onClick={()=>update(a,'resolved')}>Resolve</button></div>])} /></Card></>
}
