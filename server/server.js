const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const PORT = process.env.PORT || 3000
const DATA_FILE = path.join(__dirname, 'data.json')

let sessions = new Map()
try {
  if (fs.existsSync(DATA_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    sessions = new Map(Object.entries(parsed))
  }
} catch {
  // стартуем с пустой памятью
}

let saveTimer = null
function persist() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(sessions)), 'utf8')
    } catch (error) {
      console.error('[RegionRP API] persist error:', error)
    }
  }, 300)
}

function send(res, status, body) {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(json)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 64 * 1024) {
        reject(new Error('body too large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'))
      } catch {
        reject(new Error('invalid json'))
      }
    })
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const route = url.pathname

  if (req.method === 'OPTIONS') {
    return send(res, 204, {})
  }

  if (req.method === 'GET' && route === '/health') {
    return send(res, 200, { ok: true, sessions: sessions.size })
  }

  if (req.method === 'POST' && route === '/session') {
    try {
      const body = await readBody(req)
      const token = String(body.token || '')
      if (!token) return send(res, 400, { ok: false, error: 'token required' })
      sessions.set(token, {
        onServer: false,
        playerName: '',
        rank: '',
        createdAt: Date.now(),
      })
      persist()
      return send(res, 200, { ok: true })
    } catch (error) {
      return send(res, 400, { ok: false, error: String(error.message || error) })
    }
  }

  if (req.method === 'POST' && route === '/player') {
    try {
      const body = await readBody(req)
      const key = body.token
        ? String(body.token)
        : body.userId
          ? `u:${String(body.userId)}`
          : null
      if (!key) return send(res, 400, { ok: false, error: 'token or userId required' })
      let session = sessions.get(key)
      if (!session) {
        session = { onServer: false, playerName: '', rank: '', createdAt: Date.now() }
        sessions.set(key, session)
      }
      session.onServer = Boolean(body.onServer)
      session.playerName = String(body.playerName || '')
      session.rank = String(body.rank || '')
      if (!session.onServer) {
        setTimeout(() => {
          sessions.delete(key)
          persist()
        }, 60_000)
      }
      persist()
      return send(res, 200, { ok: true })
    } catch (error) {
      return send(res, 400, { ok: false, error: String(error.message || error) })
    }
  }

  if (req.method === 'GET' && route === '/player') {
    const token = String(url.searchParams.get('token') || '')
    const userId = String(url.searchParams.get('userId') || '')
    const key = token ? token : userId ? `u:${userId}` : ''
    const session = sessions.get(key)
    if (!session) {
      return send(res, 200, { onServer: false, playerName: '', rank: '' })
    }
    return send(res, 200, {
      onServer: session.onServer,
      playerName: session.playerName,
      rank: session.rank,
    })
  }

  return send(res, 404, { ok: false, error: 'not found' })
})

server.listen(PORT, () => {
  console.log(`Region RP API запущен на :${PORT}`)
})