import { TimerSettings, TimerStats, Task } from '../context/TimerContext'

declare global {
  interface Window {
    api: {
      getSettings: () => Promise<TimerSettings>
      saveSettings: (settings: TimerSettings) => Promise<boolean>
      getStats: () => Promise<TimerStats>
      saveStats: (stats: TimerStats) => Promise<boolean>
      getTasks: () => Promise<Task[]>
      saveTasks: (tasks: Task[]) => Promise<boolean>
    }
  }
}

export {} // This makes the file a module
