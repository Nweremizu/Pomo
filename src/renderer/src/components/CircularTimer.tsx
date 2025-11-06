import { motion } from 'framer-motion'

interface CircularTimerProps {
  timeLeft: number
  totalTime: number
  isBreak: boolean
  isRunning: boolean
}

const CircularTimer = ({ timeLeft, totalTime, isBreak, isRunning }: CircularTimerProps) => {
  const radius = 150
  const strokeWidth = 10
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const progress = totalTime > 0 ? timeLeft / totalTime : 1
  const strokeDashoffset = circumference - progress * circumference

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Color scheme based on mode
  const colors = {
    focus: {
      ring: 'var(--color-normal)',
      glow: 'var(--color-normal)',
      text: 'var(--color-normal)'
    },
    break: {
      ring: 'var(--color-success)',
      glow: 'var(--color-success)',
      text: 'var(--color-success)'
    }
  }

  const currentColors = isBreak ? colors.break : colors.focus

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect when running */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 60px ${currentColors.glow}`,
            filter: 'blur(20px)'
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* SVG Circle */}
      <svg height={radius * 2} width={radius * 2} className="relative z-10">
        {/* Background circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress circle */}
        <motion.circle
          stroke={currentColors.ring}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{
            strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            strokeLinecap: 'round'
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          animate={{
            strokeDashoffset
          }}
          transition={{
            duration: 0.5,
            ease: 'easeOut'
          }}
        />
      </svg>

      {/* Time display */}
      <motion.div
        className="absolute flex flex-col items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-7xl font-bold tracking-tight "
          style={{ color: currentColors.text }}
        >
          {formatTime(timeLeft)}
        </motion.div>

        {/* Mode indicator */}
        <motion.div
          className="mt-2 text-sm font-medium "
          style={{ color: currentColors.text }}
          animate={{
            opacity: isRunning ? 0.8 : 0.4
          }}
        >
          {isBreak ? 'Break Time' : 'Focus Mode'}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default CircularTimer
