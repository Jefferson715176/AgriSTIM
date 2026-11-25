import { timingSafeEqual } from 'node:crypto'
import { adminClient, result } from '../server/supabase.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return result(response, 405, { error: 'Use POST' })
  const secret = process.env.SENSOR_KEY
  if (!secret || secret === 'REPLACE_WITH_A_RANDOM_SECRET') return result(response, 503, { error: 'Sensor key is not configured' })
  let body
  try { body = request.body } catch { return result(response, 400, { error: 'Invalid JSON' }) }
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.key !== 'string') return result(response, 401, { error: 'Unauthorized' })
  const actual = Buffer.from(body.key), expected = Buffer.from(secret)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return result(response, 401, { error: 'Unauthorized' })
  if (typeof body.device_id !== 'string' || !/^[A-Za-z0-9_.-]{1,40}$/.test(body.device_id)) return result(response, 400, { error: 'Invalid device ID' })
  const validNumber = value => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value))
  if (!validNumber(body.temp) || (body.humidity != null && !validNumber(body.humidity))) return result(response, 400, { error: 'Invalid reading' })
  const temperature = Number(body.temp), humidity = body.humidity == null ? null : Number(body.humidity)
  if (temperature < -60 || temperature > 100 || (humidity !== null && (humidity < 0 || humidity > 100))) return result(response, 400, { error: 'Invalid reading' })
  try {
    const db = adminClient()
    const { data: unit, error: unitError } = await db.from('storage_units').select('*').eq('device_id', body.device_id).maybeSingle()
    if (unitError) throw unitError
    if (!unit) return result(response, 404, { error: 'Unknown device ID' })
    const { error: logError } = await db.from('temp_logs').insert({ unit_id: unit.id, temp_c: temperature, humidity })
    if (logError) throw logError
    const { error: offlineError } = await db.from('alerts').update({ status: 'resolved', remarks: 'Sensor back online' }).eq('type', 'offline').eq('ref_id', unit.id).neq('status', 'resolved')
    if (offlineError) throw offlineError
    const out = temperature < Number(unit.min_c) || temperature > Number(unit.max_c)
    if (out) {
      const { error: alertError } = await db.from('alerts').insert({ type: 'temp', ref_id: unit.id, message: `${unit.name}: ${temperature}°C is outside ${unit.min_c}–${unit.max_c}°C` })
      if (alertError && alertError.code !== '23505') throw alertError
    }
    return result(response, 200, { ok: true, out_of_range: out })
  } catch (error) {
    console.error('sensor ingest failed', error)
    return result(response, 500, { error: 'Sensor ingest failed' })
  }
}
