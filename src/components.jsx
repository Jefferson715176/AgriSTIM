import React, { useEffect, useRef, useState } from 'react'
import { supabase, unwrap } from './lib/supabase'
import { cacheGeneration, tableCache } from './lib/tableCache'

export function Card({ title, action, children, className = '' }) {
  return <section className={`card ${className}`}><div className="card-head"><h2>{title}</h2>{action}</div>{children}</section>
}
export function Empty({ children = 'Nothing to show yet.' }) { return <div className="empty">{children}</div> }
export function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }
export function Badge({ children, tone = 'neutral' }) { return <span className={`badge ${tone}`}>{children}</span> }
export function FormError({ message }) { return message ? <div className="notice error" role="alert">{message}</div> : null }
export function Pager({ page, pageSize, total, onPage }) {
  if (total <= pageSize) return null
  const start = page * pageSize + 1
  const end = Math.min(total, (page + 1) * pageSize)
  const change = next => { onPage(next); window.scrollTo(0, 0) }
  return <div className="pager"><span>Showing {start}–{end} of {total}</span><div><button type="button" className="button small" disabled={page === 0} onClick={() => change(page - 1)}>Previous</button><button type="button" className="button small" disabled={end >= total} onClick={() => change(page + 1)}>Next</button></div></div>
}
export function Table({ heads, rows, empty = 'Nothing to show yet.' }) {
  if (!rows.length) return <Empty>{empty}</Empty>
  return <div className="table-wrap"><table><thead><tr>{heads.map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>
}
export function useTable(table, query = '*', options = {}) {
  const key = JSON.stringify([table, query, options.order, options.ascending, options.limit])
  const [rows, setRows] = useState(() => tableCache.get(key) || [])
  const [loading, setLoading] = useState(() => !tableCache.has(key))
  const [error, setError] = useState('')
  async function reload() {
    const generation = cacheGeneration
    if (!tableCache.has(key)) setLoading(true)
    try {
      let request = supabase.from(table).select(query)
      if (options.order) request = request.order(options.order, { ascending: options.ascending ?? false })
      if (options.limit) request = request.limit(options.limit)
      const next = await unwrap(request) || []
      if (generation !== cacheGeneration) return
      tableCache.set(key, next)
      setRows(next)
      setError('')
    } catch (issue) { setError(issue.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { setRows(tableCache.get(key) || []); reload() }, [key])
  return { rows, reload, loading, error }
}
export function Notice({ error, loading }) {
  if (error) return <div className="notice error" role="alert">{error}</div>
  if (loading) return <div className="loading-state" role="status" aria-label="Loading data"><span>Loading data…</span><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>
  return null
}

// Shared confirmation for actions that can't be undone: const [ask, confirmDialog] = useConfirm(); render {confirmDialog}; if (!await ask({...})) return
export function useConfirm() {
  const [request, setRequest] = useState(null)
  const ref = useRef(null)
  useEffect(() => { if (request && !ref.current?.open) ref.current?.showModal() }, [request])
  const [text, setText] = useState('')
  const ask = options => { setText(''); return new Promise(resolve => setRequest({ ...options, resolve })) }
  // With `input`, resolves to the trimmed text (or false on cancel) instead of true/false.
  const close = ok => { request.resolve(ok && request.input ? text.trim() : ok); setRequest(null) }
  const dialog = request && <dialog ref={ref} className="modal confirm-dialog" aria-labelledby="confirm-title" onCancel={e => { e.preventDefault(); close(false) }} onClick={e => { if (e.target === e.currentTarget) close(false) }}>
    <div><h2 id="confirm-title">{request.title}</h2><p>{request.message}</p>
      {request.input && <label className="field"><span>{request.input}</span><input autoFocus required maxLength="255" value={text} onChange={e => setText(e.target.value)} /></label>}
      <div className="form-actions"><button type="button" className="button" autoFocus={!request.input} onClick={() => close(false)}>Cancel</button><button type="button" className={`button ${request.danger ? 'danger' : 'primary'}`} disabled={request.input && !text.trim()} onClick={() => close(true)}>{request.action}</button></div></div>
  </dialog>
  return [ask, dialog]
}
