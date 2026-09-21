import { useEffect, useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { Hero } from './components/Hero'
import { NewsPanel } from './components/NewsPanel'
import { SettingsModal } from './components/SettingsModal'
import { LaunchFx } from './components/LaunchFx'
import { playLaunchSound } from './lib/launchSound'
import type {
  LauncherLinks,
  UpdateStatus,
  UserSettings,
} from '../electron/types'
import './styles/app.css'

const hasDesktopApi = typeof window !== 'undefined' && !!window.regionrp

const defaultLinks: LauncherLinks = {
  discord: 'https://discord.gg/GhNc7TqsUe',
  website: 'https://discord.gg/GhNc7TqsUe',
  rules: 'https://discord.gg/GhNc7TqsUe',
}

const defaultSettings: UserSettings = {
  openAtLogin: false,
  minimizeToTray: true,
}

export default function App() {
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [onlinePlayers, setOnlinePlayers] = useState(0)
  const [links, setLinks] = useState<LauncherLinks>(defaultLinks)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [version, setVersion] = useState('1.0.0')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    status: 'idle',
  })

  useEffect(() => {
    if (!hasDesktopApi) return

    void window.regionrp.getConfig().then((config) => {
      setLinks(config.links)
      setOnlinePlayers(config.onlinePlayers)
    })
    void window.regionrp.getSettings().then(setSettings)
    void window.regionrp.getVersion().then(setVersion)

    const unsubscribe = window.regionrp.onUpdateStatus(setUpdateStatus)
    return unsubscribe
  }, [])

  async function handleLaunch() {
    setError(null)
    setLaunching(true)
    playLaunchSound()

    await new Promise((resolve) => window.setTimeout(resolve, 1100))

    try {
      if (!hasDesktopApi) {
        setError('Запусти лаунчер через Electron (npm run dev)')
        return
      }
      const result = await window.regionrp.launchRoblox()
      if (!result.ok) {
        setError(result.error)
      } else {
        const code = await window.regionrp.getJoinCode()
        setJoinCode(code)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запуска')
    } finally {
      setLaunching(false)
    }
  }

  async function handleSettingsChange(partial: Partial<UserSettings>) {
    if (!hasDesktopApi) {
      setSettings((prev) => ({ ...prev, ...partial }))
      return
    }
    const next = await window.regionrp.setSettings(partial)
    setSettings(next)
  }

  async function handleOpenLink(url: string) {
    if (hasDesktopApi) {
      await window.regionrp.openExternal(url)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden>
        <div className="atmosphere__sky" />
        <div className="atmosphere__glow atmosphere__glow--left" />
        <div className="atmosphere__glow atmosphere__glow--right" />
        <div className="atmosphere__road" />
        <div className="atmosphere__horizon" />
        <div className="atmosphere__grain" />
      </div>

      <div className="content">
        <TitleBar
          onMinimize={() => window.regionrp?.minimize()}
          onMaximize={() => window.regionrp?.maximize()}
          onClose={() => window.regionrp?.close()}
          onSettings={() => setSettingsOpen(true)}
        />
        <div className="main">
          <Hero
            launching={launching}
            error={error}
            onlinePlayers={onlinePlayers}
            links={links}
            joinCode={joinCode}
            onLaunch={handleLaunch}
            onOpenLink={handleOpenLink}
          />
          <NewsPanel />
        </div>
      </div>

      <LaunchFx active={launching} />

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        version={version}
        updateStatus={updateStatus}
        onClose={() => setSettingsOpen(false)}
        onChange={handleSettingsChange}
        onCheckUpdates={() => {
          void window.regionrp?.checkForUpdates()
        }}
        onInstallUpdate={() => {
          void window.regionrp?.installUpdate()
        }}
      />
    </div>
  )
}
