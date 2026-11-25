import React, { useEffect, useState } from 'react'
import { supabase, unwrap } from './lib/supabase'

export function Card({ title, action, children, className = '' }) {
  return <section className={`card ${className}`}><div className="card-head"><h2>{title}</h2>{action}</div>{children}</section>
}
export function Empty({ children = 'Nothing to show yet.' }) { return <div className="empty">{children}</div> }
export function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }
export function Badge({ children, tone = 'neutral' }) { return <span className={`badge ${tone}`}>{children}</span> }
export function Table({ heads, rows, empty = 'Nothing to show yet.' }) {
  if (!rows.length) return <Empty>{empty}</Empty>
  return <div className="table-wrap"><table><thead><tr>{heads.map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>
}
export function useTable(table, query = '*', options = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  async function reload() {
    setLoading(true)
    try {
      let request = supabase.from(table).select(query)
      if (options.order) request = request.order(options.order, { ascending: options.ascending ?? false })
      if (options.limit) request = request.limit(options.limit)
      setRows(await unwrap(request) || [])
      setError('')
    } catch (issue) { setError(issue.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { reload() }, [table])
  return { rows, reload, loading, error }
}
export function Notice({ error, loading }) {
  if (error) return <div className="notice error">{error}</div>
  if (loading) return <div className="notice">Loading…</div>
  return null
}
