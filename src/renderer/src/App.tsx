import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerProvider, useTimer } from './context/TimerContext'
import CircularTimer from './components/CircularTimer'
import TaskChip from './components/TaskChip'
import InlineTaskPicker from './components/InlineTaskPicker'
import Toast from './components/Toast'
import TaskList from './components/TaskList'
import Settings from './components/Settings'
import Stats from './components/Stats'

// Main Focus Screen Component
function FocusScreen() {
  const { settings, tasks, updateTask, stats, updateStats } = useTimer()

  // Timer state from main process
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  // UI state
  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelView, setPanelView] = useState<'tasks' | 'stats' | 'settings'>('tasks')
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null)
  const [previousSession, setPreviousSession] = useState<{
    taskId: string | null
    timeLeft: number
    isRunning: boolean
  } | null>(null)

  // Get initial timer state
  useEffect(() => {
    window.api.timerGetState().then((state) => {
      if (state) {
        setTimeLeft(state.timeLeft)
        setIsRunning(state.isRunning)
        setIsBreak(state.isBreak)
        setCurrentTaskId(state.currentTaskId)
      }
    })
  }, [])

  // Listen to timer ticks
  useEffect(() => {
    const unsubscribe = window.api.onTimerTick((state) => {
      setTimeLeft(state.timeLeft)
      setIsRunning(state.isRunning)
      setIsBreak(state.isBreak)
    })

    return unsubscribe
  }, [])

  // Listen to timer completion
  useEffect(() => {
    const unsubscribe = window.api.onTimerComplete((data) => {
      if (!data.wasBreak) {
        updateStats({
          totalPomodoros: stats.totalPomodoros + 1,
          totalFocusTime: stats.totalFocusTime + settings.workDuration
        })

        if (currentTaskId) {
          const task = tasks.find((t) => t.id === currentTaskId)
          if (task) {
            const newPomodoros = task.pomodoros + 1
            updateTask(task.id, { pomodoros: newPomodoros })

            if (newPomodoros >= task.estimatedPomodoros) {
              updateTask(task.id, { completed: true })
              updateStats({ completedTasks: stats.completedTasks + 1 })
            }
          }
        }

        window.api.showNotification(
          'Pomodoro Complete!',
          `Great work! You've completed ${data.completedPomodoros} pomodoro(s).`
        )
      } else {
        updateStats({
          totalBreakTime:
            stats.totalBreakTime +
            (isBreak ? settings.shortBreakDuration : settings.longBreakDuration)
        })
        window.api.showNotification('Break Complete!', 'Time to focus again!')
      }
    })

    return unsubscribe
  }, [settings, stats, tasks, currentTaskId, isBreak, updateStats, updateTask])

  // Toggle timer
  const toggleTimer = useCallback(() => {
    if (isRunning) {
      window.api.timerPause()
    } else {
      window.api.timerStart()
    }
  }, [isRunning])

  // Reset timer
  const resetTimer = useCallback(() => {
    window.api.timerReset()
  }, [])

  // Handle task selection
  const handleSelectTask = useCallback(
    (taskId: string | null) => {
      // Save current session for undo
      if (isRunning) {
        setPreviousSession({
          taskId: currentTaskId,
          timeLeft,
          isRunning: true
        })

        // Pause current session
        window.api.timerPause()

        // Show toast with undo
        const previousTaskName = currentTaskId
          ? tasks.find((t) => t.id === currentTaskId)?.title || 'General Focus'
          : 'General Focus'
        const newTaskName = taskId
          ? tasks.find((t) => t.id === taskId)?.title || 'General Focus'
          : 'General Focus'

        setToast({
          message: `Paused ${previousTaskName} → Started ${newTaskName}`,
          onUndo: () => {
            setCurrentTaskId(previousSession?.taskId ?? null)
            if (previousSession?.isRunning) {
              window.api.timerStart()
            }
            setPreviousSession(null)
            setToast(null)
          }
        })
      }

      setCurrentTaskId(taskId)
      // TODO: Update timer manager with new task ID
    },
    [isRunning, currentTaskId, timeLeft, tasks, previousSession]
  )

  // Create new task
  const handleCreateTask = useCallback(
    (title: string, estimatedPomodoros: number) => {
      const newTask = {
        id: crypto.randomUUID(),
        title,
        pomodoros: 0,
        estimatedPomodoros,
        completed: false
      }

      const updatedTasks = [...tasks, newTask]
      window.api.saveTasks(updatedTasks)
      handleSelectTask(newTask.id)
    },
    [tasks, handleSelectTask]
  )

  const currentTask = currentTaskId ? tasks.find((t) => t.id === currentTaskId) : null
  const totalTime = isBreak ? settings.shortBreakDuration * 60 : settings.workDuration * 60

  // Get status message
  const getStatusMessage = () => {
    if (isBreak) {
      return `Break time · ${Math.ceil(timeLeft / 60)} min left`
    }
    if (currentTask) {
      return `${currentTask.pomodoros}/${currentTask.estimatedPomodoros} pomodoros · ${Math.ceil(timeLeft / 60)} min left`
    }
    return `Focus session · ${Math.ceil(timeLeft / 60)} min left`
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient - changes based on mode */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: isBreak ? 'var(--color-bg)' : 'var(--color-bg)'
        }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Top Bar */}
      <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-6">
        <TaskChip
          taskTitle={currentTask?.title ?? null}
          onClick={() => setIsTaskPickerOpen(true)}
        />

        <button
          onClick={() => setIsPanelOpen(true)}
          className="p-2 rounded-full bg-primary/10 backdrop-blur-sm hover:bg-primary/20 transition-colors border border-primary/20"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      {/* Main Timer Area */}
      <div className="flex flex-col items-center gap-8">
        <CircularTimer
          timeLeft={timeLeft}
          totalTime={totalTime}
          isBreak={isBreak}
          isRunning={isRunning}
        />

        {/* Status Line */}
        <motion.div
          className="text-primary/60 text-sm font-medium"
          animate={{ opacity: isRunning ? 1 : 0.4 }}
        >
          {getStatusMessage()}
        </motion.div>

        {/* Primary Action Button */}
        <div className="flex gap-4 items-center">
          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm hover:bg-primary/20 transition-colors border border-primary/20 flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            </svg>
          </motion.button>

          {/* Start/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className="px-12 py-4 rounded-full bg-primary text-neutral-100 font-semibold text-lg shadow-2xl transition-all"
          >
            {isRunning ? 'Pause' : 'Start'}
          </motion.button>

          <div className="">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                window.api.openMiniPlayer()
                setIsPanelOpen(false)
              }}
              className="size-12 rounded-full bg-primary/10 backdrop-blur-sm hover:bg-primary/20 transition-colors border border-primary/20 text-primary font-medium flex items-center justify-center gap-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Task Picker Overlay */}
      <InlineTaskPicker
        isOpen={isTaskPickerOpen}
        onClose={() => setIsTaskPickerOpen(false)}
        tasks={tasks}
        currentTaskId={currentTaskId}
        onSelectTask={handleSelectTask}
        onCreateTask={handleCreateTask}
      />

      {/* Slide-Up Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-primary/10 z-50 max-h-[90vh] h-full overflow-hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-primary/10">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPanelView('tasks')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      panelView === 'tasks'
                        ? 'bg-primary/20 text-primary'
                        : 'text-primary/60 hover:text-primary/80'
                    }`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setPanelView('stats')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      panelView === 'stats'
                        ? 'bg-primary/20 text-primary'
                        : 'text-primary/60 hover:text-primary/80'
                    }`}
                  >
                    Stats
                  </button>
                  <button
                    onClick={() => setPanelView('settings')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      panelView === 'settings'
                        ? 'bg-primary/20 text-primary'
                        : 'text-primary/60 hover:text-primary/80'
                    }`}
                  >
                    Settings
                  </button>
                </div>

                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className="overflow-y-auto h-full ">
                {panelView === 'tasks' && <TaskList />}
                {panelView === 'stats' && <Stats />}
                {panelView === 'settings' && <Settings />}
              </div>

              {/* Mini Player Button */}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toast
        isVisible={toast !== null}
        message={toast?.message ?? ''}
        onUndo={toast?.onUndo}
        onDismiss={() => setToast(null)}
      />
    </div>
  )
}

// App Wrapper
function App() {
  return (
    <TimerProvider>
      <FocusScreen />
    </TimerProvider>
  )
}

export default App
