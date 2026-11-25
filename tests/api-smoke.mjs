import sensor from '../api/sensor.js'
import users from '../api/users.js'

const response = () => ({
  code: 200,
  setHeader() {},
  status(code) { this.code = code; return this },
  json(body) { this.body = body; return this },
})
async function expect(handler, request, status) {
  const reply = response()
  await handler(request, reply)
  if (reply.code !== status) throw new Error(`Expected ${status}, received ${reply.code}: ${JSON.stringify(reply.body)}`)
}
await expect(sensor, { method: 'GET' }, 405)
process.env.SENSOR_KEY = 'a-long-test-secret'
await expect(sensor, { method: 'POST', body: { key: 'wrong' } }, 401)
await expect(sensor, { method: 'POST', body: { key: process.env.SENSOR_KEY, device_id: 'UNIT', temp: '' } }, 400)
await expect(sensor, { method: 'POST', body: { key: process.env.SENSOR_KEY, device_id: 'UNIT', temp: 5, humidity: 101 } }, 400)
await expect(users, { method: 'OPTIONS' }, 405)
console.log('Vercel API method, key, and reading validation passed')
