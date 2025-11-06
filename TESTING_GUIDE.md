# Testing Guide - Background Timer & Mini Player

## What Was Fixed

### 1. **IPC Channel Name Mismatch** ✅
- **Problem**: Timer manager was broadcasting on `'timer-tick'` but listeners expected `'timer:tick'`
- **Fix**: Updated timer-manager.ts to use correct channel names:
  - `'timer:tick'` for state updates
  - `'timer:complete'` for completion events

### 2. **Mini Player UI Missing** ✅
- **Problem**: Mini player window showed empty gradient box
- **Fix**: Created `src/renderer/src/routes/mini.tsx` with:
  - Timer display (time, mode indicator)
  - Start/Pause button
  - Close button (X in top-right corner)
  - Draggable window (top area)
  - Connected to same timer events

### 3. **Added Debug Logging** ✅
- Main process (timer-manager.ts):
  - Logs when timer starts
  - Logs each tick with current time
  - Logs state broadcasts
- Renderer (Timer.tsx):
  - Logs when listener is set up
  - Logs each received tick
  - Logs listener cleanup

## How to Test

### Test 1: Timer Live Updates
1. Start the app (`npm run dev`)
2. Open DevTools (View → Toggle Developer Tools)
3. Click "Start" button
4. **Expected behavior**:
   - Console shows: `[TimerManager] Starting timer, timeLeft: 60` (or your set duration)
   - Console shows: `[TimerManager] Tick, timeLeft: 59` every second
   - Console shows: `[Timer] Received tick: {timeLeft: 59, ...}` every second
   - Timer display counts down: 01:00 → 00:59 → 00:58...

### Test 2: Background Execution
1. Start the timer
2. Switch to another tab (Stats, Tasks, or Settings)
3. Wait 5-10 seconds
4. Switch back to Timer tab
5. **Expected behavior**:
   - Time should reflect actual elapsed time
   - No reset or jump in time
   - Timer continues from where it should be

### Test 3: Window Minimization
1. Start the timer
2. Minimize the app window
3. Wait 10-15 seconds
4. Restore the window
5. **Expected behavior**:
   - Timer shows correct time (not reset)
   - Console logs show continuous ticks even when minimized

### Test 4: Mini Player
1. Click the mini player button (rightmost button, shows a window icon)
2. **Expected behavior**:
   - Small window appears (320x150px)
   - Shows timer with gradient background
   - Shows current mode (🎯 Focus or ☕ Break)
   - Shows current time
   - Has Start/Pause button
   - Has X button in top-right corner

3. Test mini player controls:
   - Click Start/Pause → timer should start/pause in both windows
   - Drag the top area → window should move
   - Click X button → mini player should close

4. **Expected behavior**:
   - Both main and mini windows stay in sync
   - Closing mini player doesn't affect main window
   - Timer continues in background even if both windows minimized

## Troubleshooting

### Issue: "Timer doesn't update in UI"
**Check console for**:
- `[Timer] Setting up timer tick listener` - Should appear once on mount
- `[Timer] Received tick: ...` - Should appear every second when timer running

**If missing**:
- Event listener not set up correctly
- Check browser console (F12) for errors

### Issue: "Timer ticks in console but UI frozen"
**Possible causes**:
- React not re-rendering
- State updates batched incorrectly

**Check**:
- Open React DevTools
- Watch Timer component state
- Verify timeLeft, isRunning, isBreak are updating

### Issue: "Mini player shows blank window"
**Check**:
- Console for route errors
- Network tab for failed requests
- Verify `src/renderer/src/routes/mini.tsx` exists
- Verify `src/renderer/src/routes.tsx` includes mini route

### Issue: "Can't close mini player"
**Workaround**:
1. Open Task Manager
2. Find "pomo" or "Electron" process
3. End process

**Permanent fix**:
- Check if CLOSE_MINI_PLAYER handler is registered in main/index.ts
- Verify window.api.closeMiniPlayer() is available in preload

## Console Output Reference

### Normal Operation
```
[TimerManager] Starting timer, timeLeft: 60
[TimerManager] Broadcasting state: {timeLeft: 60, isRunning: true, ...}
[Timer] Setting up timer tick listener
[Timer] Received tick: {timeLeft: 60, isRunning: true, ...}
[TimerManager] Tick, timeLeft: 59
[TimerManager] Broadcasting state: {timeLeft: 59, isRunning: true, ...}
[Timer] Received tick: {timeLeft: 59, isRunning: true, ...}
...
```

### Completion
```
[TimerManager] Tick, timeLeft: 0
[TimerManager] Completion event
[Timer] Received timer complete: {wasBreak: false, completedPomodoros: 1}
```

## Known Issues

1. **Cache errors** - Harmless, related to Electron GPU caching
2. **Line ending warnings** - Cosmetic, won't affect functionality
3. **DevTools Autofill errors** - Electron devtools issue, ignore

## Next Steps After Testing

1. Remove console.log statements (or convert to proper logging)
2. Test notification sound
3. Test auto-start settings
4. Test stats/task updates on completion
5. Test long break intervals
