import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerProvider, useTimer } from '../context/TimerContext'

function MiniPlayerContent() {
  const { settings, tasks } = useTimer()

  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTaskSwitcher, setShowTaskSwitcher] = useState(false)

  // Override body background for transparent mini player
  useEffect(() => {
    document.body.style.background = 'transparent'
    document.body.style.filter = 'none'
    const root = document.getElementById('root')
    if (root) {
      root.style.margin = '0'
    }
    return () => {
      document.body.style.background = ''
      document.body.style.filter = ''
    }
  }, [])

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

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      window.api.timerPause()
    } else {
      window.api.timerStart()
    }
  }, [isRunning])

  // const closeMiniPlayer = useCallback(() => {
  //   window.api.closeMiniPlayer()
  // }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTaskSelect = (taskId: string | null) => {
    setCurrentTaskId(taskId)
    setShowTaskSwitcher(false)
    // TODO: Update timer manager with new task ID
  }

  const openMainApp = () => {
    window.api.closeMiniPlayer()
  }

  const currentTask = currentTaskId ? tasks.find((t) => t.id === currentTaskId) : null
  const totalTime = isBreak ? settings.shortBreakDuration * 60 : settings.workDuration * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  // Responsive sizing based on container
  const [windowSize, setWindowSize] = useState({ width: 280, height: 200 })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    handleResize() // Initial size
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive calculations
  const isCompact = windowSize.width < 250 || windowSize.height < 190
  const timerSize = isCompact ? 70 : Math.min(100, windowSize.width * 0.35)
  const timerRadius = (timerSize / 2) * 0.9
  const circumference = 2 * Math.PI * timerRadius
  const strokeDashoffset = circumference - (circumference * progress) / 100
  const strokeWidth = isCompact ? 4 : 6
  const fontSize = isCompact ? 'text-base' : 'text-xl'
  const buttonSize = isCompact ? 'w-6 h-6' : 'w-7 h-7'
  const iconSize = isCompact ? 11 : 14

  // Compact State (Default)
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent">
      {/* Background gradient - with rounded corners */}

      {/* Draggable Area */}
      <div
        className="absolute inset-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
        whileTap={{ scale: 0.9 }}
        onClick={openMainApp}
        className={`${buttonSize} absolute top-2 right-2 z-50 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors border border-primary/20`}
        title="Open full app"
        style={
          {
            WebkitAppRegion: 'no-drag',
            maxWidth: `${windowSize.width - 32}px`
          } as React.CSSProperties
        }
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </motion.button>

      {/* Compact Layout - Intelligent Companion - Responsive */}
      <div className="relative h-full flex flex-col  items-center justify-center px-4 py-3 gap-2">
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl shadow-2xl border border-primary/50"
          animate={{
            background: isBreak ? 'var(--color-bg)' : 'var(--color-bg)'
          }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
        {/* Timer Ring - Tap to pause/resume - Responsive */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className="relative focus:outline-none flex-shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <svg width={timerSize} height={timerSize} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={timerSize / 2}
              cy={timerSize / 2}
              r={timerRadius}
              stroke={`${isBreak ? 'var(--color-success)' : 'var(--color-normal)'}`}
              strokeOpacity={0.4}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress ring */}
            <motion.circle
              cx={timerSize / 2}
              cy={timerSize / 2}
              r={timerRadius}
              stroke={`${isBreak ? 'var(--color-success)' : 'var(--color-normal)'}`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={`${isBreak ? 'text-success' : 'text-normal'} font-bold ${fontSize} tabular-nums`}
            >
              {formatTime(timeLeft)}
            </div>
            {isRunning && !isCompact && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className={`${isBreak ? 'text-success' : 'text-normal'} text-[9px] mt-0.5`}
              >
                tap to pause
              </motion.div>
            )}
          </div>
        </motion.button>

        {/* Task Tag - Tap to switch - Responsive */}
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowTaskSwitcher(!showTaskSwitcher)}
          className={`px-3 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary ${isCompact ? 'text-xs' : 'text-sm'} font-medium truncate transition-colors flex-shrink-0`}
          style={
            {
              WebkitAppRegion: 'no-drag',
              maxWidth: `${windowSize.width - 32}px`
            } as React.CSSProperties
          }
        >
          {currentTask ? `🎯 ${currentTask.title}` : isBreak ? '☕ Break' : '💭 General Focus'}
        </motion.button>

        {/* Overflow Menu - Responsive */}
        <div
          className="flex items-center gap-1.5 flex-shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {!isBreak && (
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.api.timerReset()}
              className={`${buttonSize} rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors border border-primary/20`}
              title="Reset timer"
            >
              <svg
                width={iconSize - 1}
                height={iconSize - 1}
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`${buttonSize} rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20`}
            title="More options"
          >
            <svg width="4" height={iconSize} viewBox="0 0 4 14" fill="var(--color-primary)">
              <circle cx="2" cy="2" r="2" />
              <circle cx="2" cy="7" r="2" />
              <circle cx="2" cy="12" r="2" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Task Switcher Overlay */}
      <AnimatePresence>
        {showTaskSwitcher && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-4 top-4 bg-black/80 backdrop-blur-xl rounded-2xl p-3 border border-white/20 max-h-[120px] overflow-y-auto"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <div className="space-y-1">
              <button
                onClick={() => handleTaskSelect(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !currentTaskId
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                💭 General Focus
              </button>
              {tasks
                .filter((t) => !t.completed)
                .slice(0, 3)
                .map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                      currentTaskId === task.id
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    🎯 {task.title}
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-12 right-4 bg-black/90 backdrop-blur-xl rounded-xl p-2 border border-white/20 min-w-[140px]"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <button
              onClick={openMainApp}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Open Full App
            </button>
            {isBreak && (
              <button
                onClick={() => window.api.timerReset()}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                Skip Break
              </button>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MiniPlayer = () => {
  return (
    <TimerProvider>
      <MiniPlayerContent />
    </TimerProvider>
  )
}

export default MiniPlayer
