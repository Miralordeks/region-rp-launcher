import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import type { UserSettings } from './types'

const defaults: UserSettings = {
  openAtLogin: false,
  minimizeToTray: true,
}

function settingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

export function getSettings(): UserSettings {
  try {
    const file = settingsPath()
    if (!fs.existsSync(file)) return { ...defaults }
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = JSON.parse(raw) as Partial<UserSettings>
    return {
      openAtLogin: Boolean(parsed.openAtLogin),
      minimizeToTray:
        typeof parsed.minimizeToTray === 'boolean'
          ? parsed.minimizeToTray
          : defaults.minimizeToTray,
    }
  } catch {
    return { ...defaults }
  }
}

export function saveSettings(partial: Partial<UserSettings>): UserSettings {
  const next = { ...getSettings(), ...partial }
  fs.writeFileSync(settingsPath(), JSON.stringify(next, null, 2), 'utf8')
  applyLoginItem(next.openAtLogin)
  return next
}

export function applyLoginItem(openAtLogin: boolean): void {
  if (!app.isPackaged) return
  try {
    app.setLoginItemSettings({
      openAtLogin,
      path: process.execPath,
      args: [],
    })
  } catch (error) {
    console.warn('[Settings] Не удалось изменить автозапуск', error)
  }
}

export function syncLoginItemFromSettings(): void {
  const settings = getSettings()
  applyLoginItem(settings.openAtLogin)
}
