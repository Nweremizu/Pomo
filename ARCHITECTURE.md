# Pomodoro App Architecture Guide

## ���️ Project Structure

```
src/
├── shared/              # Shared between main & renderer
│   ├── schemas.ts      # Zod schemas + TypeScript types
│   └── ipc-types.ts    # IPC channel names + API interface
├── main/               # Electron main process
│   ├── index.ts        # App entry, window, tray, IPC handlers
│   └── store.ts        # Persistent storage wrapper
├── preload/            # Preload script (bridge)
│   └── index.ts        # Exposes safe API to renderer
└── renderer/           # React app
    └── src/
        ├── context/    # React context providers
        ├── components/ # UI components
        └── types/      # Type definitions
```

## ��� Data Flow

### Renderer → Main (Save Data)
```typescript
// Renderer (React component)
const { updateSettings } = useTimer()
updateSettings({ workDuration: 30 })

// ↓ Context updates state
// ↓ useEffect triggers
// ↓ Calls window.api.saveSettings()

// Preload (exposes API)
window.api.saveSettings(settings)
  
// ↓ IPC invoke

// Main (handles request)
ipcMain.handle('settings:save', (_, settings) => {
  const validated = timerSettingsSchema.parse(settings) // Zod validation
  appStore.set('settings', validated) // Persist to disk
})
```

### Main → Renderer (Load Data)
```typescript
// Renderer (on mount)
useEffect(() => {
  window.api.getSettings().then(setSettings)
}, [])

// ↓ IPC invoke

// Main (returns data)
ipcMain.handle('settings:get', () => {
  return timerSettingsSchema.parse(appStore.get('settings'))
})
```

## ��� Adding New Data

### 1. Define Schema (shared/schemas.ts)
```typescript
export const myNewDataSchema = z.object({
  field: z.string()
})

export type MyNewData = z.infer<typeof myNewDataSchema>

export const DEFAULT_MY_DATA: MyNewData = {
  field: 'default'
}
```

### 2. Add to Store Schema (main/store.ts)
```typescript
interface StoreSchema {
  settings: TimerSettings
  stats: TimerStats
  tasks: Task[]
  timerState: TimerState
  myNewData: MyNewData  // ← Add here
}

export const appStore = new ElectronStore<StoreSchema>({
  defaults: {
    // ...
    myNewData: DEFAULT_MY_DATA  // ← Add here
  }
})
```

### 3. Add IPC Channels (shared/ipc-types.ts)
```typescript
export const IPC_CHANNELS = {
  // ...
  GET_MY_DATA: 'myData:get',
  SAVE_MY_DATA: 'myData:save'
}

export interface ElectronAPI {
  // ...
  getMyData: () => Promise<MyNewData>
  saveMyData: (data: MyNewData) => Promise<void>
}
```

### 4. Register IPC Handlers (main/index.ts)
```typescript
function registerIPCHandlers() {
  // ...
  ipcMain.handle(IPC_CHANNELS.GET_MY_DATA, () => {
    return myNewDataSchema.parse(appStore.get('myNewData'))
  })
  
  ipcMain.handle(IPC_CHANNELS.SAVE_MY_DATA, (_, data: unknown) => {
    const validated = myNewDataSchema.parse(data)
    appStore.set('myNewData', validated)
  })
}
```

### 5. Expose in Preload (preload/index.ts)
```typescript
const api: ElectronAPI = {
  // ...
  getMyData: () => ipcRenderer.invoke(IPC_CHANNELS.GET_MY_DATA),
  saveMyData: (data) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_MY_DATA, data)
}
```

### 6. Use in Renderer
```typescript
// In Context
const [myData, setMyData] = useState<MyNewData | null>(null)

useEffect(() => {
  window.api.getMyData().then(setMyData)
}, [])

useEffect(() => {
  if (myData) {
    window.api.saveMyData(myData)
  }
}, [myData])
```

## ��� Key Principles

### ✅ DO
- Always validate IPC data with Zod
- Use shared schemas for type consistency
- Memoize Context values with `useMemo`
- Wrap callbacks with `useCallback`
- Follow the single source of truth pattern

### ❌ DON'T
- Don't use `any` types
- Don't skip Zod validation on IPC boundaries
- Don't create Context without memoization
- Don't expose raw `ipcRenderer` to renderer
- Don't store derived state (calculate it)

## ��� Security Model

```
┌─────────────┐
│   Renderer  │ (Sandboxed, no Node.js access)
│   (React)   │
└──────┬──────┘
       │ window.api.xxx()
       │ (Only exposed APIs)
       ↓
┌─────────────┐
│   Preload   │ (Has Node.js, but restricted)
│  (Bridge)   │
└──────┬──────┘
       │ ipcRenderer.invoke()
       │ (Validated channels only)
       ↓
┌─────────────┐
│    Main     │ (Full Node.js + Electron APIs)
│  (Backend)  │
└─────────────┘
```

## ��� Testing Strategy

### Unit Tests (Recommended)
- Timer logic (useTimerLogic hook)
- Zod schemas (validation edge cases)
- Store operations

### Integration Tests
- IPC round-trips
- Context state management
- Component behavior

### E2E Tests
- Full user flows
- Multi-window scenarios
- Tray interactions

## ��� Debugging

### Check IPC Communication
```typescript
// In main process
ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
  console.log('[MAIN] Getting settings')
  const data = appStore.get('settings')
  console.log('[MAIN] Settings:', data)
  return data
})
```

### Check Store Content
```typescript
// In main process
console.log('Store path:', appStore.path)
console.log('All data:', appStore.store)
```

### Validate Renderer API
```typescript
// In renderer DevTools console
console.log('Available APIs:', Object.keys(window.api))
await window.api.getSettings()
```

## ��� Additional Resources

- Electron Security: https://www.electronjs.org/docs/tutorial/security
- Zod Documentation: https://zod.dev/
- Electron Store: https://github.com/sindresorhus/electron-store
- React Best Practices: https://react.dev/learn
