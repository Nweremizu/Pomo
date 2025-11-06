# Critical Bugs Fixed - Pomodoro Electron App

## Summary
Fixed three critical bugs preventing the app from running with proper security (sandbox mode):

1. ✅ ES Module Import Error (electron-store)
2. ✅ window.api Undefined (contextBridge)  
3. ✅ Module Not Found (@electron-toolkit/preload)

---

## Bug #1: ES Module Import Error

**Error:**
```
TypeError: ElectronStore is not a constructor
```

**Root Cause:**  
`electron-store` v10 is an ES Module, but Electron's main process runs in CommonJS mode by default.

**Solution:**
- Used dynamic `import()` instead of `require()` in `src/main/store.ts`
- Made store initialization async with `initStore()` function
- Ensured store initializes before IPC handlers register

**Files Changed:**
- `src/main/store.ts` - Dynamic import wrapper
- `src/main/index.ts` - Await `initStore()` in `app.whenReady()`

---

## Bug #2: window.api Undefined

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'getSettings')
TypeError: Cannot read properties of undefined (reading 'saveTasks')
```

**Root Cause:**  
With `sandbox: true` enabled, the preload script was checking `process.contextIsolated` which doesn't exist in sandboxed contexts. This caused the code to skip `contextBridge.exposeInMainWorld()` and try to set `window.api` directly, which fails with context isolation.

**Solution:**
- Removed conditional `if (process.contextIsolated)` check
- Always use `contextBridge.exposeInMainWorld()` since we explicitly enable context isolation
- Added debug logging to track API exposure

**Files Changed:**
- `src/preload/index.ts` - Removed conditional, always use contextBridge

**Before:**
```typescript
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  window.api = api  // Doesn't work with contextIsolation: true
}
```

**After:**
```typescript
contextBridge.exposeInMainWorld('api', api)
console.log('[PRELOAD] API exposed successfully')
```

---

## Bug #3: @electron-toolkit/preload Module Not Found

**Error:**
```
module not found: @electron-toolkit/preload
    at preloadRequire (VM4 sandbox_bundle:2:144077)
```

**Root Cause:**  
`@electron-toolkit/preload` cannot be loaded in sandboxed preload contexts. With `sandbox: true`, preload scripts run in a restricted environment without access to `node_modules` dependencies.

**Solution:**
- Replaced `@electron-toolkit/preload` import with custom `electronAPI` object
- Only expose essential process information (platform, versions)
- No external dependencies in preload script

**Files Changed:**
- `src/preload/index.ts` - Custom electronAPI implementation

**Before:**
```typescript
import { electronAPI } from '@electron-toolkit/preload'
```

**After:**
```typescript
const electronAPI = {
  process: {
    platform: process.platform,
    versions: process.versions
  }
}
```

---

## Security Improvements Applied

As part of fixing these bugs, the following security hardening was implemented:

✅ **sandbox: true** - Renderer process runs in OS-level sandbox  
✅ **contextIsolation: true** - Separate JavaScript contexts for preload and renderer  
✅ **nodeIntegration: false** - No Node.js APIs exposed to renderer  
✅ **Type-safe IPC** - Zod validation on all IPC boundaries  
✅ **Minimal preload surface** - Only expose necessary APIs via contextBridge

---

## Verification

Run the app:
```bash
npm run dev
```

**Expected Console Output:**
```
[PRELOAD] API exposed successfully to renderer
[PRELOAD] Available API methods: [getSettings, saveSettings, ...]
[RENDERER] window.api available: true
```

**App Should:**
- ✅ Start without crashing
- ✅ Load settings, stats, and tasks from storage
- ✅ Save data automatically
- ✅ Show tray icon
- ✅ Display desktop notifications
- ✅ Run with proper security (sandbox enabled)

---

## Technical Debt Removed

The `@electron-toolkit/preload` dependency is now unused and can be removed:

```bash
npm uninstall @electron-toolkit/preload
```

---

## Related Documentation

- `REFACTOR_SUMMARY.md` - Complete refactoring overview
- `ARCHITECTURE.md` - System architecture documentation
- `ES_MODULE_FIX.md` - Detailed ES module import solution

---

## Next Steps

All critical bugs are fixed. The app now runs securely with:
- Proper sandboxing
- Type-safe IPC communication
- Persistent storage
- System tray integration
- Desktop notifications

See `REFACTOR_SUMMARY.md` for remaining optimization opportunities.
