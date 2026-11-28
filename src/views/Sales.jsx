import React, { useState } from 'react'
import { Card, Empty, FormError, Notice, Table, useTable, useConfirm } from '../components'
import { date, money, philippineDay, supabase, unwrap } from '../lib/supabase'

export default function Sales({ notify }) {
  const [ask, confirmDialog] = useConfirm()
  const products = useTable('products','id,name,unit,retail_price,bulk_price,archived',{order:'name',ascending:true})
  const batches = useTable('batches','product_id,qty_remaining,expiry')
  const sales = useTable('sales','id,type,customer,total,created_at,sale_items(qty,unit_price,products(name))',{order:'created_at',limit:60})
  const [type,setType] = useState('retail')
  const [customer,setCustomer] = useState('')
  const [items,setItems] = useState([{product_id:'',qty:'1'}])
  const [busy,setBusy] = useState(false)
  const [formError,setFormError] = useState('')
  const [lineErrors,setLineErrors] = useState({})
  const [savedSale,setSavedSale] = useState(null)
  const today = philippineDay(Date.now())
  const available = products.rows.filter(p => !p.archived).map(p => ({
    ...p,
    stock:batches.rows.filter(b => b.product_id === p.id && (!b.expiry || b.expiry >= today)).reduce((sum,b) => sum + Number(b.qty_remaining),0),
  })).filter(p => p.stock > 0)
  const setItem = (i,key,value) => { setItems(items.map((item,index) => index === i ? {...item,[key]:value} : item)); setLineErrors({}) }
  const estimate = items.reduce((sum,item) => {
    const p=available.find(p=>p.id===Number(item.product_id))
    return sum+(p ? Number(item.qty||0)*Number(type==='bulk'&&Number(p.bulk_price)>0?p.bulk_price:p.retail_price):0)
  },0)
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setFormError('')
    setLineErrors({})
    setSavedSale(null)
    try {
      const lines=items.map(item=>({product_id:Number(item.product_id),qty:Number(item.qty)}))
      const errors={}
      const requested=new Map()
      lines.forEach((line,index)=>{
        const product=available.find(p=>p.id===line.product_id)
        if(!product) errors[index]={...errors[index],product:'Choose an available product.'}
        if(!Number.isInteger(line.qty)||line.qty<1||line.qty>1000000) errors[index]={...errors[index],qty:'Enter a quantity from 1 to 1,000,000.'}
        if(product&&Number.isInteger(line.qty)&&line.qty>0){
          const next=(requested.get(line.product_id)||0)+line.qty
          requested.set(line.product_id,next)
          if(next>product.stock) errors[index]={...errors[index],qty:`Only ${product.stock} ${product.unit} available in total.`}
        }
      })
      if(Object.keys(errors).length){setLineErrors(errors);throw new Error('Review the highlighted sale lines.')}
      if(!await ask({title:'Record sale?',message:`${lines.reduce((sum,line)=>sum+line.qty,0)} units · about ${money(estimate)}${customer.trim()?` for ${customer.trim()}`:''}. Stock is deducted right away and the sale can't be edited afterwards.`,action:'Record sale'})) return
      const id=await unwrap(supabase.rpc('record_sale',{p_type:type,p_customer:customer,p_items:lines}))
      let total=null
      try { const sale=await unwrap(supabase.from('sales').select('total').eq('id',id).single()); total=Number(sale.total) } catch { /* The sale was still recorded. */ }
      setSavedSale({id,total,units:lines.reduce((sum,line)=>sum+line.qty,0)})
      setCustomer('')
      setItems([{product_id:'',qty:'1'}])
      await Promise.all([sales.reload(),batches.reload()])
    } catch (issue) { setFormError(issue.message) }
    finally { setBusy(false) }
  }
  return <>{confirmDialog}
    <p className="intro">Record a retail or bulk sale. Stock is deducted in one database transaction.</p>
    <Card title="New sale">
      {savedSale && <div className="confirmation" role="status"><strong>Sale #{savedSale.id} recorded</strong><span>{savedSale.units} units{savedSale.total !== null ? ` · ${money(savedSale.total)}` : ''}. Stock has been updated.</span><button type="button" className="text-link" onClick={()=>setSavedSale(null)}>Dismiss</button></div>}
      <form onSubmit={submit}>
        <FormError message={formError} />
        <div className="form-grid">
          <label className="field"><span>Type</span><select value={type} onChange={e=>setType(e.target.value)}><option value="retail">Retail</option><option value="bulk">Bulk price</option></select></label>
          <label className="field"><span>Customer (optional)</span><input maxLength="100" value={customer} onChange={e=>setCustomer(e.target.value)} /></label>
        </div>
        <div className="line-items">
          <div className="line-head"><span>Product</span><span>Quantity</span><span>Amount</span><span></span></div>
          {items.map((item,i)=>{
            const p=available.find(p=>p.id===Number(item.product_id))
            return <div className="line-item" key={i}>
              <div className="line-field"><select aria-label={`Product for line ${i+1}`} aria-invalid={Boolean(lineErrors[i]?.product)} required value={item.product_id} onChange={e=>setItem(i,'product_id',e.target.value)}><option value="">Choose product…</option>{available.map(p=><option key={p.id} value={p.id}>{p.name} ({p.stock} left)</option>)}</select>{lineErrors[i]?.product && <small className="field-error">{lineErrors[i].product}</small>}</div>
              <div className="line-field"><input aria-label={`Quantity for line ${i+1}`} aria-invalid={Boolean(lineErrors[i]?.qty)} required type="number" min="1" max="1000000" step="1" value={item.qty} onChange={e=>setItem(i,'qty',e.target.value)} />{lineErrors[i]?.qty && <small className="field-error">{lineErrors[i].qty}</small>}</div>
              <strong>{money(p ? Number(item.qty||0)*Number(type==='bulk'&&Number(p.bulk_price)>0?p.bulk_price:p.retail_price) : 0)}</strong>
              <button type="button" className="icon-button" aria-label={`Remove line ${i+1}`} onClick={()=>setItems(items.filter((_,index)=>index!==i))}>×</button>
            </div>
          })}
        </div>
        <div className="sale-footer"><button type="button" className="button" onClick={()=>setItems([...items,{product_id:'',qty:'1'}])}>+ Add line</button><div><span>Estimated total</span><strong>{money(estimate)}</strong><button disabled={busy||!items.length} className="button primary">{busy?'Recording…':'Record sale'}</button></div></div>
      </form>
    </Card>
    <Card title="Sales history"><Notice error={sales.error} loading={sales.loading} />{sales.rows.length ? <Table heads={['Date','Sale','Customer','Items','Total']} rows={sales.rows.map(s=>[date(s.created_at),`#${s.id} · ${s.type}`,s.customer||'Walk-in',<span title={s.sale_items?.map(i=>`${i.qty} × ${i.products?.name||'Product'}`).join(', ')}>{s.sale_items?.reduce((sum,i)=>sum+i.qty,0)||0} units</span>,<strong>{money(s.total)}</strong>])} /> : !sales.loading && !sales.error && <Empty>There are no sales yet. Record the first sale above.</Empty>}</Card>
  </>
}
