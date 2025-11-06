import type { Task, TimerSettings, TimerStats, TimerState } from './schemas'

// IPC channel names
export const IPC_CHANNELS = {
  // Settings
  GET_SETTINGS: 'settings:get',
  SAVE_SETTINGS: 'settings:save',

  // Stats
  GET_STATS: 'stats:get',
  SAVE_STATS: 'stats:save',
  RESET_STATS: 'stats:reset',

  // Tasks
  GET_TASKS: 'tasks:get',
  SAVE_TASKS: 'tasks:save',

  // Timer state
  GET_TIMER_STATE: 'timer-state:get',
  SAVE_TIMER_STATE: 'timer-state:save',

  // Timer controls (main process timer)
  TIMER_START: 'timer:start',
  TIMER_PAUSE: 'timer:pause',
  TIMER_RESET: 'timer:reset',
  TIMER_GET_STATE: 'timer:get-state',

  // Window controls
  MINIMIZE_TO_TRAY: 'window:minimize-to-tray',
  SHOW_WINDOW: 'window:show',
  OPEN_MINI_PLAYER: 'window:open-mini-player',
  CLOSE_MINI_PLAYER: 'window:close-mini-player',

  // Notifications
  SHOW_NOTIFICATION: 'notification:show',

  // Timer events (main -> renderer)
  TIMER_TICK: 'timer:tick',
  TIMER_COMPLETE: 'timer:complete'
} as const

// API interface exposed to renderer
export interface ElectronAPI {
  // Settings
  getSettings: () => Promise<TimerSettings>
  saveSettings: (settings: TimerSettings) => Promise<void>

  // Stats
  getStats: () => Promise<TimerStats>
  saveStats: (stats: TimerStats) => Promise<void>
  resetStats: () => Promise<void>

  // Tasks
  getTasks: () => Promise<Task[]>
  saveTasks: (tasks: Task[]) => Promise<void>

  // Timer state
  getTimerState: () => Promise<TimerState>
  saveTimerState: (state: TimerState) => Promise<void>

  // Timer controls (main process timer)
  timerStart: () => Promise<void>
  timerPause: () => Promise<void>
  timerReset: () => Promise<void>
  timerGetState: () => Promise<{
    timeLeft: number
    isRunning: boolean
    isBreak: boolean
    completedPomodoros: number
    currentTaskId: string | null
  }>

  // Timer event listeners
  onTimerTick: (
    callback: (state: {
      timeLeft: number
      isRunning: boolean
      isBreak: boolean
      completedPomodoros: number
      currentTaskId: string | null
    }) => void
  ) => () => void

  onTimerComplete: (
    callback: (data: { wasBreak: boolean; completedPomodoros: number }) => void
  ) => () => void

  // Window controls
  minimizeToTray: () => Promise<void>
  showWindow: () => Promise<void>
  openMiniPlayer: () => Promise<void>
  closeMiniPlayer: () => Promise<void>

  // Notifications
  showNotification: (title: string, body: string) => Promise<void>
}
