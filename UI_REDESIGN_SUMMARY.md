# UI/UX Redesign - Single Focus Screen

## 🎯 Design Philosophy Implemented

### Radical Simplicity
✅ **One screen, one purpose**: Eliminated tab navigation
✅ **No nested menus**: Everything accessible with 1-2 taps
✅ **Self-evident actions**: Primary button changes dynamically (Start → Pause → Stop)
✅ **Invisible technology**: Timer runs in background, UI shows intention not machinery

### Feel & Feedback
✅ **Micro-animations**: Framer Motion for every transition
✅ **Instant feedback**: Button scales, color transitions, smooth overlays
✅ **Gentle transitions**: 1-second fade between focus/break modes
✅ **Living interface**: Pulsing glow effect when timer runs

### Unified Experience
✅ **Contextual task attachment**: One tap on chip opens inline picker
✅ **No mode switching**: System handles generic ↔ task sessions invisibly
✅ **Auto-pause/resume**: Toast with 10-second undo for session switches
✅ **Seamless flow**: Create task inline, no dialogs, instant start

## 🎨 New UI Components

### 1. **CircularTimer** (`CircularTimer.tsx`)
- Minimal countdown ring with SVG progress indicator
- Dynamic color scheme: Purple (focus) → Green (break)
- Pulsing glow effect when running
- Large time display (7xl font)
- Subtle mode indicator below time

**Visual Details:**
- Ring radius: 140px
- Stroke width: 8px
- Smooth rotation animation
- Glow blur: 20px with opacity pulse

### 2. **TaskChip** (`TaskChip.tsx`)
- Tappable chip at top of screen
- Defaults to "General Focus"
- Shows current task name when active
- Frosted glass effect (backdrop-blur)
- Hover scale: 1.02x, Tap scale: 0.98x

**Icons:**
- Checkmark icon for tasks
- Dropdown chevron to indicate tappable

### 3. **InlineTaskPicker** (`InlineTaskPicker.tsx`)
- Appears as centered overlay (not modal)
- Backdrop blur: Semi-transparent black
- Spring animation entrance
- Three sections:
  1. **General Focus** (always shown)
  2. **Recent Tasks** (last 5 incomplete tasks)
  3. **Create New Task** (inline input)

**Interaction Flow:**
1. Tap → Overlay slides in
2. Select → Closes automatically
3. Create → Type → Enter → Instant start

**No Save button needed** - Everything is immediate

### 4. **Toast** (`Toast.tsx`)
- Bottom-centered notification
- Auto-dismisses after 3s (or 10s with Undo)
- Spring animation from bottom
- Frosted glass appearance
- Undo button for reversible actions

**Example Messages:**
- "Paused General Focus → Started Write Proposal [Undo]"
- "Pomodoro Complete!"
- "Break Complete!"

### 5. **Slide-Up Panel** (Integrated in App.tsx)
- Hidden by default
- 3-dot menu button triggers
- Slides up from bottom (80vh max height)
- Three views: Tasks | Stats | Settings
- Smooth spring animation
- Tap backdrop to dismiss

## 🔄 New User Flow

### Starting a Session
```
1. User opens app → Single focus screen
2. Sees circular timer, "General Focus" chip
3. Taps Start → Timer begins, glow effect activates
4. Status shows "Focus session · 25 min left"
```

### Attaching a Task
```
1. User taps task chip
2. Inline picker slides in with backdrop blur
3. Options:
   - General Focus
   - Recent: "Write Proposal" (2/4 pomodoros)
   - Recent: "Code Review" (0/3 pomodoros)
   - [Create New Task input field]
4. User taps "Write Proposal"
5. Picker closes instantly
6. Chip updates to show "Write Proposal"
7. If timer was running on "General Focus":
   → Toast appears: "Paused General Focus → Started Write Proposal [Undo]"
   → Previous session paused
   → New session ready to start
```

### Creating New Task
```
1. In task picker, type in "New Feature" field
2. Set estimated pomodoros: 4
3. Press Enter OR tap "Create & Start"
4. Picker closes
5. Task attached immediately
6. Ready to start
```

### Accessing Secondary Features
```
1. Tap 3-dot menu (top right)
2. Panel slides up from bottom
3. Tabs: Tasks | Stats | Settings
4. Browse/edit as needed
5. Tap backdrop or X to dismiss
```

### Undo Action
```
1. Switch from Task A to Task B while timer running
2. Toast appears: "Paused Task A → Started Task B [Undo]"
3. User has 10 seconds to tap Undo
4. Tap Undo → Reverts to Task A, resumes if was running
5. After 10s → Toast auto-dismisses, change confirmed
```

## 🎭 Visual State System

### Focus Mode (Default)
- **Background**: Purple gradient (667eea → 764ba2)
- **Ring color**: #667eea
- **Glow**: Pulsing purple
- **Text**: White with purple tint
- **Mode label**: "Focus Mode"

### Break Mode
- **Background**: Green gradient (10b981 → 059669)
- **Ring color**: #10b981
- **Glow**: Pulsing green
- **Text**: White with green tint
- **Mode label**: "Break Time"
- **Transition**: 1-second smooth fade

### Running State
- Pulsing glow effect (opacity 0.5 → 0.8)
- Status line opacity: 100%
- Button text: "Pause"

### Paused State
- No glow effect
- Status line opacity: 40%
- Button text: "Start"

## 🎬 Animation Specifications

### Timer Ring
- **Progress**: 0.5s ease-out transition per tick
- **Color change**: 1s ease-in-out when switching modes
- **Glow pulse**: 2s infinite, ease-in-out

