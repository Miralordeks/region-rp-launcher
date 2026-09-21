import fs from 'node:fs'
import path from 'node:path'

let cachedUserId: number | null | undefined

function findCookieFile(): string | null {
  const localAppData = process.env.LOCALAPPDATA
  if (!localAppData) return null
  const candidates = [
    path.join(localAppData, 'Roblox', 'LocalStorage', 'file__http.cookies'),
    path.join(localAppData, 'Roblox', 'LocalStorage', 'file__httpCookies.json'),
  ]
  for (const file of candidates) {
    if (fs.existsSync(file)) return file
  }
  return null
}

function extractCookieToken(file: string): string | null {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = JSON.parse(raw) as Record<string, string>
    const keys = ['.ROBLOSECURITY', 'cookie', 'rbxSessionID', 'GuestData']
    for (const key of keys) {
      const value = parsed[key]
      if (typeof value === 'string' && value.startsWith('_|')) return value
    }
    for (const value of Object.values(parsed)) {
      if (typeof value === 'string' && value.startsWith('_|')) return value
    }
  } catch {
    return null
  }
  return null
}

async function fetchUserId(cookieToken: string): Promise<number | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch('https://www.roblox.com/mobileapi/userinfo', {
        headers: {
          Cookie: `.ROBLOSECURITY=${cookieToken}`,
        },
        signal: controller.signal,
      })
      if (!res.ok) return null
      const data = (await res.json()) as { userId?: number }
      return typeof data.userId === 'number' ? data.userId : null
    } finally {
      clearTimeout(timer)
    }
  } catch {
    return null
  }
}

export async function getRobloxUserId(): Promise<number | null> {
  if (cachedUserId !== undefined) return cachedUserId
  const file = findCookieFile()
  if (!file) {
    cachedUserId = null
    return null
  }
  const token = extractCookieToken(file)
  if (!token) {
    cachedUserId = null
    return null
  }
  cachedUserId = await fetchUserId(token)
  return cachedUserId
}