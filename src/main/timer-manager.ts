/**
 * Timer Manager - Runs in Main Process
 *
 * Handles timer logic independently of renderer process.
 * This ensures the timer runs continuously even when:
 * - Window is minimized
 * - Window is hidden
 * - Tabs are switched
 * - Renderer process crashes
 */

import { BrowserWindow } from 'electron'
import type { TimerSettings } from '../shared/schemas'

export interface TimerState {
  timeLeft: number
  isRunning: boolean
  isBreak: boolean
  completedPomodoros: number
  currentTaskId: string | null
}

export class TimerManager {
  private state: TimerState
  private interval: NodeJS.Timeout | null = null
  private settings: TimerSettings
  private mainWindow: BrowserWindow | null = null
  private miniWindow: BrowserWindow | null = null

  constructor(settings: TimerSettings) {
    this.settings = settings
    this.state = {
      timeLeft: settings.workDuration * 60,
      isRunning: false,
      isBreak: false,
      completedPomodoros: 0,
      currentTaskId: null
    }
  }

  setWindows(mainWindow: BrowserWindow | null, miniWindow: BrowserWindow | null = null): void {
    this.mainWindow = mainWindow
    this.miniWindow = miniWindow
  }

  updateSettings(settings: TimerSettings): void {
    this.settings = settings
  }

  getState(): TimerState {
    return { ...this.state }
  }

  start(): void {
    if (this.state.isRunning) return

    this.state.isRunning = true
    console.log('[TimerManager] Starting timer, timeLeft:', this.state.timeLeft)
    this.broadcastState()

    // Use Node.js setInterval for reliable timing
    this.interval = setInterval(() => {
      this.tick()
    }, 1000)
  }

  pause(): void {
    this.state.isRunning = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.broadcastState()
  }

  reset(): void {
    console.log('[TimerManager] Resetting timer, isBreak:', this.state.isBreak)
    this.pause()

    // Always reset to work mode with a full reset
    this.state.isBreak = false
    this.state.timeLeft = this.settings.workDuration * 60
    this.state.completedPomodoros = 0
    this.state.currentTaskId = null

    console.log('[TimerManager] Reset to work mode, timeLeft:', this.state.timeLeft)
    this.broadcastState()
  }

  private tick(): void {
    if (!this.state.isRunning || this.state.timeLeft <= 0) return

    this.state.timeLeft--
    console.log('[TimerManager] Tick, timeLeft:', this.state.timeLeft)

    // Broadcast every second to keep UI in sync
    this.broadcastState()

    // Check if timer completed
    if (this.state.timeLeft <= 0) {
      this.handleCompletion()
    }
  }

  private handleCompletion(): void {
    this.pause()

    // Emit completion event to renderer
    this.broadcastEvent('timer:complete', {
      wasBreak: this.state.isBreak,
      completedPomodoros: this.state.completedPomodoros
    })

    if (!this.state.isBreak) {
      // Completed a work session
      this.state.completedPomodoros++

      // Determine next break type
      const isLongBreak = this.state.completedPomodoros % this.settings.longBreakInterval === 0

      this.state.isBreak = true
      this.state.timeLeft = isLongBreak
        ? this.settings.longBreakDuration * 60
        : this.settings.shortBreakDuration * 60

      // Auto-start break if enabled
      if (this.settings.autoStartBreaks) {
        this.start()
      }
    } else {
      // Completed a break session
      this.state.isBreak = false
      this.state.timeLeft = this.settings.workDuration * 60

      // Auto-start work if enabled
      if (this.settings.autoStartPomodoros) {
        this.start()
      }
    }

    this.broadcastState()
  }

  private broadcastState(): void {
    const state = this.getState()
    console.log('[TimerManager] Broadcasting state:', state)

    // Send to main window
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('timer:tick', state)
    }

    // Send to mini window
    if (this.miniWindow && !this.miniWindow.isDestroyed()) {
      this.miniWindow.webContents.send('timer:tick', state)
    }
  }

  private broadcastEvent(channel: string, data: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }

    if (this.miniWindow && !this.miniWindow.isDestroyed()) {
      this.miniWindow.webContents.send(channel, data)
    }
  }

  destroy(): void {
    this.pause()
  }
}
