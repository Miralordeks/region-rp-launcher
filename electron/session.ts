import { randomUUID } from 'node:crypto'
import { createLaunchSession, getPlayerStatus } from './api'
import { setOnServerPresence } from './discord'
import { getConfig } from './config'

const POLL_INTERVAL_MS = 10_000

let pollTimer: NodeJS.Timeout | null = null
let stopped = true

async function checkPlayer(token: string): Promise<void> {
  const config = getConfig()
  const api = config.playerApi
  if (stopped || !api?.baseUrl) return
  try {
    const status = await getPlayerStatus(api, token)
    if (stopped || !status.onServer) return
    setOnServerPresence({
      playerName: status.playerName,
      rank: status.rank,
    })
  } catch (error) {
    console.warn('[Session] Не удалось получить статус игрока', error)
  }
}

export function stopServerMonitor(): void {
  stopped = true
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

export async function startServerMonitor(): Promise<void> {
  stopServerMonitor()
  const config = getConfig()
  const api = config.playerApi
  if (!api?.baseUrl) return

  const token = randomUUID()
  stopped = false
  try {
    await createLaunchSession(api, token)
  } catch (error) {
    console.warn('[Session] Не удалось создать сессию', error)
  }

  void checkPlayer(token)
  pollTimer = setInterval(() => void checkPlayer(token), POLL_INTERVAL_MS)
}