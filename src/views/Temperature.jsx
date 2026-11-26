import React, { useEffect, useState } from 'react'
import { Badge, Card, Field, Notice, Table, useTable } from '../components'
import { date, supabase, unwrap } from '../lib/supabase'
import { TemperatureTrend } from '../components/Charts'

const blank={name:'',device_id:'',min_c:'2',max_c:'8'}
export default function Temperature({ profile, notify }) {
  const units=useTable('storage_units','*',{order:'id',ascending:true})
  const logs=useTable('temp_logs','*',{order:'logged_at',limit:100})
  const [form,setForm]=useState(blank)
  const [selectedUnit,setSelectedUnit]=useState('')
  const owner=profile.role==='owner'
  useEffect(()=>{const timer=setInterval(()=>logs.reload(),30000);return()=>clearInterval(timer)},[])
  async function save(event){event.preventDefault();try{
    const values={name:form.name.trim(),device_id:form.device_id.trim(),min_c:Number(form.min_c),max_c:Number(form.max_c)}
    if(!/^[A-Za-z0-9_.-]{1,40}$/.test(values.device_id)||!values.name||values.min_c< -60||values.max_c>100||values.min_c>=values.max_c)throw new Error('Check the device ID and temperature limits.')
    if(form.id)await unwrap(supabase.from('storage_units').update(values).eq('id',form.id))
    else await unwrap(supabase.from('storage_units').insert(values))
    setForm(blank);units.reload();notify('Storage unit saved.')
  }catch(issue){notify(issue.message,true)}}
  async function remove(unit){if(!confirm(`Delete ${unit.name} and its sensor readings?`))return;try{await unwrap(supabase.from('storage_units').delete().eq('id',unit.id));units.reload();logs.reload();notify('Storage unit deleted.')}catch(issue){notify(issue.message,true)}}
  const latest=units.rows.map(u=>{const reading=logs.rows.find(l=>l.unit_id===u.id);const offline=!reading||Date.now()-new Date(reading.logged_at).getTime()>600000;const out=reading&&(Number(reading.temp_c)<Number(u.min_c)||Number(reading.temp_c)>Number(u.max_c));return {...u,reading,offline,out}})
  const chartUnit=units.rows.find(u=>String(u.id)===selectedUnit)||units.rows[0]
  const trend=chartUnit ? logs.rows.filter(l=>l.unit_id===chartUnit.id).slice().reverse() : []
  return <><p className="intro">Live readings from storage units. Sensors post to the Vercel API endpoint using a secret key.</p><div className="sensor-grid">{latest.map(u=><div className="sensor-card" key={u.id}><div className="sensor-top"><span>◉</span><Badge tone={u.offline?'neutral':u.out?'danger':'good'}>{u.offline?'Offline':u.out?'Out of range':'Normal'}</Badge></div><h2>{u.name}</h2><strong>{u.reading?`${u.reading.temp_c}°C`:'—'}</strong><small>Safe range {u.min_c}–{u.max_c}°C · {u.reading?date(u.reading.logged_at):'No readings'}</small></div>)}</div>{chartUnit&&<Card title="Temperature history" action={<label className="field"><span>Storage unit</span><select value={chartUnit.id} onChange={e=>setSelectedUnit(e.target.value)}>{units.rows.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label>}>{trend.length ? <TemperatureTrend labels={trend.map(l=>date(l.logged_at))} readings={trend.map(l=>Number(l.temp_c))} min={Number(chartUnit.min_c)} max={Number(chartUnit.max_c)} /> : <p className="fine-print">No readings for this unit yet. Check its device ID and sensor connection.</p>}<p className="fine-print">Showing this unit’s readings among the latest 100 records.</p></Card>}<div className="two-col wide-left"><Card title="Recent readings"><Notice error={logs.error} loading={logs.loading} /><Table heads={['Time','Unit','Temperature','Humidity']} empty="No sensor readings yet. Check the device ID and sensor connection." rows={logs.rows.map(l=>[date(l.logged_at),units.rows.find(u=>u.id===l.unit_id)?.name||'Unknown',`${l.temp_c}°C`,l.humidity===null?'—':`${l.humidity}%`])} /></Card>{owner&&<Card title="Storage units"><div className="unit-list">{units.rows.map(u=><div key={u.id}><strong>{u.name}</strong><span>{u.device_id} · {u.min_c}–{u.max_c}°C</span><button className="text-link" onClick={()=>setForm(u)}>Edit</button><button className="text-link" onClick={()=>remove(u)}>Delete</button></div>)}</div><form className="form-grid" onSubmit={save}><h3>{form.id?'Edit unit':'Add unit'}</h3><Field label="Name"><input required maxLength="80" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></Field><Field label="Device ID"><input required maxLength="40" value={form.device_id} onChange={e=>setForm({...form,device_id:e.target.value})} /></Field><div className="form-grid two"><Field label="Minimum °C"><input required type="number" step="0.01" min="-60" max="100" value={form.min_c} onChange={e=>setForm({...form,min_c:e.target.value})} /></Field><Field label="Maximum °C"><input required type="number" step="0.01" min="-60" max="100" value={form.max_c} onChange={e=>setForm({...form,max_c:e.target.value})} /></Field></div><div className="form-actions">{form.id&&<button className="button" type="button" onClick={()=>setForm(blank)}>Cancel</button>}<button className="button primary">Save unit</button></div></form></Card>}</div></>
}
