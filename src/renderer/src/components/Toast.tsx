import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface ToastProps {
  isVisible: boolean
  message: string
  onUndo?: () => void
  onDismiss: () => void
  duration?: number
}

const Toast = ({ isVisible, message, onUndo, onDismiss, duration = 10000 }: ToastProps) => {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (isVisible) {
      const delay = onUndo ? duration : 3000
      timer = setTimeout(onDismiss, delay)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isVisible, onUndo, onDismiss, duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="bg-gray-900/95 backdrop-blur-xl px-6 py-4 rounded-full shadow-2xl border border-white/10 flex items-center gap-4">
            <span className="text-white text-sm font-medium">{message}</span>
            {onUndo && (
              <button
                onClick={onUndo}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors"
              >
                Undo
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
