import React, { useState } from 'react'
import { Badge, Card, Empty, Field, Notice, Table, useTable } from '../components'
import { audit, money, supabase, unwrap } from '../lib/supabase'

const blank = { name:'', category:'', unit:'', cost_price:'', retail_price:'', bulk_price:'', reorder_level:'5' }
export default function Products({ profile, session, notify }) {
  const products = useTable('products','*',{ order:'name', ascending:true })
  const categories = useTable('categories','*',{ order:'name', ascending:true })
  const prices = useTable('price_list','*',{ order:'id', ascending:true, limit:500 })
  const [form,setForm] = useState(null)
  const [category,setCategory] = useState('')
  const [search,setSearch] = useState('')
  const [mode,setMode] = useState('inventory')
  const owner = profile.role === 'owner'
  async function save(event) {
    event.preventDefault()
    try {
      if (!categories.rows.some(c => c.name === form.category)) throw new Error('Choose a category from the list.')
      const values = { name:form.name.trim(),category:form.category,unit:form.unit.trim(),cost_price:Number(form.cost_price),retail_price:Number(form.retail_price),bulk_price:Number(form.bulk_price),reorder_level:Number(form.reorder_level) }
      if (!values.name || !values.unit || Object.values(values).some(value => typeof value === 'number' && (!Number.isFinite(value) || value < 0))) throw new Error('Complete all fields with valid non-negative amounts.')
      if (form.id) await unwrap(supabase.from('products').update(values).eq('id',form.id))
      else await unwrap(supabase.from('products').insert(values))
      await audit(`${form.id ? 'updated' : 'added'} product ${values.name}`,session.user.id)
      setForm(null); products.reload(); notify('Product saved.')
    } catch (issue) { notify(issue.message,true) }
  }
  async function toggle(row) {
    try { await unwrap(supabase.from('products').update({ archived:!row.archived }).eq('id',row.id)); products.reload(); notify(`Product ${row.archived ? 'restored' : 'archived'}.`) }
    catch (issue) { notify(issue.message,true) }
  }
  async function addCategory(event) {
    event.preventDefault()
    if (!category.trim() || category.length > 50) return notify('Category must be 1–50 characters.',true)
    try { await unwrap(supabase.from('categories').insert({ name:category.trim() })); categories.reload(); setCategory(''); notify('Category added.') }
    catch (issue) { notify(issue.message,true) }
  }
  const shown = products.rows.filter(p => (p.name + ' ' + p.category).toLowerCase().includes(search.toLowerCase()))
  return <><div className="toolbar"><p className="intro">Manage stock items, prices, and categories.</p><div className="toolbar-actions"><button className={`button ${mode === 'inventory' ? 'selected' : ''}`} onClick={() => setMode('inventory')}>Inventory</button><button className={`button ${mode === 'price-list' ? 'selected' : ''}`} onClick={() => setMode('price-list')}>Reference price list</button>{owner && <button className="button primary" onClick={() => { setMode('inventory'); setForm(blank) }}>+ Add product</button>}</div></div>{mode === 'inventory' ? <><div className="two-col wide-left"><Card title="Products" action={<input className="search" placeholder="Search products" value={search} onChange={e => setSearch(e.target.value)} />}><Notice error={products.error} loading={products.loading} /><Table heads={['Product','Category','Retail','Bulk','Reorder','Status',...(owner ? [''] : [])]} rows={shown.map(p => [<strong>{p.name}<small className="subline">{p.unit}</small></strong>,p.category,money(p.retail_price),money(p.bulk_price),p.reorder_level,<Badge tone={p.archived ? 'neutral' : 'good'}>{p.archived ? 'Archived' : 'Active'}</Badge>,...(owner ? [<div className="row-actions"><button className="text-link" onClick={() => setForm(p)}>Edit</button><button className="text-link" onClick={() => toggle(p)}>{p.archived ? 'Restore' : 'Archive'}</button></div>] : [])])} /></Card><Card title="Categories"><Notice error={categories.error} loading={categories.loading} />{categories.rows.length ? <div className="chip-list">{categories.rows.map(c => <span className="chip" key={c.id}>{c.name}</span>)}</div> : <Empty />}{owner && <form onSubmit={addCategory} className="inline-form"><input placeholder="New category" maxLength="50" value={category} onChange={e => setCategory(e.target.value)} /><button className="button">Add</button></form>}</Card></div>{form && owner && <div className="modal-backdrop" onClick={() => setForm(null)}><div className="modal" onClick={e => e.stopPropagation()}><div className="card-head"><h2>{form.id ? 'Edit product' : 'New product'}</h2><button className="icon-button" onClick={() => setForm(null)}>×</button></div><form onSubmit={save} className="form-grid"><Field label="Name"><input required maxLength="120" value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></Field><Field label="Category"><select required value={form.category} onChange={e => setForm({...form,category:e.target.value})}><option value="">Choose…</option>{categories.rows.map(c => <option key={c.id}>{c.name}</option>)}</select></Field><Field label="Unit"><input required maxLength="20" placeholder="sack, bottle, piece" value={form.unit} onChange={e => setForm({...form,unit:e.target.value})} /></Field><Field label="Reorder at"><input required type="number" min="0" max="1000000" step="1" value={form.reorder_level} onChange={e => setForm({...form,reorder_level:e.target.value})} /></Field>{['cost_price','retail_price','bulk_price'].map(key => <Field key={key} label={key.replace('_',' ')}><input required type="number" min="0" max="99999999.99" step="0.01" value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} /></Field>)}<div className="form-actions"><button type="button" className="button" onClick={() => setForm(null)}>Cancel</button><button className="button primary">Save product</button></div></form></div></div>}</> : <Card title="Reference price list"><Notice error={prices.error} loading={prices.loading} /><Table heads={['Category','Brand','Product','Variant','Kilo','Sack','Half sack','Piece','10s']} rows={prices.rows.map(p => [p.category,p.brand,p.product_name,p.variant,money(p.price_per_kilo),money(p.price_per_sack),money(p.price_half_sack),money(p.price_per_piece),money(p.price_tie_by_10s)])} /></Card>}</>
}
