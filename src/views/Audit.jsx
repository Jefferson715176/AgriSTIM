import React from 'react'
import { Badge, Card, Notice, Table, useTable } from '../components'
import { date } from '../lib/supabase'

export default function Audit() {
  const logs=useTable('audit_log','id,action,created_at,legacy_user_id,profiles(full_name,email)',{order:'created_at',limit:300})
  return <><p className="intro">Recent account and inventory activity.</p><Card title="Audit log"><Notice error={logs.error} loading={logs.loading} /><Table heads={['When','Actor','Action']} rows={logs.rows.map(log=>[date(log.created_at),log.profiles?.full_name||log.profiles?.email||(log.legacy_user_id?`Legacy user #${log.legacy_user_id}`:'System'),log.action])} /></Card></>
}
