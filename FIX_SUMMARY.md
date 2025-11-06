# Bug Fixes Applied

## Issue #1: ES Module Import Error ✅ FIXED

### Error
```
TypeError: ElectronStore is not a constructor
```

### Root Cause
`electron-store` v10 is an ES Module but Electron's main process runs in CommonJS mode.

### Solution
- Changed to dynamic `import()` in `src/main/store.ts`
- Added async `initStore()` function
- Initialize store before IPC handlers in `app.whenReady()`

### Files Modified
- `src/main/store.ts` - Async initialization
- `src/main/index.ts` - Call `await initStore()` before `registerIPCHandlers()`

---

## Issue #2: window.api Undefined ✅ FIXED

### Error
```
TypeError: Cannot read properties of undefined (reading 'getSettings')
TypeError: Cannot read properties of undefined (reading 'saveTasks')
```

### Root Cause
With `sandbox: true` and `contextIsolation: true`, the preload script was checking `process.contextIsolated` which doesn't exist in sandboxed contexts. This caused the code to fall through to the `else` branch that tries to set `window.api` directly, which doesn't work with context isolation.

### Solution
Removed the conditional check and always use `contextBridge.exposeInMainWorld()` since we explicitly set `contextIsolation: true` in BrowserWindow.

### Files Modified
- `src/preload/index.ts` - Removed `if (process.contextIsolated)` check
- `src/renderer/src/context/TimerContext.tsx` - Added debugging logs

### Code Change
**Before:**
```typescript
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
```

**After:**
```typescript
try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
  console.log('[PRELOAD] API exposed successfully to renderer')
  console.log('[PRELOAD] Available API methods:', Object.keys(api))
} catch (error) {
  console.error('[PRELOAD] Failed to expose API:', error)
}
```

---

## Issue #3: @electron-toolkit/preload Module Not Found ✅ FIXED

### Error
```
module not found: @electron-toolkit/preload
    at preloadRequire (VM4 sandbox_bundle:2:144077)
```

### Root Cause
`@electron-toolkit/preload` cannot be loaded in sandboxed renderer contexts. With `sandbox: true`, preload scripts run in a restricted environment that can't access Node.js modules from `node_modules`.

### Solution
Replaced the `@electron-toolkit/preload` import with a custom `electronAPI` object that provides only the necessary process information (platform, versions).

### Files Modified
- `src/preload/index.ts` - Removed dependency on `@electron-toolkit/preload`

### Code Change
**Before:**
```typescript
import { electronAPI } from '@electron-toolkit/preload'
```

**After:**
```typescript
// Custom electronAPI to replace @electron-toolkit/preload (not compatible with sandbox)
const electronAPI = {
  process: {
    platform: process.platform,
    versions: process.versions
  }
}
```

### Note
The `@electron-toolkit/preload` dependency can be removed from `package.json` since it's no longer used. However, keeping it doesn't cause issues - it's just unused.

---

## Verification Steps

1. ✅ TypeScript compiles without errors
2. ✅ Build succeeds
3. ✅ Preload script correctly compiled
4. ✅ `contextBridge` always used with context isolation
5. ✅ Store initializes before IPC handlers

## Testing

Run the app:
```bash
npm run dev
```

Check console for:
- `[PRELOAD] API exposed successfully to renderer`
- `[PRELOAD] Available API methods: [array of methods]`
- `[RENDERER] window.api available: true`
- No "Cannot read properties of undefined" errors

## Next Steps

The app should now:
- ✅ Start without crashing
- ✅ Load settings, stats, and tasks from persistent storage
- ✅ Save changes to disk automatically
- ✅ Display tray icon
- ✅ Show desktop notifications
- ✅ Properly sandbox renderer process (secure!)

## Remaining Improvements

See `REFACTOR_SUMMARY.md` for:
- Audio asset fix
- Timer accuracy improvements
- Component refactoring
- Remove unused dependencies
- Add error boundaries
- Implement tests
