import React, { useState } from 'react'
import { Card, Notice, Pager, Table, useTable } from '../components'
import { date } from '../lib/supabase'

const pageSize = 25
export default function Audit() {
  const logs=useTable('audit_log','id,action,created_at,legacy_user_id,profiles(full_name,email)',{order:'created_at',limit:300})
  const [search,setSearch]=useState('')
  const [page,setPage]=useState(0)
  const filtered=logs.rows.filter(log=>[log.action,log.profiles?.full_name,log.profiles?.email].some(value=>String(value||'').toLowerCase().includes(search.toLowerCase())))
  const visible=filtered.slice(page*pageSize,(page+1)*pageSize)
  return <>
    <p className="intro">Recent account and inventory activity.</p>
    <Card title="Audit log" action={<input className="search" aria-label="Search audit log" placeholder="Search activity" value={search} onChange={event=>{setSearch(event.target.value);setPage(0)}} />}>
      <Notice error={logs.error} loading={logs.loading} />
      <Table heads={['When','Actor','Action']} empty={search?'No matching activity.':'No activity recorded yet.'} rows={visible.map(log=>[date(log.created_at),log.profiles?.full_name||log.profiles?.email||(log.legacy_user_id?`Legacy user #${log.legacy_user_id}`:'System'),log.action])} />
      <Pager page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} />
    </Card>
    <p className="fine-print">Showing the latest 300 audit entries.</p>
  </>
}
