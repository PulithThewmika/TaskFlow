# SKILL: Frontend Design — TaskFlow UI/UX Design System
## React 18 + TypeScript + Tailwind CSS

---

## DESIGN DIRECTION

TaskFlow is a **professional team task management tool** — a lightweight Jira. The aesthetic should feel:

- **Focused and dense** — like a real productivity tool, not a marketing page
- **Dark-primary with high contrast** — reduces eye strain for long work sessions
- **Systematic** — consistent spacing, color-coded statuses, clear hierarchy
- **Functional beauty** — every visual decision earns its place by aiding comprehension

**Tone:** Industrial-utilitarian meets modern SaaS. Think Linear.app or Vercel dashboard. Clean edges, monospace accents, intentional density.

---

## COLOR SYSTEM

```css
/* tailwind.config.ts — extend these */
:root {
  /* Backgrounds */
  --bg-base:        #0f1117;   /* Page background — near-black */
  --bg-surface:     #1a1d27;   /* Cards, modals, panels */
  --bg-elevated:    #252836;   /* Hover states, input bg */
  --bg-border:      #2e3148;   /* Borders, dividers */

  /* Text */
  --text-primary:   #f0f2f8;   /* Headings, primary content */
  --text-secondary: #8b92b3;   /* Labels, meta info */
  --text-muted:     #4a5180;   /* Placeholders, disabled */

  /* Brand */
  --brand:          #6366f1;   /* Indigo — primary action */
  --brand-hover:    #4f52d3;
  --brand-subtle:   #1e1f4a;   /* Brand tinted backgrounds */

  /* Status colors — Kanban columns */
  --status-todo:       #4a5180;   /* Muted slate */
  --status-todo-bg:    #1a1d27;
  --status-progress:   #f59e0b;   /* Amber */
  --status-progress-bg:#2a1f0a;
  --status-review:     #8b5cf6;   /* Purple */
  --status-review-bg:  #1d1535;
  --status-done:       #10b981;   /* Emerald */
  --status-done-bg:    #0a2318;

  /* Priority colors */
  --priority-low:      #6b7280;
  --priority-medium:   #3b82f6;
  --priority-high:     #f97316;
  --priority-critical: #ef4444;
}
```

### Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:     '#0f1117',
        surface:  '#1a1d27',
        elevated: '#252836',
        border:   '#2e3148',
        brand:    '#6366f1',
        'brand-hover': '#4f52d3',
      },
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'modal': '0 20px 60px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}

