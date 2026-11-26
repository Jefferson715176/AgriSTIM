import React, { Suspense, useEffect, useRef, useState } from 'react'
import { configured, supabase, unwrap } from './lib/supabase'
import { clearTableCache } from './lib/tableCache'
import Overview from './views/Overview'
import Products from './views/Products'
import Stock from './views/Stock'
import Sales from './views/Sales'
import Orders from './views/Orders'
import Alerts from './views/Alerts'
import Users from './views/Users'
import Audit from './views/Audit'

const Temperature = React.lazy(() => import('./views/Temperature'))
const Reports = React.lazy(() => import('./views/Reports'))

const navigation = [
  ['overview', 'Overview', '◫'], ['products', 'Products', '▣'], ['stock', 'Stock', '◈'],
  ['sales', 'Sales', '₱'], ['orders', 'Bulk orders', '▤'], ['temperature', 'Temperature', '◉'],
  ['alerts', 'Alerts', '◬'], ['reports', 'Reports', '▥'], ['users', 'Users', '♙'], ['audit', 'Audit log', '◷'],
]
const views = { overview: Overview, products: Products, stock: Stock, sales: Sales,
  orders: Orders, temperature: Temperature, alerts: Alerts, reports: Reports, users: Users, audit: Audit }

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    const { error: issue } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (issue) setError(issue.message)
    setBusy(false)
  }
  return <main className="login-shell"><div className="login-art"><div className="brand big"><span className="brand-mark">🌾</span><span>AgriSTIM<small>RJM Agrivet</small></span></div><div><p className="eyebrow">Inventory · Sales · Storage</p><h1>Know what’s in stock. Keep what matters safe.</h1><p>One place for product inventory, cold storage readings, sales, and timely alerts.</p></div><div className="login-foot">Built for the people keeping farms moving.</div></div><div className="login-panel"><form className="login-form" onSubmit={submit}><span className="pill">Secure sign in</span><h2>Welcome back</h2><p>Use the email and password provided by the store owner.</p>{error && <div className="notice error" role="alert">{error}</div>}<label className="field"><span>Email address</span><input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label><label className="field"><span>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label><button className="button primary wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</button></form></div></main>
}

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState(location.hash.slice(1) || 'overview')
  const [message, setMessage] = useState(null)
  const [connection, setConnection] = useState('checking')
  const toastTimer = useRef(null)
  const lastUserId = useRef(null)
  useEffect(() => {
    if (!supabase) { setAuthReady(true); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session)).finally(() => setAuthReady(true))
    const { data: auth } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => auth.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    const userId = session?.user?.id || null
    if (lastUserId.current !== userId) { clearTableCache(); lastUserId.current = userId }
  }, [session?.user?.id])
  useEffect(() => {
    if (!authReady) return
    if (!session) { setProfile(null); setReady(true); return }
    setReady(false)
    let cancelled = false
    unwrap(supabase.from('profiles').select('*').eq('id', session.user.id).single())
      .then(data => { if (!cancelled) { setProfile(data); setReady(true) } })
      .catch(error => { if (!cancelled) { setProfile({ error: error.message }); setReady(true) } })
    return () => { cancelled = true }
  }, [authReady, session?.user?.id])
  useEffect(() => {
    const change = () => { window.scrollTo(0, 0); setView(location.hash.slice(1) || 'overview') }
    addEventListener('hashchange', change)
    return () => removeEventListener('hashchange', change)
  }, [])
  useEffect(() => {
    if (window.innerWidth > 800) return
    const nav = document.querySelector('.sidebar nav')
    const active = nav?.querySelector('a.active')
    if (!nav || !active) return
    const navBox = nav.getBoundingClientRect(), activeBox = active.getBoundingClientRect()
    nav.scrollLeft += activeBox.left - navBox.left - (navBox.width - activeBox.width) / 2
  }, [view])
  useEffect(() => {
    if (!session?.user?.id) return
    let active = true
    async function check() {
      if (!navigator.onLine) { if (active) setConnection('offline'); return }
      try {
        const { error } = await supabase.from('profiles').select('id').eq('id', session.user.id).limit(1)
        if (active) setConnection(error ? 'offline' : 'online')
      } catch { if (active) setConnection('offline') }
    }
    check()
    const timer = setInterval(check, 60000)
    addEventListener('online', check)
    addEventListener('offline', check)
    return () => { active = false; clearInterval(timer); removeEventListener('online', check); removeEventListener('offline', check) }
  }, [session?.user?.id])
  useEffect(() => () => clearTimeout(toastTimer.current), [])
  function notify(text, bad = false) {
    clearTimeout(toastTimer.current)
    setMessage({ text, bad })
    toastTimer.current = setTimeout(() => setMessage(null), 5000)
  }
  if (!configured) return <main className="setup-shell"><div className="setup-card"><span className="brand-mark">🌾</span><h1>AgriSTIM is ready to connect</h1><p>Add the client’s Supabase URL and publishable key to Vercel environment variables. See the project README for the handoff steps.</p></div></main>
  if (!authReady || !ready) return <div className="loading-screen">Loading AgriSTIM…</div>
  if (!session) return <Login />
  if (!profile?.active || profile.error) return <main className="setup-shell"><div className="setup-card"><h1>Account needs access</h1><p>{profile?.error || 'This account is inactive.'} Ask the Supabase project owner to activate your profile.</p><button className="button" onClick={() => supabase.auth.signOut()}>Sign out</button></div></main>
  const current = views[view] ? view : 'overview'
  const Page = views[current]
  return <div className="app-shell"><aside className="sidebar"><a className="brand" href="#overview"><span className="brand-mark">🌾</span><span>AgriSTIM<small>RJM Agrivet</small></span></a><div className="nav-caption">WORKSPACE</div><nav>{navigation.filter(([key]) => !['users', 'audit', 'reports'].includes(key) || profile.role === 'owner').map(([key, label, icon]) => <a key={key} href={`#${key}`} className={current === key ? 'active' : ''}><span className="nav-icon">{icon}</span>{label}</a>)}</nav><div className="sidebar-bottom"><div className="avatar">{(profile.full_name || profile.email)[0]?.toUpperCase()}</div><div className="account"><strong>{profile.full_name || profile.email}</strong><span>{profile.role === 'owner' ? 'Store owner' : 'Staff'}</span></div><button className="signout" title="Sign out" onClick={() => supabase.auth.signOut()}>↗</button></div></aside><main className="main"><header className="topbar"><div><div className="eyebrow">RJM AGRIVET / {current.toUpperCase()}</div><h1>{navigation.find(([key]) => key === current)?.[1]}</h1></div><div className={`topbar-side ${connection}`} role="status"><span className="online-dot" /> {connection === 'online' ? 'Connected to server' : connection === 'offline' ? 'Connection unavailable' : 'Checking connection'}</div></header><div className="toast-region" aria-live="polite" aria-atomic="true">{message && <div className={`toast ${message.bad ? 'error' : ''}`}>{message.text}</div>}</div><div className="content"><Suspense fallback={<div className="two-col page-loading" role="status" aria-label="Loading page"><div className="card skeleton-card"><div className="skeleton-line" /><div className="skeleton-row" /><div className="skeleton-row" /></div><div className="card skeleton-card"><div className="skeleton-line" /><div className="skeleton-row" /></div></div>}><Page profile={profile} session={session} notify={notify} /></Suspense></div></main></div>
}
