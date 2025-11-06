/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface InlineTaskPickerProps {
  isOpen: boolean
  onClose: () => void
  tasks: any[]
  currentTaskId: string | null
  onSelectTask: (taskId: string | null) => void
  onCreateTask: (title: string, estimatedPomodoros: number) => void
}

const InlineTaskPicker = ({
  isOpen,
  onClose,
  tasks,
  currentTaskId,
  onSelectTask,
  onCreateTask
}: InlineTaskPickerProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(4)

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle.trim(), estimatedPomodoros)
      setNewTaskTitle('')
      setEstimatedPomodoros(4)
      onClose()
    }
  }

  const recentTasks = tasks.filter((t) => !t.completed).slice(0, 5)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Picker Panel */}
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-md bg-bg/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-bg/10 z-50 overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-primary/10">
              <h3 className="text-lg font-semibold text-primary">Select Task</h3>
            </div>

            {/* General Focus Option */}
            <button
              onClick={() => {
                onSelectTask(null)
                onClose()
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/5 transition-colors ${
                currentTaskId === null ? 'bg-primary/10' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success to-success flex items-center justify-center">
                <span className="text-sm">🎯</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-primary font-medium">General Focus</div>
                <div className="text-xs text-primary/50">No specific task</div>
              </div>
              {currentTaskId === null && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-green-400"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>

            {/* Recent Tasks */}
            {recentTasks.length > 0 && (
              <div className="border-t border-primary/10 h-[30vh] overflow-y-auto">
                <div className="px-4 py-2 text-xs font-medium text-primary/50 uppercase tracking-wide">
                  Recent Tasks
                </div>
                {recentTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      onSelectTask(task.id)
                      onClose()
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/5 transition-colors ${
                      currentTaskId === task.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-normal to-normal flex items-center justify-center">
                      <span className="text-xs font-bold text-bg">
                        {task.title[0].toUpperCase()}
                        {task.title[1].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-primary font-medium">{task.title}</div>
                      <div className="text-xs text-primary/50">
                        {task.pomodoros} of {task.estimatedPomodoros} pomodoros
                      </div>
                    </div>
                    {currentTaskId === task.id && (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-green-400"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Create New Task */}
            <div className="border-t border-primary/10 p-4 space-y-3">
              <div className="text-xs font-medium text-primary/50 uppercase tracking-wide">
                Create New Task
              </div>
              <input
                type="text"
                placeholder="Task name..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTask()
                  if (e.key === 'Escape') onClose()
                }}
                className="w-full px-3 py-2 text-sm bg-primary/5 border border-primary/10 rounded-lg text-primary placeholder-primary/30 focus:outline-none focus:border-primary/30 transition-colors"
                autoFocus
              />
              <div className="flex items-center gap-2 py-2">
                <label className="text-xs text-primary/60">Estimated pomodoros:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={estimatedPomodoros}
                  onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
                  className="w-fit px-2 py-1 bg-primary/5 text-xs border border-primary/10 rounded text-primary text-center focus:outline-none focus:border-primary/30"
                />
              </div>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim()}
                className="w-full px-4 py-2 bg-gradient-to-r from-primary to-primary text-bg font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create & Start
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default InlineTaskPicker
