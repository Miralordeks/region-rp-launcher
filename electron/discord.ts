import RPC from 'discord-rpc'

/** Ключ ассета в Discord Developer Portal → Rich Presence → Art Assets */
export const DISCORD_LOGO_ASSET_KEY = 'logo'

let client: RPC.Client | null = null
let connected = false

type OnServerPresence = {
  playerName?: string
  rank?: string
}

export async function setInLauncherPresence(gameName: string): Promise<void> {
  if (!client || !connected) return
  try {
    await client.setActivity({
      details: gameName || 'Регион РП',
      state: 'В лаунчере',
      largeImageKey: DISCORD_LOGO_ASSET_KEY,
      largeImageText: 'Region RP',
      startTimestamp: Date.now(),
    })
  } catch (error) {
    console.warn('[Discord] Не удалось установить активность', error)
  }
}

export async function setOnServerPresence(presence: OnServerPresence): Promise<void> {
  if (!client || !connected) return
  const playerLine = [presence.playerName, presence.rank]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' | ')
  try {
    await client.setActivity({
      details: 'На сервере ·',
      state: playerLine || 'На сервере',
      largeImageKey: DISCORD_LOGO_ASSET_KEY,
      largeImageText: 'Region RP',
      startTimestamp: Date.now(),
    })
  } catch (error) {
    console.warn('[Discord] Не удалось установить активность', error)
  }
}

export async function startDiscordPresence(
  clientId: string,
  gameName: string = 'Регион РП',
): Promise<void> {
  if (!clientId || clientId === '0' || clientId === 'YOUR_DISCORD_CLIENT_ID') {
    console.info(
      '[Discord] Client ID не задан — Rich Presence отключён. Укажи discordClientId в launcher.config.json',
    )
    return
  }

  try {
    client = new RPC.Client({ transport: 'ipc' })

    client.on('ready', async () => {
      connected = true
      await setInLauncherPresence(gameName)
      console.info('[Discord] Rich Presence активен: играет в Регион РП')
    })

    client.on('disconnected', () => {
      connected = false
    })

    await client.login({ clientId })
  } catch (error) {
    connected = false
    console.warn(
      '[Discord] Не удалось подключиться (Discord закрыт?). Presence будет недоступен.',
      error,
    )
  }
}

export function stopDiscordPresence(): void {
  if (!client) return
  try {
    if (connected) {
      void client.clearActivity().catch(() => undefined)
    }
    client.destroy()
  } catch {
    // ignore
  } finally {
    client = null
    connected = false
  }
}
