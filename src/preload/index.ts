import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../shared/ipc-types'
import { IPC_CHANNELS } from '../shared/ipc-types'
import type { Task, TimerSettings, TimerStats, TimerState } from '../shared/schemas'

// Custom electronAPI to replace @electron-toolkit/preload (not compatible with sandbox)
const electronAPI = {
  process: {
    platform: process.platform,
    versions: process.versions
  }
}

const api: ElectronAPI = {
  // Settings
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings: TimerSettings) =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),

  // Stats
  getStats: () => ipcRenderer.invoke(IPC_CHANNELS.GET_STATS),
  saveStats: (stats: TimerStats) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_STATS, stats),
  resetStats: () => ipcRenderer.invoke(IPC_CHANNELS.RESET_STATS),

  // Tasks
  getTasks: () => ipcRenderer.invoke(IPC_CHANNELS.GET_TASKS),
  saveTasks: (tasks: Task[]) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_TASKS, tasks),

  // Timer state
  getTimerState: () => ipcRenderer.invoke(IPC_CHANNELS.GET_TIMER_STATE),
  saveTimerState: (state: TimerState) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_TIMER_STATE, state),

  // Timer controls (main process timer)
  timerStart: () => ipcRenderer.invoke(IPC_CHANNELS.TIMER_START),
  timerPause: () => ipcRenderer.invoke(IPC_CHANNELS.TIMER_PAUSE),
  timerReset: () => ipcRenderer.invoke(IPC_CHANNELS.TIMER_RESET),
  timerGetState: () => ipcRenderer.invoke(IPC_CHANNELS.TIMER_GET_STATE),

  // Timer event listeners
  onTimerTick: (callback) => {
    const subscription = (_event: unknown, state: unknown) =>
      callback(state as Parameters<typeof callback>[0])
    ipcRenderer.on(IPC_CHANNELS.TIMER_TICK, subscription)
    // Return cleanup function
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_TICK, subscription)
  },

  onTimerComplete: (callback) => {
    const subscription = (_event: unknown, data: unknown) =>
      callback(data as Parameters<typeof callback>[0])
    ipcRenderer.on(IPC_CHANNELS.TIMER_COMPLETE, subscription)
    // Return cleanup function
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TIMER_COMPLETE, subscription)
  },

  // Window controls
  minimizeToTray: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_TO_TRAY),
  showWindow: () => ipcRenderer.invoke(IPC_CHANNELS.SHOW_WINDOW),
  openMiniPlayer: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_MINI_PLAYER),
  closeMiniPlayer: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_MINI_PLAYER),

  // Notifications
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHOW_NOTIFICATION, title, body)
}

// Always use contextBridge since we have contextIsolation: true
try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
  console.log('[PRELOAD] API exposed successfully to renderer')
  console.log('[PRELOAD] Available API methods:', Object.keys(api))
} catch (error) {
  console.error('[PRELOAD] Failed to expose API:', error)
}
