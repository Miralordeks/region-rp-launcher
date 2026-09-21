import type { PlayerStatus } from './types'

type ApiOptions = {
  baseUrl: string
  apiKey?: string
}

async function request(
  input: string,
  init: RequestInit = {},
  apiKey?: string,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    return await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

export async function createLaunchSession(
  options: ApiOptions,
  token: string,
): Promise<void> {
  const response = await request(
    `${options.baseUrl.replace(/\/$/, '')}/session`,
    { method: 'POST', body: JSON.stringify({ token }) },
    options.apiKey,
  )
  if (!response.ok) {
    throw new Error(`Session API вернул ${response.status}`)
  }
}

export async function getPlayerStatus(
  options: ApiOptions,
  token: string,
): Promise<PlayerStatus> {
  const response = await request(
    `${options.baseUrl.replace(/\/$/, '')}/player?token=${encodeURIComponent(token)}`,
    { method: 'GET' },
    options.apiKey,
  )
  if (!response.ok) {
    throw new Error(`Player API вернул ${response.status}`)
  }
  const data = (await response.json()) as Partial<PlayerStatus>
  return {
    onServer: Boolean(data.onServer),
    playerName: data.playerName ?? '',
    rank: data.rank ?? '',
  }
}

export function buildPlayerSubmitUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/player`
}