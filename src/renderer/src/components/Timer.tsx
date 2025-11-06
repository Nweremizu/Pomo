import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react'
import { motion } from 'framer-motion'
import { useTimer } from '../context/TimerContext'
import { BackIcon, CoffeeIcon, FocusIcon, SettingsIcon } from '../components/icon'
import { Tab } from '@renderer/types'

const Timer = ({ setActiveTab }: { setActiveTab: Dispatch<SetStateAction<Tab>> }) => {
  const { settings, stats, updateStats, tasks, updateTask } = useTimer()

  // Timer state comes from main process now
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/notification.mp3')
    audioRef.current.load()
  }, [])

  // Get initial timer state from main process
  useEffect(() => {
    window.api.timerGetState().then((state) => {
      if (state) {
        setTimeLeft(state.timeLeft)
        setIsRunning(state.isRunning)
        setIsBreak(state.isBreak)
      }
    })
  }, [])

  // Listen to timer ticks from main process
  useEffect(() => {
    console.log('[Timer] Setting up timer tick listener')
    const unsubscribe = window.api.onTimerTick((state) => {
      console.log('[Timer] Received tick:', state)
      setTimeLeft(state.timeLeft)
      setIsRunning(state.isRunning)
      setIsBreak(state.isBreak)
    })

    return () => {
      console.log('[Timer] Cleaning up timer tick listener')
      unsubscribe()
    }
  }, [])

  // Play notification sound
  const playNotification = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [settings.soundEnabled])

  // Listen to timer completion events from main process
  useEffect(() => {
    const unsubscribe = window.api.onTimerComplete((data) => {
      // Play notification sound
      playNotification()

      if (!data.wasBreak) {
        // Update stats for completed pomodoro
        updateStats({
          totalPomodoros: stats.totalPomodoros + 1,
          totalFocusTime: stats.totalFocusTime + settings.workDuration
        })

        // Update current task if exists
        if (tasks.length > 0) {
          const currentTask = tasks[currentTaskIndex]
          const newPomodoros = currentTask.pomodoros + 1
          updateTask(currentTask.id, { pomodoros: newPomodoros })

          // Move to next task if current is completed
          if (newPomodoros >= currentTask.estimatedPomodoros) {
            updateTask(currentTask.id, { completed: true })
            updateStats({ completedTasks: stats.completedTasks + 1 })
            setCurrentTaskIndex((prev) => (prev + 1) % tasks.length)
          }
        }

        // Show desktop notification
        window.api.showNotification(
          'Pomodoro Complete!',
          `Great work! You've completed ${data.completedPomodoros} pomodoro(s).`
        )
      } else {
        // Update break time stats
        updateStats({
          totalBreakTime:
            stats.totalBreakTime +
            (isBreak ? settings.shortBreakDuration : settings.longBreakDuration)
        })

        // Show desktop notification
        window.api.showNotification('Break Complete!', 'Time to focus again!')
      }
    })

    return unsubscribe
  }, [settings, stats, tasks, currentTaskIndex, isBreak, updateStats, updateTask, playNotification])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Timer controls now use main process
  const toggleTimer = useCallback(() => {
    if (isRunning) {
      window.api.timerPause()
    } else {
      window.api.timerStart()
    }
  }, [isRunning])

  const resetTimer = useCallback(() => {
    window.api.timerReset()
  }, [])

  const goToSettings = useCallback(() => {
    setActiveTab('settings')
  }, [setActiveTab])

  const openMiniPlayer = useCallback(() => {
    window.api.openMiniPlayer()
  }, [])

  return (
    <div className="relative  w-full overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8 w-full max-w-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-8 rounded-2xl bg-black/50 p-12 backdrop-blur-2xl w-lg "
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-medium text-white/80 tracking-tight mb-2"
          >
            {isBreak ? (
              <CoffeeIcon size={24} className="text-white" />
            ) : (
              <FocusIcon size={24} className="text-white" />
            )}
          </motion.div>

          {tasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-light text-white/60 tracking-wide"
            >
              Current Task: {tasks[currentTaskIndex]?.title}
            </motion.div>
          )}

          <motion.div
            key={timeLeft}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-8xl font-bold text-white tracking-tighter my-2 mx-2"
          >
            {formatTime(timeLeft)}
          </motion.div>

          <div className="flex gap-4 w-full justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="rounded-full  px-3 py-3 text-white  transition-colors bg-transparent hover:bg-white/30 font-medium tracking-wide border border-black/10"
            >
              <BackIcon size={24} className="text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className="rounded-full bg-black/40 px-6 py-2 text-white  transition-colors hover:bg-white/30 font-medium tracking-wide"
            >
              {isRunning ? 'Pause' : 'Start'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToSettings}
              className="rounded-full  px-3 py-3 text-white  transition-colors bg-transparent hover:bg-white/30 font-medium tracking-wide border border-black/10"
            >
              <SettingsIcon size={24} className="text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openMiniPlayer}
              className="rounded-full  px-3 py-3 text-white  transition-colors bg-transparent hover:bg-white/30 font-medium tracking-wide border border-black/10"
              title="Open Mini Player"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </motion.button>
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={switchMode}
              className="rounded-full bg-white/20 px-6 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30 font-medium tracking-wide"
            >
              {isBreak ? 'Switch to Work' : 'Switch to Break'}
            </motion.button> */}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Timer
