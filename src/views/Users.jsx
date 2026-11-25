import React, { useEffect, useState } from 'react'
import { Badge, Card, Field, Notice, Table } from '../components'
import { supabase } from '../lib/supabase'

export default function Users({ profile, session, notify }) {
  const [users,setUsers]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(true)
  const [form,setForm]=useState({email:'',full_name:'',password:'',role:'staff'})
  async function request(method,body){
    const { data:{session:current} }=await supabase.auth.getSession()
    const response=await fetch('/api/users',{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${current?.access_token||''}`},body:body?JSON.stringify(body):undefined})
    const payload=await response.json()
    if(!response.ok)throw new Error(payload.error||'Request failed')
    return payload
  }
  async function reload(){setLoading(true);try{setUsers((await request('GET')).users);setError('')}catch(issue){setError(issue.message)}finally{setLoading(false)}}
  useEffect(()=>{reload()},[])
  async function create(event){event.preventDefault();try{await request('POST',form);setForm({email:'',full_name:'',password:'',role:'staff'});reload();notify('User created.')}catch(issue){notify(issue.message,true)}}
  async function change(user,patch){try{await request('PATCH',{id:user.id,...patch});reload();notify('User updated.')}catch(issue){notify(issue.message,true)}}
  async function resetPassword(user){const password=prompt(`New password for ${user.email} (8+ characters):`);if(password===null)return;if(password.length<8)return notify('Password must be at least 8 characters.',true);await change(user,{password})}
  async function changeMyPassword(){const password=prompt('Your new password (8+ characters):');if(password===null)return;if(password.length<8)return notify('Password must be at least 8 characters.',true);const {error}=await supabase.auth.updateUser({password});notify(error?.message||'Your password changed.',Boolean(error))}
  async function remove(user){if(!confirm(`Delete ${user.email}?`))return;try{await request('DELETE',{id:user.id});reload();notify('User deleted.')}catch(issue){notify(issue.message,true)}}
  if(profile.role!=='owner')return null
  return <><div className="toolbar"><p className="intro">Create staff and owner accounts with Supabase Auth. Account changes take effect immediately.</p><button className="button" onClick={changeMyPassword}>Change my password</button></div><div className="two-col wide-left"><Card title="Accounts"><Notice error={error} loading={loading} /><Table heads={['Name','Email','Role','Status','']} rows={users.map(u=>[<strong>{u.full_name||'—'}</strong>,u.email,<select className="table-select" disabled={u.id===session.user.id} value={u.role} onChange={e=>change(u,{role:e.target.value})}><option value="staff">Staff</option><option value="owner">Owner</option></select>,<Badge tone={u.active?'good':'neutral'}>{u.active?'Active':'Inactive'}</Badge>,u.id===session.user.id?'You':<div className="row-actions"><button className="text-link" onClick={()=>change(u,{active:!u.active})}>{u.active?'Deactivate':'Activate'}</button><button className="text-link" onClick={()=>resetPassword(u)}>Reset password</button><button className="text-link" onClick={()=>remove(u)}>Delete</button></div>])} /></Card><Card title="Create account"><form className="form-grid" onSubmit={create}><Field label="Full name"><input required maxLength="100" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} /></Field><Field label="Email"><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></Field><Field label="Temporary password"><input required type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></Field><Field label="Role"><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="staff">Staff</option><option value="owner">Owner</option></select></Field><div className="form-actions"><button className="button primary">Create user</button></div></form></Card></div></>
}
