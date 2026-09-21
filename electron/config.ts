import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import type { LauncherConfig, LauncherLinks } from './types'

const defaultLinks: LauncherLinks = {
  discord: 'https://discord.gg/GhNc7TqsUe',
  website: 'https://discord.gg/GhNc7TqsUe',
  rules: 'https://discord.gg/GhNc7TqsUe',
}

const defaults: LauncherConfig = {
  placeId: '0',
  discordClientId: '0',
  gameName: 'Регион РП',
  links: defaultLinks,
  updateFeedUrl: '',
  onlinePlayers: 0,
  playerApi: {
    baseUrl: '',
    apiKey: '',
  },
}

function readJsonConfig(): Partial<LauncherConfig> {
  const candidates = [
    path.join(process.cwd(), 'launcher.config.json'),
    path.join(app.getAppPath(), 'launcher.config.json'),
    path.join(__dirname, '../launcher.config.json'),
  ]

  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue
      const raw = fs.readFileSync(file, 'utf8')
      return JSON.parse(raw) as Partial<LauncherConfig>
    } catch {
      // try next
    }
  }

  return {}
}

export function getConfig(): LauncherConfig {
  const fileConfig = readJsonConfig()

  return {
    placeId:
      process.env.VITE_ROBLOX_PLACE_ID ||
      fileConfig.placeId ||
      defaults.placeId,
    discordClientId:
      process.env.VITE_DISCORD_CLIENT_ID ||
      fileConfig.discordClientId ||
      defaults.discordClientId,
    gameName: fileConfig.gameName || defaults.gameName,
    links: {
      ...defaultLinks,
      ...fileConfig.links,
    },
    updateFeedUrl: fileConfig.updateFeedUrl || defaults.updateFeedUrl,
    onlinePlayers:
      typeof fileConfig.onlinePlayers === 'number'
        ? fileConfig.onlinePlayers
        : defaults.onlinePlayers,
    playerApi: {
      baseUrl: fileConfig.playerApi?.baseUrl || defaults.playerApi.baseUrl,
      apiKey: fileConfig.playerApi?.apiKey || defaults.playerApi.apiKey,
    },
  }
}
