import { contextBridge, ipcRenderer } from 'electron'
import type {
  LaunchResult,
  LauncherConfig,
  UpdateStatus,
  UserSettings,
} from './types'

const api = {
  minimize: () => ipcRenderer.invoke('window:minimize') as Promise<void>,
  maximize: () => ipcRenderer.invoke('window:maximize') as Promise<void>,
  close: () => ipcRenderer.invoke('window:close') as Promise<void>,
  show: () => ipcRenderer.invoke('window:show') as Promise<void>,
  launchRoblox: () =>
    ipcRenderer.invoke('roblox:launch') as Promise<LaunchResult>,
  getConfig: () =>
    ipcRenderer.invoke('config:get') as Promise<LauncherConfig>,
  getJoinCode: () =>
    ipcRenderer.invoke('session:get-code') as Promise<string>,
  getSettings: () =>
    ipcRenderer.invoke('settings:get') as Promise<UserSettings>,
  setSettings: (partial: Partial<UserSettings>) =>
    ipcRenderer.invoke('settings:set', partial) as Promise<UserSettings>,
  openExternal: (url: string) =>
    ipcRenderer.invoke('shell:open-external', url) as Promise<void>,
  checkForUpdates: () =>
    ipcRenderer.invoke('updater:check') as Promise<UpdateStatus>,
  installUpdate: () =>
    ipcRenderer.invoke('updater:install') as Promise<void>,
  getVersion: () =>
    ipcRenderer.invoke('app:get-version') as Promise<string>,
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, status: UpdateStatus) => {
      callback(status)
    }
    ipcRenderer.on('updater:status', listener)
    return () => {
      ipcRenderer.removeListener('updater:status', listener)
    }
  },
}

contextBridge.exposeInMainWorld('regionrp', api)

export type RegionRpApi = typeof api
