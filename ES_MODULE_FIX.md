# ES Module Import Fix for electron-store

## Problem

The app crashed on startup with:
```
TypeError: ElectronStore is not a constructor
```

## Root Cause

**electron-store v10** is an **ES Module** (`"type": "module"` in package.json), but Electron's main process runs in **CommonJS mode** by default.

When we tried to use:
```typescript
import ElectronStore from 'electron-store'
const store = new ElectronStore(...)
```

Electron/Node.js couldn't properly load the ES module synchronously in the CommonJS context.

## Solution

### 1. Changed to Dynamic Import (Async)

**Before** (`src/main/store.ts`):
```typescript
import ElectronStore from 'electron-store'

export const appStore = new ElectronStore<StoreSchema>({...})
```

**After** (`src/main/store.ts`):
```typescript
// Store initialization (async because electron-store is an ES module)
let storeInstance: TypedStore | null = null

export async function initStore(): Promise<TypedStore> {
  if (storeInstance) {
    return storeInstance
  }

  // Dynamic import for ES module
  const { default: ElectronStore } = await import('electron-store')
  
  const store = new ElectronStore<StoreSchema>({
    defaults: {...}
  })

  storeInstance = store as unknown as TypedStore
  return storeInstance
}

export function getStore(): TypedStore {
  if (!storeInstance) {
    throw new Error('Store not initialized. Call initStore() first.')
  }
  return storeInstance
}
```

### 2. Initialize Store Before IPC Handlers

**Updated** (`src/main/index.ts`):
```typescript
app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.pomo')

  // Initialize store before registering IPC handlers
  await initStore()
  
  registerIPCHandlers()  // Now safe to use getStore()
  createWindow()
  createTray()
})
```

### 3. Use getStore() in IPC Handlers

**Updated** (`src/main/index.ts`):
```typescript
function registerIPCHandlers(): void {
  const appStore = getStore()  // Get the initialized store
  
  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return timerSettingsSchema.parse(appStore.get('settings'))
  })
  // ... rest of handlers
}
```

## Why This Works

1. **Dynamic `import()`** is async and can load ES modules from CommonJS
2. **Initialization happens once** before any IPC handlers are registered
3. **getStore() ensures** store is ready before use (throws error if not)
4. **No race conditions** - store is fully initialized before app window opens

## Alternative Solutions (Not Used)

### Option A: Convert Main Process to ES Module
- Add `"type": "module"` to package.json
- Would require updating ALL main process files
- More invasive change

### Option B: Downgrade electron-store
- Use electron-store v8 (last CommonJS version)
- Loses newer features and security updates
- Not recommended for new projects

### Option C: Use Different Store Library
- Switch to `conf` directly (electron-store is built on it)
- Loses Electron-specific optimizations
- More work to migrate

## Verification

✅ TypeScript compiles without errors
✅ Build succeeds
✅ Store initializes properly
✅ App starts without errors

## Key Takeaway

**When using ES module packages in Electron's main process:**
- Use **dynamic `import()`** with `await`
- Initialize **before first use**
- Ensure initialization happens in `app.whenReady()` or later
