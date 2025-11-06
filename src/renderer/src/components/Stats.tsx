import { motion } from 'framer-motion'
import { useTimer } from '../context/TimerContext'

export default function Stats() {
  const { stats } = useTimer()

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const statCards = [
    {
      label: 'Total Pomodoros',
      value: stats.totalPomodoros,
      icon: '🎯'
    },
    {
      label: 'Focus Time',
      value: formatTime(stats.totalFocusTime),
      icon: '⏱️'
    },
    {
      label: 'Break Time',
      value: formatTime(stats.totalBreakTime),
      icon: '☕'
    },
    {
      label: 'Tasks Completed',
      value: stats.completedTasks,
      icon: '✅'
    }
  ]

  return (
    <div className="w-full space-y-4 h-full flex flex-col p-2">
      <div className="grid grid-cols-2 gap-3 pb-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl bg-primary/5 p-4 border border-primary/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{stat.icon}</span>
              <h3 className="text-xs text-primary/50">{stat.label}</h3>
            </div>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Last Reset Info */}
      {stats.lastResetDate && (
        <div className="pt-4 border-t border-primary/10">
          <p className="text-xs text-primary/40 text-center">
            Stats since {new Date(stats.lastResetDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}
