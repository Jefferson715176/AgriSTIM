import React, { useEffect, useRef, useState } from 'react'
import { Badge, Card, Empty, Field, FormError, Notice, Table, useConfirm } from '../components'
import { supabase } from '../lib/supabase'

const blank={email:'',full_name:'',password:'',role:'staff'}

export default function Users({ profile, session, notify }) {
  const [ask, confirmDialog] = useConfirm()
  const [users,setUsers]=useState([])
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(true)
  const [form,setForm]=useState(blank)
  const [formError,setFormError]=useState('')
  const [creating,setCreating]=useState(false)
  const [pendingUser,setPendingUser]=useState(null)
  const [dialog,setDialog]=useState(null)
  const [dialogPassword,setDialogPassword]=useState('')
  const [dialogError,setDialogError]=useState('')
  const [dialogBusy,setDialogBusy]=useState(false)
  const dialogFocus=useRef(null)
  const dialogRoot=useRef(null)
  const previousFocus=useRef(null)
  async function request(method,body){
    const { data:{session:current} }=await supabase.auth.getSession()
    const response=await fetch('/api/users',{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${current?.access_token||''}`},body:body?JSON.stringify(body):undefined})
    const payload=await response.json().catch(()=>{throw new Error('Account service is unavailable. Try again later.')})
    if(!response.ok)throw new Error(payload.error||'Request failed')
    return payload
  }
  async function reload(){setLoading(true);try{setUsers((await request('GET')).users);setError('')}catch(issue){setError(issue.message)}finally{setLoading(false)}}
  useEffect(()=>{reload()},[])
  useEffect(()=>{
    if(!dialog)return
    dialogFocus.current?.focus()
    const onKey=event=>{
      if(event.key==='Escape'&&!dialogBusy)closeDialog()
      if(event.key==='Tab'){
        const controls=[...(dialogRoot.current?.querySelectorAll('button:not(:disabled),input:not(:disabled)')||[])]
        const first=controls[0],last=controls.at(-1)
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
      }
    }
    addEventListener('keydown',onKey)
    return()=>removeEventListener('keydown',onKey)
  },[dialog,dialogBusy])
  function openDialog(type,user=null){previousFocus.current=document.activeElement;setDialog({type,user});setDialogPassword('');setDialogError('')}
  function closeDialog(){setDialog(null);setDialogPassword('');setDialogError('');requestAnimationFrame(()=>previousFocus.current?.focus())}
  async function create(event){
    event.preventDefault()
    if(creating)return
    setCreating(true);setFormError('')
    try{await request('POST',form);setForm(blank);await reload();notify('Account created.')}
    catch(issue){setFormError(issue.message)}
    finally{setCreating(false)}
  }
  async function change(user,patch){
    if(pendingUser)return
    const message=patch.role?`${user.email} will become ${patch.role==='owner'?'an owner, with full access to users, reports and the audit log':'staff, and lose access to users, reports and the audit log'}.`:patch.active===false?`${user.email} will lose access and can't log in until the account is reactivated.`:null
    if(message&&!await ask({title:patch.role?'Change role?':'Deactivate account?',message,action:patch.role?'Change role':'Deactivate',danger:patch.active===false}))return
    setPendingUser(user.id)
    try{await request('PATCH',{id:user.id,...patch});await reload();notify(`${user.email} updated.`)}
    catch(issue){notify(issue.message,true)}
    finally{setPendingUser(null)}
  }
  async function submitDialog(event){
    event.preventDefault()
    if(!dialog||dialogBusy)return
    setDialogError('')
    setDialogBusy(true)
    try{
      if(dialog.type==='delete'){
        await request('DELETE',{id:dialog.user.id})
        await reload()
        notify(`${dialog.user.email} deleted.`)
      }else if(dialog.type==='reset'){
        if(dialogPassword.length<8)throw new Error('Password must be at least 8 characters.')
        await request('PATCH',{id:dialog.user.id,password:dialogPassword})
        notify(`Password changed for ${dialog.user.email}.`)
      }else{
        if(dialogPassword.length<8)throw new Error('Password must be at least 8 characters.')
        const {error:issue}=await supabase.auth.updateUser({password:dialogPassword})
        if(issue)throw issue
        notify('Your password changed.')
      }
      closeDialog()
    }catch(issue){setDialogError(issue.message)}
    finally{setDialogBusy(false)}
  }
  if(profile.role!=='owner')return null
  return <>{confirmDialog}
    <div className="toolbar"><p className="intro">Create staff and owner accounts. Account changes take effect immediately.</p><button className="button" onClick={()=>openDialog('mine')}>Change my password</button></div>
    <div className="two-col wide-left">
      <Card title="Accounts">
        <Notice error={error} loading={loading} />
        {users.length ? <Table heads={['Name','Email','Role','Status','']} rows={users.map(u=>[
          <strong>{u.full_name||'—'}</strong>,u.email,
          <select className="table-select" aria-label={`Role for ${u.email}`} disabled={u.id===session.user.id||pendingUser===u.id} value={u.role} onChange={e=>change(u,{role:e.target.value})}><option value="staff">Staff</option><option value="owner">Owner</option></select>,
          <Badge tone={u.active?'good':'neutral'}>{u.active?'Active':'Inactive'}</Badge>,
          u.id===session.user.id?'You':<div className="row-actions"><button className="text-link" disabled={pendingUser===u.id} onClick={()=>change(u,{active:!u.active})}>{pendingUser===u.id?'Saving…':u.active?'Deactivate':'Activate'}</button><button className="text-link" onClick={()=>openDialog('reset',u)}>Reset password</button><button className="text-link" onClick={()=>openDialog('delete',u)}>Delete</button></div>,
        ])} /> : !loading && !error && <Empty>No accounts found.</Empty>}
      </Card>
      <Card title="Create account"><form className="form-grid" onSubmit={create}>
        <FormError message={formError} />
        <Field label="Full name"><input required maxLength="100" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} /></Field>
        <Field label="Email"><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></Field>
        <Field label="Temporary password"><input required type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></Field>
        <Field label="Role"><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="staff">Staff</option><option value="owner">Owner</option></select></Field>
        <div className="form-actions"><button className="button primary" disabled={creating}>{creating?'Creating…':'Create user'}</button></div>
      </form></Card>
    </div>
    {dialog && <div className="modal-backdrop" onClick={()=>{if(!dialogBusy)closeDialog()}}><div className="modal" ref={dialogRoot} role="dialog" aria-modal="true" aria-labelledby="account-dialog-title" onClick={e=>e.stopPropagation()}>
      <div className="card-head"><h2 id="account-dialog-title">{dialog.type==='delete'?'Delete account':dialog.type==='reset'?'Reset password':'Change my password'}</h2><button type="button" className="icon-button" aria-label="Close dialog" disabled={dialogBusy} onClick={closeDialog}>×</button></div>
      <form className="form-grid" onSubmit={submitDialog}>
        {dialog.type==='delete' ? <p>Delete <strong>{dialog.user.email}</strong>? This removes the account and its access.</p> : <><p>{dialog.type==='reset'?`Set a new password for ${dialog.user.email}.`:'Set a new password for your account.'}</p><Field label="New password"><input ref={dialogFocus} required type="password" minLength="8" autoComplete="new-password" value={dialogPassword} onChange={e=>setDialogPassword(e.target.value)} /></Field></>}
        <FormError message={dialogError} />
        <div className="form-actions"><button type="button" ref={dialog.type==='delete'?dialogFocus:null} className="button" disabled={dialogBusy} onClick={closeDialog}>Cancel</button><button className={`button ${dialog.type==='delete'?'danger':'primary'}`} disabled={dialogBusy}>{dialogBusy?'Saving…':dialog.type==='delete'?'Delete account':'Save password'}</button></div>
      </form>
    </div></div>}
  </>
}
