import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimer } from '../context/TimerContext'

export default function TaskList() {
  const { tasks, addTask, updateTask, deleteTask } = useTimer()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskEstimate, setNewTaskEstimate] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskEstimate)
      setNewTaskTitle('')
      setNewTaskEstimate(1)
    }
  }

  return (
    <div className="w-full space-y-4 h-fit">
      {/* Task List */}
      <div className="gap-2 flex flex-col max-h-[45vh] overflow-y-scroll p-2">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-primary/40 text-sm"
          >
            No tasks yet. Create one below to get started.
          </motion.div>
        ) : (
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between rounded-xl  bg-primary/5 p-4  border border-primary/10 hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
                    className="h-4 w-4 rounded border-primary/20 bg-primary/10 text-purple-500 focus:ring-primary/20 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium text-primary text-sm ${task.completed ? 'line-through opacity-50' : ''}`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-xs text-primary/50 mt-0.5">
                      {task.pomodoros}/{task.estimatedPomodoros} pomodoros
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteTask(task.id)}
                  className="text-primary/40 hover:text-red-400 font-medium text-3xl ml-2"
                >
                  ×
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Task Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 pt-4 p-2 border-t border-primary/10 min-h-[30vh] h-fit"
      >
        <div className="flex gap-2 flex-col">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What are you working on?"
            className="w-full rounded-lg bg-primary/5 px-3 py-2 text-primary placeholder-primary/40 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-primary/10"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="10"
              value={newTaskEstimate}
              onChange={(e) =>
                setNewTaskEstimate(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
              }
              className="w-16 rounded-lg bg-primary/5 px-3 py-2 text-primary text-sm text-center backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-primary/10"
            />
            <span className="text-xs text-primary/50">estimated pomodoros</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-bg text-sm font-medium transition-colors hover:bg-primary/20 border border-primary/20"
        >
          Add Task
        </motion.button>
      </form>
    </div>
  )
}
