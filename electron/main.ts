import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  nativeTheme,
} from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { startDiscordPresence, stopDiscordPresence } from './discord'
import { launchRoblox } from './roblox'
import { startServerMonitor, stopServerMonitor, getJoinCode } from './session'
import { getConfig } from './config'
import {
  getSettings,
  saveSettings,
  syncLoginItemFromSettings,
} from './settings'
import { createTray, destroyTray } from './tray'
import {
  checkForUpdates,
  quitAndInstall,
  setupAutoUpdater,
} from './updater'
import type { UserSettings } from './types'

let mainWindow: BrowserWindow | null = null
let isQuitting = false

const isDev = !app.isPackaged

function resolveIconPath(): string {
  const candidates = [
    path.join(process.resourcesPath, 'icon.png'),
    path.join(__dirname, '../build/icon.png'),
    path.join(app.getAppPath(), 'build/icon.png'),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return candidates[1]
}

function getMainWindow() {
  return mainWindow
}

function createWindow() {
  nativeTheme.themeSource = 'dark'

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 720,
    minWidth: 960,
    minHeight: 620,
    show: false,
    frame: false,
    backgroundColor: '#050A14',
    title: 'Region RP',
    icon: resolveIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    const settings = getSettings()
    if (!isQuitting && settings.minimizeToTray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function registerIpc() {
  ipcMain.handle('window:minimize', () => {
    const settings = getSettings()
    if (settings.minimizeToTray) {
      mainWindow?.hide()
    } else {
      mainWindow?.minimize()
    }
  })

  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    mainWindow?.close()
  })

  ipcMain.handle('window:show', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })

  ipcMain.handle('roblox:launch', async () => {
    const config = getConfig()
    const result = await launchRoblox(config.placeId)
    if (result.ok) {
      await startServerMonitor()
    }
    return result
  })

  ipcMain.handle('config:get', () => getConfig())

  ipcMain.handle('session:get-code', () => getJoinCode())

  ipcMain.handle('settings:get', () => getSettings())

  ipcMain.handle(
    'settings:set',
    (_event, partial: Partial<UserSettings>) => saveSettings(partial),
  )

  ipcMain.handle('shell:open-external', async (_event, url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      throw new Error('Only http(s) URLs are allowed')
    }
    await shell.openExternal(url)
  })

  ipcMain.handle('updater:check', async () => {
    const config = getConfig()
    return checkForUpdates(getMainWindow, config.updateFeedUrl)
  })

  ipcMain.handle('updater:install', () => {
    isQuitting = true
    quitAndInstall()
  })

  ipcMain.handle('app:get-version', () => app.getVersion())
}

app.whenReady().then(async () => {
  registerIpc()
  syncLoginItemFromSettings()
  createWindow()
  createTray(getMainWindow, () => {
    isQuitting = true
    app.quit()
  })

  const config = getConfig()
  await startDiscordPresence(config.discordClientId, config.gameName)

  if (app.isPackaged) {
    setupAutoUpdater(getMainWindow, config.updateFeedUrl)
    if (config.updateFeedUrl) {
      void checkForUpdates(getMainWindow, config.updateFeedUrl)
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('before-quit', () => {
  isQuitting = true
  stopServerMonitor()
  stopDiscordPresence()
  destroyTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopServerMonitor()
    stopDiscordPresence()
    app.quit()
  }
})
