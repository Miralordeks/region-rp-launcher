import { shell } from 'electron'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs'
import type { LaunchResult } from './types'

const execFileAsync = promisify(execFile)

function buildProtocolUrl(placeId: string): string {
  return `roblox://experiences/start?placeId=${encodeURIComponent(placeId)}`
}

function buildWebUrl(placeId: string): string {
  return `https://www.roblox.com/games/${encodeURIComponent(placeId)}`
}

function findRobloxPlayer(): string | null {
  const localAppData = process.env.LOCALAPPDATA
  if (!localAppData) return null

  const versionsDir = path.join(localAppData, 'Roblox', 'Versions')
  if (!fs.existsSync(versionsDir)) return null

  try {
    const versions = fs
      .readdirSync(versionsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
      .reverse()

    for (const version of versions) {
      const player = path.join(versionsDir, version, 'RobloxPlayerBeta.exe')
      if (fs.existsSync(player)) return player
    }
  } catch {
    return null
  }

  return null
}

export async function launchRoblox(placeId: string): Promise<LaunchResult> {
  if (!placeId || placeId === '0') {
    return {
      ok: false,
      error: 'Place ID не настроен. Укажи placeId в launcher.config.json',
    }
  }

  const protocolUrl = buildProtocolUrl(placeId)
  const webUrl = buildWebUrl(placeId)

  try {
    await shell.openExternal(protocolUrl)
    return { ok: true }
  } catch {
    // fallback below
  }

  try {
    if (process.platform === 'win32') {
      await execFileAsync('cmd', ['/c', 'start', '', protocolUrl], {
        windowsHide: true,
      })
      return { ok: true }
    }
  } catch {
    // continue
  }

  const player = findRobloxPlayer()
  if (player) {
    try {
      await execFileAsync(player, [protocolUrl], { windowsHide: true })
      return { ok: true }
    } catch {
      // fall through
    }
  }

  try {
    await shell.openExternal(webUrl)
    return { ok: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось запустить Roblox'
    return { ok: false, error: message }
  }
}
