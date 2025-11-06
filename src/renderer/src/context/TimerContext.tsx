import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo
} from 'react'
import type { Task, TimerSettings, TimerStats } from '../../../shared/schemas'

interface TimerContextType {
  tasks: Task[]
  settings: TimerSettings
  stats: TimerStats
  addTask: (title: string, estimatedPomodoros: number) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  updateSettings: (updates: Partial<TimerSettings>) => void
  updateStats: (updates: Partial<TimerStats>) => void
  resetStats: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [settings, setSettings] = useState<TimerSettings | null>(null)
  const [stats, setStats] = useState<TimerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Debug: Check if window.api is available
  useEffect(() => {
    console.log('[RENDERER] window.api available:', !!window.api)
    console.log(
      '[RENDERER] window.api methods:',
      window.api ? Object.keys(window.api) : 'undefined'
    )
  }, [])

  // Load data from persistent storage
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!window.api) {
          throw new Error('window.api is not defined. Preload script may not have loaded.')
        }

        const [savedSettings, savedStats, savedTasks] = await Promise.all([
          window.api.getSettings(),
          window.api.getStats(),
          window.api.getTasks()
        ])

        setSettings(savedSettings)
        setStats(savedStats)
        setTasks(savedTasks)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Save data to persistent storage whenever it changes
  useEffect(() => {
    if (!isLoading && settings) {
      window.api.saveSettings(settings).catch(console.error)
    }
  }, [settings, isLoading])

  useEffect(() => {
    if (!isLoading && stats) {
      window.api.saveStats(stats).catch(console.error)
    }
  }, [stats, isLoading])

  useEffect(() => {
    if (!isLoading) {
      window.api.saveTasks(tasks).catch(console.error)
    }
  }, [tasks, isLoading])

  const addTask = useCallback((title: string, estimatedPomodoros: number) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
        pomodoros: 0,
        estimatedPomodoros
      }
    ])
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const updateSettings = useCallback((updates: Partial<TimerSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  const updateStats = useCallback((updates: Partial<TimerStats>) => {
    setStats((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  const resetStats = useCallback(() => {
    window.api
      .resetStats()
      .then(() => {
        window.api.getStats().then(setStats).catch(console.error)
      })
      .catch(console.error)
  }, [])

  const contextValue = useMemo(
    () => ({
      tasks,
      settings: settings!,
      stats: stats!,
      addTask,
      updateTask,
      deleteTask,
      updateSettings,
      updateStats,
      resetStats
    }),
    [
      tasks,
      settings,
      stats,
      addTask,
      updateTask,
      deleteTask,
      updateSettings,
      updateStats,
      resetStats
    ]
  )

  if (isLoading || !settings || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/80">Loading...</div>
      </div>
    )
  }

  return <TimerContext.Provider value={contextValue}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