export default config
```

### Google Fonts Import (in `index.html`)

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## TYPOGRAPHY SCALE

| Use | Class | Size | Weight |
|---|---|---|---|
| Page title | `text-2xl font-bold` | 24px | 700 |
| Section heading | `text-lg font-semibold` | 18px | 600 |
| Card title | `text-sm font-medium` | 14px | 500 |
| Body text | `text-sm` | 14px | 400 |
| Label / meta | `text-xs text-[#8b92b3]` | 12px | 400 |
| Monospace (ID, date) | `font-mono text-xs` | 12px | 400 |

---

## SPACING SYSTEM

Use Tailwind's default 4px base unit consistently:
- Component internal padding: `p-4` (16px)
- Between sections: `gap-6` (24px)
- Between cards in grid: `gap-4` (16px)
- Sidebar width: `w-60` (240px)
- TopBar height: `h-14` (56px)

---

## COMPONENT DESIGN SPECS

### Button

```tsx
// variants
const variants = {
  primary:   'bg-brand hover:bg-brand-hover text-white',
  secondary: 'bg-elevated hover:bg-border text-[#f0f2f8] border border-[#2e3148]',
  danger:    'bg-[#2a0f0f] hover:bg-[#3d1515] text-red-400 border border-red-900',
  ghost:     'hover:bg-elevated text-[#8b92b3] hover:text-[#f0f2f8]',
}

// sizing
const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
}

// base classes always applied
const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
```

### Input / Textarea

```tsx
const inputBase = `
  w-full bg-[#252836] border border-[#2e3148] rounded-lg
  px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5180]
  focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30
  transition-colors duration-150
`
// Error state: add 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
```

### Card (TaskCard)

```tsx
const cardBase = `
  bg-[#1a1d27] border border-[#2e3148] rounded-xl p-4
  hover:border-[#6366f1]/40 hover:bg-[#1e2135]
  cursor-pointer transition-all duration-150
  shadow-[0_1px_3px_rgba(0,0,0,0.4)]
`
```

### Modal Overlay + Panel

```tsx
// Overlay
'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'

// Panel
'bg-[#1a1d27] border border-[#2e3148] rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
```

### Badge (Priority / Status)

```tsx
const priorityBadge = {
  LOW:      'bg-gray-800 text-gray-400 border border-gray-700',
  MEDIUM:   'bg-blue-950 text-blue-400 border border-blue-800',
  HIGH:     'bg-orange-950 text-orange-400 border border-orange-800',
  CRITICAL: 'bg-red-950 text-red-400 border border-red-800',
}

const statusBadge = {
  TODO:        'bg-slate-800 text-slate-400',
  IN_PROGRESS: 'bg-amber-950 text-amber-400',
  IN_REVIEW:   'bg-purple-950 text-purple-400',
  DONE:        'bg-emerald-950 text-emerald-400',
}

// Badge base
'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium'
```

---

## PAGE LAYOUTS

### App Shell

```
┌──────────────────────────────────────────────────┐
│  Sidebar (w-60)  │  Main Content Area            │
│  ─────────────   │  ─────────────────────────    │
│  Logo            │  TopBar (h-14)                │
│  ─────────────   │  ─────────────────────────    │
│  Nav links       │                               │
│  • Dashboard     │  Page content scrolls here    │
│  • Projects      │                               │
│  • Settings      │                               │
│  ─────────────   │                               │
│  User avatar     │                               │
└──────────────────────────────────────────────────┘
```

```tsx
// AppLayout.tsx
<div className="flex h-screen bg-[#0f1117] text-[#f0f2f8] overflow-hidden">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0">
    <TopBar />
    <main className="flex-1 overflow-y-auto p-6">
      <Outlet />
    </main>
  </div>
</div>
```

### Sidebar

```tsx
// Active nav link
'flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1e2135] text-[#f0f2f8] text-sm font-medium'

// Inactive nav link
'flex items-center gap-3 px-3 py-2 rounded-lg text-[#8b92b3] hover:bg-[#1a1d27] hover:text-[#f0f2f8] text-sm transition-colors'
```

### Board Page (Kanban)

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar: [Project Name]  [Member avatars]  [Invite button]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ TODO ─────┐  ┌─ IN PROGRESS ┐  ┌─ IN REVIEW ─┐  ┌─ DONE ┐  │
│  │ [3]        │  │ [2]          │  │ [1]         │  │ [5]  │  │
│  │ ┌────────┐ │  │ ┌──────────┐ │  │ ┌─────────┐ │  │      │  │
│  │ │TaskCard│ │  │ │ TaskCard │ │  │ │TaskCard │ │  │      │  │
│  │ └────────┘ │  │ └──────────┘ │  │ └─────────┘ │  │      │  │
│  │ + Add Task │  │              │  │             │  │      │  │
│  └────────────┘  └──────────────┘  └─────────────┘  └──────┘  │
└──────────────────────────────────────────────────────────────┘
```

```tsx
// Board layout — horizontal scroll on narrow screens
<div className="flex gap-5 h-full overflow-x-auto pb-4">
  {columns.map(col => <TaskColumn key={col.status} ... />)}
</div>

// Column
<div className="flex-shrink-0 w-72 flex flex-col bg-[#13151f] rounded-xl border border-[#2e3148]">
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3148]">
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
      <span className="text-sm font-semibold text-[#f0f2f8]">{label}</span>
      <span className="text-xs font-mono bg-[#252836] text-[#8b92b3] px-1.5 py-0.5 rounded">
        {count}
      </span>
    </div>
  </div>
  {/* Task list */}
  <div className="flex-1 overflow-y-auto p-3 space-y-2">
    {tasks.map(task => <TaskCard key={task.id} task={task} />)}
  </div>
</div>
```

### Dashboard Page

```
┌─────────────────────────────────────────────────────┐
│  Stats Row                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Total   │ │In Prog  │ │ Overdue │ │  Done   │  │
│  │   24    │ │    7    │ │    3    │ │   14    │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                     │
│  Recent Projects (grid, max 6)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Project  │ │ Project  │ │ Project  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────┘
```

```tsx
// Stat card
<div className="bg-[#1a1d27] border border-[#2e3148] rounded-xl p-5">
  <p className="text-xs text-[#8b92b3] uppercase tracking-widest font-medium">{label}</p>
  <p className="text-3xl font-bold text-[#f0f2f8] mt-1 font-mono">{value}</p>
  <p className={`text-xs mt-1 ${trend > 0 ? 'text-emerald-400' : 'text-[#8b92b3]'}`}>
    {subtitle}
  </p>
</div>
```

---

## COLUMN INDICATOR COLORS

```typescript
export const columnConfig = {
  TODO: {
    label: 'To Do',
    dot:   'bg-slate-500',
    header:'text-slate-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    dot:   'bg-amber-400',
    header:'text-amber-400',
  },
  IN_REVIEW: {
    label: 'In Review',
    dot:   'bg-purple-400',
    header:'text-purple-400',
  },
  DONE: {
    label: 'Done',
    dot:   'bg-emerald-400',
    header:'text-emerald-400',
  },
}
```

---

## AUTH PAGES (Login / Register)

```tsx
// Centered single-column layout
<div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
  <div className="w-full max-w-sm">
    {/* Logo mark */}
    <div className="flex items-center gap-2 mb-8">
      <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
        <CheckSquare size={16} className="text-white" />
      </div>
      <span className="text-xl font-bold text-[#f0f2f8]">TaskFlow</span>
    </div>
    {/* Form card */}
    <div className="bg-[#1a1d27] border border-[#2e3148] rounded-2xl p-8">
      ...
    </div>
  </div>
</div>
```

---

## TASK CARD DESIGN

```tsx
// TaskCard.tsx visual spec
<div
  data-testid={`task-card-${task.title}`}
  className="bg-[#1a1d27] border border-[#2e3148] rounded-xl p-4 hover:border-[#6366f1]/40 cursor-pointer transition-all"
>
  {/* Priority badge top-right */}
  <div className="flex items-start justify-between gap-2 mb-3">
    <h4 className="text-sm font-medium text-[#f0f2f8] leading-snug">{task.title}</h4>
    <PriorityBadge priority={task.priority} />
  </div>

  {/* Footer: assignee + deadline */}
  <div className="flex items-center justify-between mt-3">
    {task.assignee && (
      <div className="flex items-center gap-1.5">
        <Avatar name={task.assignee.name} size="xs" />
        <span className="text-xs text-[#8b92b3]">{task.assignee.name}</span>
      </div>
    )}
    {task.deadline && (
      <span className={`text-xs font-mono ${isOverdue(task.deadline) ? 'text-red-400' : 'text-[#8b92b3]'}`}>
        {formatDeadline(task.deadline)}
      </span>
    )}
  </div>
</div>
```

---

## EMPTY STATE

```tsx
// EmptyState.tsx — shown on blank boards
<div
  data-testid="empty-board-state"
  className="flex flex-col items-center justify-center py-20 text-center"
>
  {/* Illustrated icon placeholder */}
  <div className="w-16 h-16 bg-[#1e2135] rounded-2xl flex items-center justify-center mb-4 border border-[#2e3148]">
    <ClipboardList size={28} className="text-[#4a5180]" />
  </div>
  <h3 className="text-sm font-semibold text-[#f0f2f8] mb-1">No tasks yet</h3>
  <p className="text-xs text-[#8b92b3]">Add your first task to get started</p>
</div>
```

---

## ICONS

Use `lucide-react` throughout:

```tsx
import {
  CheckSquare,    // Logo / branding
  LayoutDashboard,// Dashboard nav
  FolderKanban,   // Projects nav
  Users,          // Members
  Plus,           // Add buttons
  Trash2,         // Delete
  ChevronRight,   // Navigation
  AlertCircle,    // Errors
  ClipboardList,  // Empty state
  Calendar,       // Deadline
  Flag,           // Priority
  MoreHorizontal, // Context menus
} from 'lucide-react'
```

---

## ANIMATION GUIDELINES

```css
/* Fade-in for modals */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-enter { animation: fadeIn 0.15s ease-out; }

/* Slide-in for drawer */
@keyframes slideIn {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
.drawer-enter { animation: slideIn 0.2s ease-out; }
```

Tailwind classes for simple transitions:
```
transition-colors duration-150   → hover color changes
transition-all duration-200       → card hover effects
transition-opacity duration-150   → show/hide elements
```

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Use |
|---|---|
| `sm` (640px) | Stack auth forms |
| `md` (768px) | Collapse sidebar to icons |
| `lg` (1024px) | Full sidebar + board |
| `xl` (1280px) | Wider board columns |

Board is horizontal-scrollable on small screens — do not wrap columns vertically.

---

## DESIGN CHECKLIST

- [ ] Dark background `#0f1117` on all pages
- [ ] DM Sans font loaded via Google Fonts
- [ ] All status columns have correct color indicators
- [ ] Priority badges color-coded (low=gray, medium=blue, high=orange, critical=red)
- [ ] Overdue deadlines shown in red
- [ ] All interactive elements have hover + focus states
- [ ] Inputs have visible focus ring (`focus:ring-[#6366f1]/30`)
- [ ] Buttons disabled state: `opacity-50 cursor-not-allowed`
- [ ] `data-testid` attributes on all required elements (see Frontend Implementation SKILL)
- [ ] Empty board state uses `data-testid="empty-board-state"`
- [ ] Modals use backdrop blur overlay
- [ ] Mobile: board scrolls horizontally, sidebar collapses
