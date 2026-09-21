export type LaunchResult =
  | { ok: true }
  | { ok: false; error: string }

export type LauncherLinks = {
  discord: string
  website: string
  rules: string
}

export type LauncherPlayerApi = {
  baseUrl: string
  apiKey?: string
}

export type LauncherConfig = {
  placeId: string
  discordClientId: string
  gameName: string
  links: LauncherLinks
  updateFeedUrl: string
  onlinePlayers: number
  playerApi: LauncherPlayerApi
}

export type PlayerStatus = {
  onServer: boolean
  playerName: string
  rank: string
}

export type UserSettings = {
  openAtLogin: boolean
  minimizeToTray: boolean
}

export type UpdateStatus =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string }
  | { status: 'disabled'; message: string }
