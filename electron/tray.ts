import { BrowserWindow, Tray, Menu, nativeImage, app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

let tray: Tray | null = null

function resolveTrayIcon(): Electron.NativeImage {
  const candidates = [
    path.join(process.resourcesPath, 'icon.png'),
    path.join(__dirname, '../build/icon.png'),
    path.join(app.getAppPath(), 'build/icon.png'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return nativeImage.createFromPath(candidate).resize({ width: 16, height: 16 })
    }
  }

  return nativeImage.createEmpty()
}

export function createTray(
  getWindow: () => BrowserWindow | null,
  onQuit: () => void,
): Tray {
  if (tray) return tray

  tray = new Tray(resolveTrayIcon())
  tray.setToolTip('Region RP')

  const showWindow = () => {
    const win = getWindow()
    if (!win) return
    win.show()
    win.focus()
  }

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Открыть Region RP',
        click: showWindow,
      },
      { type: 'separator' },
      {
        label: 'Выйти',
        click: () => {
          onQuit()
        },
      },
    ]),
  )

  tray.on('double-click', showWindow)
  return tray
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
