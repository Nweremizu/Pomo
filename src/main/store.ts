import {
  type Task,
  type TimerSettings,
  type TimerStats,
  type TimerState,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_TIMER_STATE
} from '../shared/schemas'

interface StoreSchema {
  settings: TimerSettings
  stats: TimerStats
  tasks: Task[]
  timerState: TimerState
}

// Type interface for the store methods (from Conf which ElectronStore extends)
interface TypedStore {
  get<K extends keyof StoreSchema>(key: K): StoreSchema[K]
  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void
  has(key: keyof StoreSchema): boolean
  delete(key: keyof StoreSchema): void
  clear(): void
}

// Store initialization (async because electron-store is an ES module)
let storeInstance: TypedStore | null = null

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Migrate tasks with invalid IDs to use proper UUIDs
function migrateTasks(store: TypedStore): void {
  try {
    const tasks = store.get('tasks')
    let needsMigration = false

    const migratedTasks = tasks.map((task) => {
      // Check if ID is a valid UUID
      if (!UUID_REGEX.test(task.id)) {
        console.log(`[MIGRATION] Invalid task ID detected: ${task.id}, generating new UUID`)
        needsMigration = true
        return {
          ...task,
          id: crypto.randomUUID()
        }
      }
      return task
    })

    if (needsMigration) {
      console.log('[MIGRATION] Migrating tasks with invalid IDs')
      store.set('tasks', migratedTasks)

      // Also reset current task ID if it's invalid
      const timerState = store.get('timerState')
      if (timerState.currentTaskId && !UUID_REGEX.test(timerState.currentTaskId)) {
        console.log('[MIGRATION] Resetting invalid currentTaskId')
        store.set('timerState', {
          ...timerState,
          currentTaskId: null
        })
      }
    }
  } catch (error) {
    console.error('[MIGRATION] Error migrating tasks:', error)
    // On error, clear tasks to prevent validation issues
    store.set('tasks', [])
    const timerState = store.get('timerState')
    store.set('timerState', {
      ...timerState,
      currentTaskId: null
    })
  }
}

export async function initStore(): Promise<TypedStore> {
  if (storeInstance) {
    return storeInstance
  }

  // Dynamic import for ES module
  const { default: ElectronStore } = await import('electron-store')

  const store = new ElectronStore<StoreSchema>({
    defaults: {
      settings: DEFAULT_SETTINGS,
      stats: DEFAULT_STATS,
      tasks: [],
      timerState: DEFAULT_TIMER_STATE
    }
  })

  storeInstance = store as unknown as TypedStore

  // Migrate any tasks with invalid UUIDs
  migrateTasks(storeInstance)

  return storeInstance
}

export function getStore(): TypedStore {
  if (!storeInstance) {
    throw new Error('Store not initialized. Call initStore() first.')
  }
  return storeInstance
}
