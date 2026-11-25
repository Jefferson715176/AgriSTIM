import { adminClient, result } from '../server/supabase.js'

export default async function handler(request, response) {
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) return result(response, 405, { error: 'Method not allowed' })
  try {
    const db = adminClient()
    const token = request.headers.authorization?.replace(/^Bearer /i, '')
    if (!token) return result(response, 401, { error: 'Login required' })
    const { data: auth, error: authError } = await db.auth.getUser(token)
    if (authError || !auth.user) return result(response, 401, { error: 'Login required' })
    const { data: caller, error: callerError } = await db.from('profiles').select('*').eq('id', auth.user.id).single()
    if (callerError || !caller?.active || caller.role !== 'owner') return result(response, 403, { error: 'Owner access required' })
    if (request.method === 'GET') {
      const { data, error } = await db.from('profiles').select('id,email,full_name,role,active').order('created_at')
      if (error) throw error
      return result(response, 200, { users: data })
    }
    let body
    try { body = request.body } catch { return result(response, 400, { error: 'Invalid JSON' }) }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return result(response, 400, { error: 'Invalid request' })
    if (request.method === 'POST') {
      const { email, password, full_name, role } = body
      if (typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || typeof password !== 'string' || password.length < 8 || typeof full_name !== 'string' || !full_name.trim() || full_name.length > 100 || !['owner','staff'].includes(role)) return result(response, 400, { error: 'Invalid account details' })
      const created = await db.auth.admin.createUser({ email: email.trim().toLowerCase(), password, email_confirm: true, user_metadata: { full_name: full_name.trim() } })
      if (created.error) return result(response, 400, { error: created.error.message })
      const updated = await db.from('profiles').update({ full_name: full_name.trim(), role, active: true }).eq('id', created.data.user.id)
      if (updated.error) { await db.auth.admin.deleteUser(created.data.user.id); throw updated.error }
      return result(response, 201, { id: created.data.user.id })
    }
    const id = body.id
    if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) return result(response, 400, { error: 'Invalid user ID' })
    if (id === caller.id) return result(response, 400, { error: 'Change your own account in Supabase Auth' })
    const { data: target } = await db.from('profiles').select('id,role,active').eq('id', id).maybeSingle()
    if (!target) return result(response, 404, { error: 'User not found' })
    if (target.role === 'owner' && target.active) {
      const { count, error } = await db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'owner').eq('active', true)
      if (error) throw error
      if (count <= 1 && (request.method === 'DELETE' || body.role === 'staff' || body.active === false)) return result(response, 400, { error: 'At least one active owner is required' })
    }
    if (request.method === 'DELETE') {
      const { error } = await db.auth.admin.deleteUser(id)
      if (error) throw error
      return result(response, 200, { ok: true })
    }
    const patch = {}
    if (body.password !== undefined) {
      if (typeof body.password !== 'string' || body.password.length < 8) return result(response,400,{error:'Password must be at least 8 characters'})
      const { error } = await db.auth.admin.updateUserById(id, { password: body.password })
      if (error) throw error
    }
    if (body.role !== undefined) { if (!['owner','staff'].includes(body.role)) return result(response,400,{error:'Invalid role'}); patch.role=body.role }
    if (body.active !== undefined) { if (typeof body.active !== 'boolean') return result(response,400,{error:'Invalid status'}); patch.active=body.active }
    if (!Object.keys(patch).length && body.password === undefined) return result(response, 400, { error: 'No changes provided' })
    if (Object.keys(patch).length) {
      const { error } = await db.from('profiles').update(patch).eq('id', id)
      if (error) throw error
    }
    return result(response, 200, { ok: true })
  } catch (error) {
    console.error('user admin failed', error)
    return result(response, 500, { error: 'User operation failed' })
  }
}
