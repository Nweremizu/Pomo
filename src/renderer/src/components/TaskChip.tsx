import { motion } from 'framer-motion'

interface TaskChipProps {
  taskTitle: string | null
  onClick: () => void
}

const TaskChip = ({ taskTitle, onClick }: TaskChipProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm hover:bg-primary/20 transition-colors border border-primary/20"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
      <span className="text-sm font-medium text-primary">{taskTitle || 'General Focus'}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/40"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </motion.button>
  )
}

export default TaskChip
