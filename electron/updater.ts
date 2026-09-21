import { autoUpdater } from 'electron-updater'
import type { BrowserWindow } from 'electron'
import type { UpdateStatus } from './types'

let started = false

function send(win: BrowserWindow | null, payload: UpdateStatus) {
  win?.webContents.send('updater:status', payload)
}

export function setupAutoUpdater(
  getWindow: () => BrowserWindow | null,
  feedUrl: string,
): void {
  if (started) return
  started = true

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  if (!feedUrl) {
    send(getWindow(), {
      status: 'disabled',
      message: 'Укажи updateFeedUrl в launcher.config.json',
    })
    return
  }

  try {
    autoUpdater.setFeedURL({ provider: 'generic', url: feedUrl })
  } catch (error) {
    send(getWindow(), {
      status: 'error',
      message:
        error instanceof Error ? error.message : 'Некорректный updateFeedUrl',
    })
    return
  }

  autoUpdater.on('checking-for-update', () => {
    send(getWindow(), { status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    send(getWindow(), {
      status: 'available',
      version: info.version,
    })
  })

  autoUpdater.on('update-not-available', () => {
    send(getWindow(), { status: 'not-available' })
  })

  autoUpdater.on('download-progress', (progress) => {
    send(getWindow(), {
      status: 'downloading',
      percent: Math.round(progress.percent),
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    send(getWindow(), {
      status: 'downloaded',
      version: info.version,
    })
  })

  autoUpdater.on('error', (error) => {
    send(getWindow(), {
      status: 'error',
      message: error.message || 'Ошибка обновления',
    })
  })
}

export async function checkForUpdates(
  getWindow: () => BrowserWindow | null,
  feedUrl: string,
): Promise<UpdateStatus> {
  if (!feedUrl) {
    const status: UpdateStatus = {
      status: 'disabled',
      message: 'Укажи updateFeedUrl в launcher.config.json',
    }
    send(getWindow(), status)
    return status
  }

  try {
    setupAutoUpdater(getWindow, feedUrl)
    send(getWindow(), { status: 'checking' })
    await autoUpdater.checkForUpdates()
    return { status: 'checking' }
  } catch (error) {
    const status: UpdateStatus = {
      status: 'error',
      message:
        error instanceof Error ? error.message : 'Не удалось проверить обновления',
    }
    send(getWindow(), status)
    return status
  }
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall(false, true)
}
