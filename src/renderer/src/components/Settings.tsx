import { motion } from 'framer-motion'
import { useTimer } from '../context/TimerContext'

export default function Settings() {
  const { settings, updateSettings } = useTimer()

  const handleChange = (key: keyof typeof settings, value: number | boolean) => {
    updateSettings({ [key]: value })
  }

  return (
    <div className="w-full h-[75%] overflow-y-scroll">
      {/* Duration Settings */}
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-primary/60 uppercase tracking-wider">Duration</h3>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-primary/50 mb-2">Work Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.workDuration}
              onChange={(e) =>
                handleChange(
                  'workDuration',
                  Math.max(1, Math.min(60, parseInt(e.target.value) || 25))
                )
              }
              className="w-full rounded-lg bg-primary/5 px-3 py-2 text-primary  focus:outline-none focus:ring-2 focus:ring-primary/20 border border-primary/10 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-primary/50 mb-2">Short Break (minutes)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.shortBreakDuration}
              onChange={(e) =>
                handleChange(
                  'shortBreakDuration',
                  Math.max(1, Math.min(30, parseInt(e.target.value) || 5))
                )
              }
              className="w-full rounded-lg bg-primary/5 px-3 py-2 text-primary  focus:outline-none focus:ring-2 focus:ring-primary/20 border border-primary/10 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-primary/50 mb-2">Long Break (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) =>
                handleChange(
                  'longBreakDuration',
                  Math.max(1, Math.min(60, parseInt(e.target.value) || 15))
                )
              }
              className="w-full rounded-lg bg-primary/5 px-3 py-2 text-primary  focus:outline-none focus:ring-2 focus:ring-primary/20 border border-primary/10 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-primary/50 mb-2">
              Long Break Interval (pomodoros)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.longBreakInterval}
              onChange={(e) =>
                handleChange(
                  'longBreakInterval',
                  Math.max(1, Math.min(10, parseInt(e.target.value) || 4))
                )
              }
              className="w-full rounded-lg bg-primary/5 px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 border border-primary/10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Behavior Settings */}
      <div className="space-y-4 pt-4 px-4">
        <h3 className="text-sm font-semibold text-primary/60 uppercase tracking-wider">Behavior</h3>

        <div className="flex flex-col gap-3">
          <motion.label
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 transition-colors cursor-pointer border border-primary/10"
          >
            <span className="text-sm text-primary">Auto-start breaks</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${settings.autoStartBreaks ? 'bg-normal' : 'bg-primary/20'}`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-primary transform transition-transform ${settings.autoStartBreaks ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`}
                />
              </div>
            </div>
          </motion.label>

          <motion.label
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 transition-colors cursor-pointer border border-primary/10"
          >
            <span className="text-sm text-primary">Auto-start pomodoros</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.autoStartPomodoros}
                onChange={(e) => handleChange('autoStartPomodoros', e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${settings.autoStartPomodoros ? 'bg-normal' : 'bg-primary/20'}`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-primary transform transition-transform ${settings.autoStartPomodoros ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`}
                />
              </div>
            </div>
          </motion.label>

          <motion.label
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 transition-colors cursor-pointer border border-primary/10"
          >
            <span className="text-sm text-primary">Sound notifications</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-normal' : 'bg-primary/20'}`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-primary transform transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`}
                />
              </div>
            </div>
          </motion.label>
        </div>
      </div>
    </div>
  )
}
