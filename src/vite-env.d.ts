export {}

declare module '*.png' {
  const src: string
  export default src
}

type LauncherLinks = {
  discord: string
  website: string
  rules: string
}

type UserSettings = {
  openAtLogin: boolean
  minimizeToTray: boolean
}

type UpdateStatus =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string }
  | { status: 'disabled'; message: string }

declare global {
  interface Window {
    regionrp: {
      minimize: () => Promise<void>
      maximize: () => Promise<void>
      close: () => Promise<void>
      show: () => Promise<void>
      launchRoblox: () => Promise<
        { ok: true } | { ok: false; error: string }
      >
      getConfig: () => Promise<{
        placeId: string
        discordClientId: string
        gameName: string
        links: LauncherLinks
        updateFeedUrl: string
        onlinePlayers: number
      }>
      getSettings: () => Promise<UserSettings>
      setSettings: (partial: Partial<UserSettings>) => Promise<UserSettings>
      openExternal: (url: string) => Promise<void>
      checkForUpdates: () => Promise<UpdateStatus>
      installUpdate: () => Promise<void>
      getVersion: () => Promise<string>
      onUpdateStatus: (callback: (status: UpdateStatus) => void) => () => void
    }
  }
}
