import { z } from 'zod'

// Task schema with validation
export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  completed: z.boolean(),
  pomodoros: z.number().int().min(0),
  estimatedPomodoros: z.number().int().min(1).max(20)
})

export const tasksArraySchema = z.array(taskSchema)

// Timer settings schema with validation
export const timerSettingsSchema = z.object({
  workDuration: z.number().int().min(1).max(120),
  shortBreakDuration: z.number().int().min(1).max(60),
  longBreakDuration: z.number().int().min(1).max(120),
  longBreakInterval: z.number().int().min(2).max(10),
  autoStartBreaks: z.boolean(),
  autoStartPomodoros: z.boolean(),
  soundEnabled: z.boolean()
})

// Timer stats schema with validation
export const timerStatsSchema = z.object({
  totalPomodoros: z.number().int().min(0),
  totalFocusTime: z.number().int().min(0),
  totalBreakTime: z.number().int().min(0),
  completedTasks: z.number().int().min(0),
  lastResetDate: z.string().datetime().optional()
})

// Timer state for persistence
export const timerStateSchema = z.object({
  timeLeft: z.number().int().min(0),
  isRunning: z.boolean(),
  isBreak: z.boolean(),
  completedPomodoros: z.number().int().min(0),
  currentTaskId: z.string().uuid().nullable()
})

// Type exports
export type Task = z.infer<typeof taskSchema>
export type TimerSettings = z.infer<typeof timerSettingsSchema>
export type TimerStats = z.infer<typeof timerStatsSchema>
export type TimerState = z.infer<typeof timerStateSchema>

// Default values
export const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true
}

export const DEFAULT_STATS: TimerStats = {
  totalPomodoros: 0,
  totalFocusTime: 0,
  totalBreakTime: 0,
  completedTasks: 0,
  lastResetDate: new Date().toISOString()
}

export const DEFAULT_TIMER_STATE: TimerState = {
  timeLeft: 0,
  isRunning: false,
  isBreak: false,
  completedPomodoros: 0,
  currentTaskId: null
}
