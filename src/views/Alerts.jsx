import React, { useState } from 'react'
import { Badge, Card, Notice, Table, useTable } from '../components'
import { date, supabase, unwrap } from '../lib/supabase'

export default function Alerts({ notify }) {
  const alerts=useTable('alerts','*',{order:'created_at',limit:200})
  const [filter,setFilter]=useState('active')
  const [remarks,setRemarks]=useState({})
  const [pending,setPending]=useState({})
  const [errors,setErrors]=useState({})
  const rows=alerts.rows.filter(a=>filter==='all'||(filter==='active'?a.status!=='resolved':a.status==='resolved'))
  async function update(alert,status){
    if(pending[alert.id])return
    const note=(remarks[alert.id]??alert.remarks??'').trim()
    if(status==='resolved'&&!note){setErrors(current=>({...current,[alert.id]:'Write the action taken before resolving.'}));return}
    setPending(current=>({...current,[alert.id]:true}))
    setErrors(current=>({...current,[alert.id]:''}))
    try{
      await unwrap(supabase.from('alerts').update({status,remarks:note||null}).eq('id',alert.id))
      await alerts.reload()
      notify(status==='resolved'?'Alert resolved.':'Alert acknowledged.')
    }catch(issue){setErrors(current=>({...current,[alert.id]:issue.message}))}
    finally{setPending(current=>({...current,[alert.id]:false}))}
  }
  return <>
    <div className="toolbar"><p className="intro">Acknowledge issues and record what was done to resolve them.</p><div className="toolbar-actions">{['active','resolved','all'].map(value=><button key={value} className={`button ${filter===value?'selected':''}`} onClick={()=>setFilter(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div></div>
    <Card title={`${rows.length} ${filter==='all'?'':`${filter} `}alerts`}><Notice error={alerts.error} loading={alerts.loading} /><Table heads={['Date','Type','Message','Status','Action']} empty={filter==='resolved'?'No resolved alerts yet.':filter==='all'?'No alerts recorded yet.':'No active alerts. All clear.'} rows={rows.map(a=>[
      date(a.created_at),
      <Badge tone={a.type==='temp'?'danger':'warn'}>{a.type.replace('_',' ')}</Badge>,
      a.message,
      <Badge tone={a.status==='open'?'danger':a.status==='ack'?'warn':'good'}>{a.status}</Badge>,
      a.status==='resolved'?(a.remarks||'—'):<div className="alert-action"><input aria-label={`Action taken for ${a.message}`} aria-invalid={Boolean(errors[a.id])} placeholder="Action taken" maxLength="255" value={remarks[a.id]??a.remarks??''} onChange={e=>{setRemarks({...remarks,[a.id]:e.target.value});setErrors({...errors,[a.id]:''})}} /><button className="button small" disabled={Boolean(pending[a.id])} onClick={()=>update(a,'ack')}>{pending[a.id]?'Saving…':'Acknowledge'}</button><button className="button small primary" disabled={Boolean(pending[a.id])} onClick={()=>update(a,'resolved')}>Resolve</button>{errors[a.id]&&<small className="field-error" role="alert">{errors[a.id]}</small>}</div>,
    ])} /></Card>
  </>
}
