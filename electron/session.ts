import { randomInt } from 'node:crypto'
import {
  createLaunchSession,
  getPlayerStatus,
  getPlayerStatusByUserId,
} from './api'
import { setOnServerPresence } from './discord'
import { getConfig } from './config'
import { getRobloxUserId } from './robloxauth'

const POLL_INTERVAL_MS = 10_000
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

type SessionKey =
  | { type: 'userId'; value: number }
  | { type: 'code'; value: string }

let pollTimer: NodeJS.Timeout | null = null
let stopped = true
let currentCode = ''
let activeKey: SessionKey | null = null

function generateCode(length = 6): string {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += CODE_CHARS[randomInt(0, CODE_CHARS.length)]
  }
  return code
}

async function checkPlayer(): Promise<void> {
  const config = getConfig()
  const api = config.playerApi
  if (stopped || !api?.baseUrl || !activeKey) return
  try {
    const status =
      activeKey.type === 'userId'
        ? await getPlayerStatusByUserId(api, activeKey.value)
        : await getPlayerStatus(api, activeKey.value)
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
  currentCode = ''
  activeKey = null
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

export function getJoinCode(): string {
  return currentCode
}

export async function startServerMonitor(): Promise<void> {
  stopServerMonitor()
  const config = getConfig()
  const api = config.playerApi
  if (!api?.baseUrl) return

  const userId = await getRobloxUserId()
  stopped = false

  if (userId) {
    activeKey = { type: 'userId', value: userId }
    console.info(`[Session] Найден Roblox аккаунт (ID ${userId}), ввод кода не нужен`)
  } else {
    currentCode = generateCode()
    activeKey = { type: 'code', value: currentCode }
    try {
      await createLaunchSession(api, currentCode)
    } catch (error) {
      console.warn('[Session] Не удалось создать сессию', error)
    }
  }

  void checkPlayer()
  pollTimer = setInterval(() => void checkPlayer(), POLL_INTERVAL_MS)
}