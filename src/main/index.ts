import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerRoute } from '../lib/electron-router-dom'
import path from 'node:path'
import {
  timerSettingsSchema,
  timerStatsSchema,
  tasksArraySchema,
  timerStateSchema
} from '../shared/schemas'
import { IPC_CHANNELS } from '../shared/ipc-types'
import { initStore, getStore } from './store'
import { TimerManager } from './timer-manager'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let miniWindow: BrowserWindow | null = null
let isQuitting = false
let timerManager: TimerManager | null = null

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // Another instance is already running
  app.quit()
} else {
  // Handle second instance attempt
  app.on('second-instance', () => {
    // Show existing window when user tries to open another instance
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    } else if (miniWindow) {
      if (miniWindow.isMinimized()) miniWindow.restore()
      miniWindow.show()
      miniWindow.focus()
    }
  })
}

// Register IPC handlers with validation
function registerIPCHandlers(): void {
  const appStore = getStore()

  // Settings handlers
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return timerSettingsSchema.parse(appStore.get('settings'))
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_, settings: unknown) => {
    const validated = timerSettingsSchema.parse(settings)
    appStore.set('settings', validated)
    // Update timer manager with new settings
    timerManager?.updateSettings(validated)
  })

  // Stats handlers
  ipcMain.handle(IPC_CHANNELS.GET_STATS, () => {
    return timerStatsSchema.parse(appStore.get('stats'))
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_STATS, (_, stats: unknown) => {
    const validated = timerStatsSchema.parse(stats)
    appStore.set('stats', validated)
  })

  ipcMain.handle(IPC_CHANNELS.RESET_STATS, () => {
    appStore.set('stats', {
      totalPomodoros: 0,
      totalFocusTime: 0,
      totalBreakTime: 0,
      completedTasks: 0,
      lastResetDate: new Date().toISOString()
    })
  })

  // Tasks handlers
  ipcMain.handle(IPC_CHANNELS.GET_TASKS, () => {
    return tasksArraySchema.parse(appStore.get('tasks'))
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_TASKS, (_, tasks: unknown) => {
    const validated = tasksArraySchema.parse(tasks)
    appStore.set('tasks', validated)
  })

  // Timer state handlers
  ipcMain.handle(IPC_CHANNELS.GET_TIMER_STATE, () => {
    return timerStateSchema.parse(appStore.get('timerState'))
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_TIMER_STATE, (_, state: unknown) => {
    const validated = timerStateSchema.parse(state)
    appStore.set('timerState', validated)
  })

  // Window control handlers
  ipcMain.handle(IPC_CHANNELS.MINIMIZE_TO_TRAY, () => {
    if (mainWindow) {
      mainWindow.hide()
    }
  })

  ipcMain.handle(IPC_CHANNELS.SHOW_WINDOW, () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // Notification handler
  ipcMain.handle(IPC_CHANNELS.SHOW_NOTIFICATION, (_, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: nativeImage.createFromPath(icon)
      }).show()
    }
  })

  // Timer control handlers
  ipcMain.handle(IPC_CHANNELS.TIMER_START, () => {
    timerManager?.start()
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_PAUSE, () => {
    timerManager?.pause()
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_RESET, () => {
    timerManager?.reset()
  })

  ipcMain.handle(IPC_CHANNELS.TIMER_GET_STATE, () => {
    return timerManager?.getState() ?? null
  })

  // Mini player window handlers
  ipcMain.handle(IPC_CHANNELS.OPEN_MINI_PLAYER, () => {
    createMiniWindow()
    // Hide main window when mini player opens
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide()
    }
  })

  ipcMain.handle(IPC_CHANNELS.CLOSE_MINI_PLAYER, () => {
    if (miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.close()
      miniWindow = null
      timerManager?.setWindows(mainWindow, null)
    }
    // Show main window when mini player closes
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(icon).resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('Pomo - Pomodoro Timer')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 750,
    minHeight: 740,
    minWidth: 400,
    maxHeight: 800,
    maxWidth: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  registerRoute({
    id: 'main',
    browserWindow: mainWindow,
    devServerUrl: process.env['ELECTRON_RENDERER_URL'],
    htmlFile: path.join(__dirname, '../renderer/index.html')
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // Update timer manager with main window reference
  if (timerManager) {
    timerManager.setWindows(mainWindow, miniWindow)
  }
}

function createMiniWindow(): void {
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.show()
    miniWindow.focus()
    return
  }

  miniWindow = new BrowserWindow({
    width: 280,
    height: 200,
    minWidth: 220,
    minHeight: 180,
    maxWidth: 400,
    maxHeight: 300,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    skipTaskbar: false,
    resizable: true,
    roundedCorners: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Load mini player route (we'll create this later)
  registerRoute({
    id: 'mini',
    browserWindow: miniWindow,
    devServerUrl: process.env['ELECTRON_RENDERER_URL']
      ? `${process.env['ELECTRON_RENDERER_URL']}#/mini`
      : undefined,
    htmlFile: path.join(__dirname, '../renderer/index.html')
  })

  miniWindow.on('ready-to-show', () => {
    miniWindow?.show()
  })

  miniWindow.on('closed', () => {
    miniWindow = null
    timerManager?.setWindows(mainWindow, null)
  })

  // Update timer manager
  if (timerManager) {
    timerManager.setWindows(mainWindow, miniWindow)
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.pomo')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize store before registering IPC handlers
  await initStore()

  // Initialize timer manager with settings from store
  const appStore = getStore()
  const settings = timerSettingsSchema.parse(appStore.get('settings'))
  timerManager = new TimerManager(settings)

  registerIPCHandlers()
  createWindow()
  createTray()

  // Update timer manager with window reference
  if (timerManager && mainWindow) {
    timerManager.setWindows(mainWindow, null)
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  isQuitting = true
  // Clean up timer manager
  timerManager?.destroy()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