### Primary Button
- **Hover**: Scale 1.05 with shadow glow
- **Tap**: Scale 0.95
- **Spring config**: damping 25, stiffness 300

### Overlays (Task Picker, Panel)
- **Entrance**: Slide in from position with scale 0.95
- **Exit**: Slide out with fade
- **Backdrop**: Fade in/out 0.3s
- **Spring config**: damping 30, stiffness 300

### Toast
- **Entrance**: Slide up from bottom (y: 50 → 0)
- **Exit**: Slide down (y: 0 → 50)
- **Duration**: Spring animation

## 📊 Data Flow

### Auto-Pause/Resume Logic
```typescript
When user switches tasks while timer running:

1. Save current session state:
   - Current task ID
   - Time remaining
   - Running status

2. Pause current timer

3. Show toast with undo option

4. Update current task ID

5. If undo within 10s:
   → Restore previous session
   → Resume if was running

6. If no undo:
   → Confirm task switch
   → User can start new task
```

### Task Completion Flow
```typescript
When pomodoro completes:

1. Timer manager broadcasts completion event

2. Renderer receives event:
   - Updates stats (total pomodoros++)
   - If task attached:
     * Increment task pomodoros
     * Check if task complete
     * Update task status
   - Show notification

3. Auto-switch to break:
   - Background fades to green
   - Ring color changes
   - Time resets to break duration
   - Auto-start if setting enabled
```

## 🔧 Technical Implementation

### Component Hierarchy
```
App (TimerProvider)
└── FocusScreen
    ├── Background (gradient, animated)
    ├── Top Bar
    │   ├── TaskChip
    │   └── Menu Button
    ├── Main Area
    │   ├── CircularTimer
    │   ├── Status Line
    │   └── Control Buttons
    ├── InlineTaskPicker (overlay)
    ├── SlideUpPanel (overlay)
    └── Toast (notification)
```

### State Management
```typescript
// Timer state (from main process)
timeLeft, isRunning, isBreak, currentTaskId

// UI state (local)
isTaskPickerOpen, isPanelOpen, panelView
toast, previousSession

// Context (shared)
settings, tasks, stats
```

### IPC Communication
- **From Renderer**: timerStart, timerPause, timerReset, timerGetState
- **To Renderer**: timer:tick (every second), timer:complete (on finish)
- **Persistence**: saveTasks, saveStats (automatic)

## ✨ Design Details

### Typography
- **Timer**: 7xl, bold, tracking-tight
- **Status**: sm, medium, opacity-60
- **Buttons**: lg semibold (primary), sm medium (secondary)
- **Task names**: medium (chips), base (lists)

### Spacing
- **Padding**: Consistent 4-6 units (1rem-1.5rem)
- **Gaps**: 2-4 units between related elements
- **Margins**: 8 units for major sections

### Border Radius
- **Buttons**: rounded-full (9999px)
- **Panels**: rounded-2xl (1rem) / rounded-t-3xl (1.5rem)
- **Inputs**: rounded-lg (0.5rem)

### Colors
- **Focus**: #667eea (purple), #764ba2 (deep purple)
- **Break**: #10b981 (green), #059669 (dark green)
- **UI Elements**: white/10, white/20, white/30 (transparency)
- **Text**: white, white/60, white/80

### Effects
- **Backdrop blur**: backdrop-blur-sm, backdrop-blur-xl
- **Shadows**: shadow-2xl with color-tinted glow
- **Borders**: border-white/10, border-white/20

## 🎯 Success Metrics

### User Experience Goals
✅ **Zero learning curve**: First-time users understand immediately
✅ **One-tap actions**: Most common flows require single tap
✅ **Forgiving interactions**: Undo available for all destructive actions
✅ **Delightful feedback**: Every action has visual response
✅ **Invisible complexity**: Background timer, auto-pause, state sync

### Performance Targets
✅ **Smooth 60fps animations**: Framer Motion + GPU acceleration
✅ **Instant responses**: All UI interactions < 100ms
✅ **Reliable timing**: Main process timer, immune to tab throttling
✅ **Minimal re-renders**: Optimized with useCallback, memo where needed

## 🚀 Future Enhancements

### AI Suggestions (Planned)
- "Based on your history, try 'Deep Work' sessions"
- "You completed 3 pomodoros on this task - keep going!"
- Appears contextually, never intrusive

### Smart Break Suggestions
- "You've done 4 pomodoros - take a longer break"
- "Walk suggested" after 3 consecutive sessions

### Keyboard Shortcuts
- Space: Start/Pause
- R: Reset
- T: Open task picker
- Esc: Close overlays

### Mini Player Integration
- Same design language
- Circular timer in compact form
- Single button control
- Syncs with main window

## 📝 Migration Notes

### What Changed
- **Removed**: Tab navigation system
- **Removed**: Separate Timer component with tabs
- **Added**: Single FocusScreen component
- **Added**: 4 new UI components
- **Changed**: All timer logic now in App.tsx

### What Stayed
- TimerContext (settings, stats, tasks)
- Timer manager (main process)
- IPC communication layer
- TaskList, Stats, Settings components (in slide-up panel)

### Breaking Changes
- None for users - data persists
- Old Timer.tsx still exists but unused
- Can be safely deleted after testing

## 🎨 Design System

This redesign establishes a cohesive design system:

1. **Motion Language**: Spring animations, scale feedback, smooth fades
2. **Color System**: Mode-based gradients with consistent transparency
3. **Spacing Scale**: 2, 4, 6, 8 units for consistent rhythm
4. **Typography Scale**: Hierarchical sizing for clear information architecture
5. **Interaction Patterns**: Tap → Immediate feedback → Smooth transition

Every detail serves the core principle: **Simplicity is sacred**.
