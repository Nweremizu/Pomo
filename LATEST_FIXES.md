# Latest Fixes - Mini Player & Session Reset

## Issues Fixed

### 1. ✅ Single Instance Lock
**Problem**: Multiple app instances could be opened

**Solution**: Added single instance lock in `src/main/index.ts`
```typescript
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // Another instance is already running
  app.quit()
} else {
  // Handle second instance attempt - show existing window
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    } else if (miniWindow) {
      if (miniWindow.isMinimized()) miniWindow.restore()
      miniWindow.show()
      miniWindow.focus()
    }
  })
}
```

**Result**:
- Only one app instance can run at a time
- If user tries to open a second instance, the existing window is shown and focused
- Error message not needed - the app simply focuses the existing window

### 2. ✅ Hide Main Window When Mini Player Opens
**Problem**: Both windows visible at same time

**Solution**: Modified `OPEN_MINI_PLAYER` handler
```typescript
ipcMain.handle(IPC_CHANNELS.OPEN_MINI_PLAYER, () => {
  createMiniWindow()
  // Hide main window when mini player opens
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
  }
})
```

**Result**:
- Main window automatically hides when mini player opens
- Clean UI - only one window visible at a time

### 3. ✅ Show Main Window When Mini Player Closes
**Problem**: No way to get back to main window after closing mini player

**Solution**: Modified `CLOSE_MINI_PLAYER` handler
```typescript
ipcMain.handle(IPC_CHANNELS.CLOSE_MINI_PLAYER, () => {
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.close()
    miniWindow = null
    timerManager?.setWindows(mainWindow, null)
  }
  // Show main window when mini player closes
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show()
    mainWindow.focus()
  }
})
```

**Result**:
- Clicking X on mini player closes it
- Main window automatically shows and focuses
- Seamless transition between windows

### 4. ✅ Fixed Session Reset
**Problem**: Reset button didn't properly reset the session

**Solution**: Improved `reset()` method in `src/main/timer-manager.ts`
```typescript
reset(): void {
  console.log('[TimerManager] Resetting timer, isBreak:', this.state.isBreak)
  this.pause()

  // Always reset to work mode with a full reset
  this.state.isBreak = false
  this.state.timeLeft = this.settings.workDuration * 60
  this.state.completedPomodoros = 0
  this.state.currentTaskId = null

  console.log('[TimerManager] Reset to work mode, timeLeft:', this.state.timeLeft)
  this.broadcastState()
}
```

**Result**:
- Reset button now completely resets the session
- Returns to work mode (not break)
- Clears completed pomodoros count
- Resets to configured work duration
- Clears current task

## Testing

### Test Single Instance Lock
1. Start the app
2. Try to start another instance (double-click app icon again)
3. **Expected**: Second instance doesn't start, existing window is shown and focused

### Test Mini Player Window Management
1. Start the app (main window visible)
2. Click "Open Mini Player" button
3. **Expected**: Mini player appears, main window hides
4. Click X on mini player
5. **Expected**: Mini player closes, main window shows and focuses

### Test Session Reset
1. Start a timer
2. Let it run for a few seconds
3. Click the reset button (⟲ icon)
4. **Expected**:
   - Timer stops
   - Timer resets to work duration (e.g., 25:00)
   - Mode shows Focus (not Break)
   - Completed pomodoros reset to 0
   - Can start fresh session

### Test Reset During Break
1. Complete a pomodoro (or manually switch to break mode)
2. Click reset button
3. **Expected**:
   - Timer resets to work mode
   - Shows work duration
   - Ready to start new work session

## Workflow Example

### Normal Usage Flow
1. Start app → Main window opens
2. Start timer → Timer runs in background
3. Click "Open Mini Player" → Main window hides, mini player shows
4. Minimize mini player → Timer continues in background
5. Complete pomodoro → Notification appears
6. Click X on mini player → Mini player closes, main window shows
7. Click reset → Full session reset to work mode

### Quick Mini Player Flow
1. Start app → Main window opens
2. Click "Open Mini Player" → Switch to mini player
3. Work while timer runs in compact window
4. Click X when done → Back to main window

## Console Output

### When Opening Mini Player
```
[TimerManager] Broadcasting state: {...}
// Main window hides
// Mini player shows
```

### When Closing Mini Player
```
// Mini player closes
// Main window shows and focuses
[TimerManager] Broadcasting state: {...}
```

### When Resetting Session
```
[TimerManager] Resetting timer, isBreak: false
[TimerManager] Reset to work mode, timeLeft: 1500
[TimerManager] Broadcasting state: {timeLeft: 1500, isRunning: false, isBreak: false, completedPomodoros: 0, ...}
```

## Benefits

1. **Clean UX**: Only one window visible at a time
2. **No Confusion**: Can't accidentally open multiple instances
3. **Easy Navigation**: Close mini player → main window appears automatically
4. **Proper Reset**: Reset button works as expected - complete session restart
5. **Background Timer**: Timer continues running regardless of which window is visible
