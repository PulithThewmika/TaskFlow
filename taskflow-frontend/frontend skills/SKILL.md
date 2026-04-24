# SKILL: Frontend Implementation — React 18 + TypeScript + Tailwind CSS
## TaskFlow | `taskflow-frontend/`

---

## OVERVIEW

This skill covers the complete implementation of the TaskFlow React frontend. Read the **Frontend Design SKILL** first for colors, typography, and component visual specs.

**Stack:** React 18 · TypeScript · Tailwind CSS · React Router v6 · Axios · Lucide React

---

## PROJECT STRUCTURE

```
taskflow-frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Router setup
│   ├── api/
│   │   ├── axiosInstance.ts        # Base axios + JWT interceptor
│   │   ├── authApi.ts
│   │   ├── projectApi.ts
│   │   ├── taskApi.ts
│   │   └── dashboardApi.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── AppLayout.tsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskColumn.tsx
│   │   │   ├── TaskBoard.tsx
│   │   │   ├── CreateTaskModal.tsx
│   │   │   └── TaskDetailDrawer.tsx
│   │   └── projects/
│   │       ├── ProjectCard.tsx
│   │       └── CreateProjectModal.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   └── BoardPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   └── useProjects.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── types/
│   │   ├── task.types.ts
│   │   ├── project.types.ts
│   │   └── auth.types.ts
│   └── utils/
│       ├── dateUtils.ts
│       └── statusUtils.ts
├── tests/e2e/
│   ├── task-board-flow.spec.ts
│   └── task-validation.spec.ts
├── playwright.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## PACKAGE.JSON

```json
{
  "name": "taskflow-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.363.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@playwright/test": "^1.42.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## TYPESCRIPT TYPES

```typescript
// src/types/auth.types.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
```

```typescript
// src/types/project.types.ts
export interface Project {
  id: number;
  name: string;
  description: string;
  colorTag: string;
  taskCount: number;
  members: ProjectMember[];
  createdAt: string;
}

export interface ProjectMember {
  id: number;
  userId: number;
  name: string;
  email: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  colorTag: string;
}
```

```typescript
// src/types/task.types.ts
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  assignee: { id: number; name: string; email: string } | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  assigneeId?: number;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}
```

---

## API LAYER

```typescript
// src/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to /login on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
```

```typescript
// src/api/authApi.ts
import axiosInstance from './axiosInstance';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<AuthResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<AuthResponse>('/auth/register', data).then(r => r.data),
};
```

```typescript
// src/api/projectApi.ts
import axiosInstance from './axiosInstance';
import type { Project, CreateProjectRequest } from '../types/project.types';

export const projectApi = {
  getAll: () =>
    axiosInstance.get<Project[]>('/projects').then(r => r.data),

  getById: (id: number) =>
    axiosInstance.get<Project>(`/projects/${id}`).then(r => r.data),

  create: (data: CreateProjectRequest) =>
    axiosInstance.post<Project>('/projects', data).then(r => r.data),

  delete: (id: number) =>
    axiosInstance.delete(`/projects/${id}`),

  getMembers: (id: number) =>
    axiosInstance.get(`/projects/${id}/members`).then(r => r.data),

  addMember: (id: number, email: string) =>
    axiosInstance.post(`/projects/${id}/members`, { email }).then(r => r.data),
};
```

```typescript
// src/api/taskApi.ts
import axiosInstance from './axiosInstance';
import type { Task, CreateTaskRequest } from '../types/task.types';

export const taskApi = {
  getByProject: (projectId: number, params?: Record<string, string>) =>
    axiosInstance.get<Task[]>(`/projects/${projectId}/tasks`, { params }).then(r => r.data),

  create: (projectId: number, data: CreateTaskRequest) =>
    axiosInstance.post<Task>(`/projects/${projectId}/tasks`, data).then(r => r.data),

  updateStatus: (taskId: number, status: string) =>
    axiosInstance.patch<Task>(`/tasks/${taskId}/status`, { status }).then(r => r.data),

  update: (taskId: number, data: Partial<CreateTaskRequest>) =>
    axiosInstance.patch<Task>(`/tasks/${taskId}`, data).then(r => r.data),

  delete: (taskId: number) =>
    axiosInstance.delete(`/tasks/${taskId}`),
};
```

```typescript
// src/api/dashboardApi.ts
import axiosInstance from './axiosInstance';

export interface DashboardStats {
  totalTasks: number;
  inProgressCount: number;
  overdueCount: number;
  doneCount: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  message: string;
  timestamp: string;
}

export const dashboardApi = {
  getStats: () =>
    axiosInstance.get<DashboardStats>('/dashboard/stats').then(r => r.data),
};
```

---

## AUTH CONTEXT

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

---

## ROUTER SETUP

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import BoardPage from './pages/BoardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id/board" element={<BoardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## KEY PAGES

### LoginPage

```tsx
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-xl font-bold text-[#f0f2f8]">TaskFlow</span>
        </div>

        <div className="bg-[#1a1d27] border border-[#2e3148] rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-[#f0f2f8] mb-6">Sign in</h1>

          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#8b92b3] mb-1.5">Email</label>
              <input
                data-testid="email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#252836] border border-[#2e3148] rounded-lg px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5180] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b92b3] mb-1.5">Password</label>
              <input
                data-testid="password-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#252836] border border-[#2e3148] rounded-lg px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5180] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f52d3] text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-[#8b92b3] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6366f1] hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### BoardPage

```tsx
// src/pages/BoardPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import TaskBoard from '../components/tasks/TaskBoard';
import type { Task } from '../types/task.types';

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskApi.getByProject(projectId)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    const updated = await taskApi.updateStatus(taskId, newStatus);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  };

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-[#8b92b3]">Loading...</div>;

  return (
    <TaskBoard
      tasks={tasks}
      projectId={projectId}
      onStatusChange={handleStatusChange}
      onTaskCreated={handleTaskCreated}
    />
  );
}
```

---

## KEY COMPONENTS

### TaskBoard

```tsx
// src/components/tasks/TaskBoard.tsx
import { useState } from 'react';
import TaskColumn from './TaskColumn';
import CreateTaskModal from './CreateTaskModal';
import type { Task, TaskStatus } from '../../types/task.types';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO',        label: 'To Do'       },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'IN_REVIEW',   label: 'In Review'   },
  { status: 'DONE',        label: 'Done'        },
];

interface Props {
  tasks: Task[];
  projectId: number;
  onStatusChange: (taskId: number, newStatus: string) => void;
  onTaskCreated: (task: Task) => void;
}

export default function TaskBoard({ tasks, projectId, onStatusChange, onTaskCreated }: Props) {
  const [showCreate, setShowCreate] = useState(false);

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status);

  const isEmpty = tasks.length === 0;

  if (isEmpty) {
    return (
      <div data-testid="empty-board-state" className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[#1e2135] rounded-2xl flex items-center justify-center mb-4 border border-[#2e3148]">
          <span className="text-[#4a5180] text-2xl">📋</span>
        </div>
        <h3 className="text-sm font-semibold text-[#f0f2f8] mb-1">No tasks yet</h3>
        <p className="text-xs text-[#8b92b3] mb-4">Add your first task to get started</p>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#4f52d3] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Task
        </button>
        {showCreate && (
          <CreateTaskModal
            projectId={projectId}
            onClose={() => setShowCreate(false)}
            onCreated={(task) => { onTaskCreated(task); setShowCreate(false); }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-full overflow-x-auto pb-4">
      {COLUMNS.map(col => (
        <TaskColumn
          key={col.status}
          status={col.status}
          label={col.label}
          tasks={tasksByStatus(col.status)}
          projectId={projectId}
          onStatusChange={onStatusChange}
          onTaskCreated={onTaskCreated}
        />
      ))}
    </div>
  );
}
```

### CreateTaskModal

```tsx
// src/components/tasks/CreateTaskModal.tsx
import { useState } from 'react';
import { taskApi } from '../../api/taskApi';
import type { Task, TaskPriority } from '../../types/task.types';

interface Props {
  projectId: number;
  onClose: () => void;
  onCreated: (task: Task) => void;
}

export default function CreateTaskModal({ projectId, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [titleError, setTitleError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('Title is required');
      valid = false;
    } else {
      setTitleError('');
    }
    if (deadline) {
      const chosen = new Date(deadline);
      const today  = new Date(); today.setHours(0,0,0,0);
      if (chosen < today) {
        setDeadlineError('Deadline cannot be in the past');
        valid = false;
      } else {
        setDeadlineError('');
      }
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const task = await taskApi.create(projectId, {
        title: title.trim(),
        priority,
        deadline: deadline || undefined,
      });
      onCreated(task);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1d27] border border-[#2e3148] rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between p-6 border-b border-[#2e3148]">
          <h2 className="text-base font-semibold text-[#f0f2f8]">New Task</h2>
          <button onClick={onClose} className="text-[#8b92b3] hover:text-[#f0f2f8]">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-[#8b92b3] mb-1.5">Title *</label>
            <input
              data-testid="task-title-input"
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
              className={`w-full bg-[#252836] border rounded-lg px-3 py-2 text-sm text-[#f0f2f8] placeholder-[#4a5180] focus:outline-none focus:ring-1 transition-colors ${
                titleError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-[#2e3148] focus:border-[#6366f1] focus:ring-[#6366f1]/30'
              }`}
              placeholder="Task title"
            />
            {titleError && (
              <p data-testid="title-error" className="text-xs text-red-400 mt-1">{titleError}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs text-[#8b92b3] mb-1.5">Priority</label>
            <select
              data-testid="task-priority-select"
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="w-full bg-[#252836] border border-[#2e3148] rounded-lg px-3 py-2 text-sm text-[#f0f2f8] focus:outline-none focus:border-[#6366f1]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs text-[#8b92b3] mb-1.5">Deadline</label>
            <input
              data-testid="task-deadline-input"
              type="date"
              value={deadline}
              onChange={e => { setDeadline(e.target.value); if (deadlineError) setDeadlineError(''); }}
              className={`w-full bg-[#252836] border rounded-lg px-3 py-2 text-sm text-[#f0f2f8] focus:outline-none focus:ring-1 transition-colors ${
                deadlineError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-[#2e3148] focus:border-[#6366f1] focus:ring-[#6366f1]/30'
              }`}
            />
            {deadlineError && (
              <p data-testid="deadline-error" className="text-xs text-red-400 mt-1">{deadlineError}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-medium text-[#8b92b3] hover:text-[#f0f2f8] border border-[#2e3148] rounded-lg hover:bg-[#252836] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2 text-sm font-medium bg-[#6366f1] hover:bg-[#4f52d3] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## UTILITY FUNCTIONS

```typescript
// src/utils/dateUtils.ts
export function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date(new Date().setHours(0, 0, 0, 0));
}

export function formatDeadline(deadline: string): string {
  const d = new Date(deadline);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
```

```typescript
// src/utils/statusUtils.ts
import type { TaskStatus } from '../types/task.types';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW:   'In Review',
  DONE:        'Done',
};

export const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  TODO:        'IN_PROGRESS',
  IN_PROGRESS: 'IN_REVIEW',
  IN_REVIEW:   'DONE',
};

export function getNextStatusLabel(status: TaskStatus): string | null {
  const next = NEXT_STATUS[status];
  return next ? STATUS_LABELS[next] : null;
}
```

---

## data-testid REQUIREMENTS (Critical for Playwright Tests)

Every element listed here **must** have its `data-testid` attribute — Playwright tests depend on them:

| Component | Required data-testid |
|---|---|
| LoginPage | `email-input`, `password-input` |
| CreateProjectModal | `project-name-input`, `project-desc-input` |
| CreateTaskModal | `task-title-input`, `task-priority-select`, `task-deadline-input` |
| CreateTaskModal | `title-error`, `deadline-error` |
| TaskBoard (empty) | `empty-board-state` |
| TaskColumn | `column-TODO`, `column-IN_PROGRESS`, `column-IN_REVIEW`, `column-DONE` |
| TaskCard | `task-card-{task.title}` ← dynamic, uses actual title |

---

## SETUP COMMANDS

```bash
# Create project
npm create vite@latest taskflow-frontend -- --template react-ts
cd taskflow-frontend

# Install dependencies
npm install react-router-dom axios lucide-react clsx
npm install -D tailwindcss postcss autoprefixer @playwright/test

# Init Tailwind
npx tailwindcss init -p

# Install Playwright browser
npx playwright install chromium

# Start dev server
npm run dev
```

---

## IMPLEMENTATION CHECKLIST

### API Layer
- [ ] `axiosInstance.ts` — baseURL, JWT interceptor, 401 redirect
- [ ] `authApi.ts` — login, register
- [ ] `projectApi.ts` — getAll, getById, create, delete, members
- [ ] `taskApi.ts` — getByProject, create, updateStatus, update, delete
- [ ] `dashboardApi.ts` — getStats

### Auth
- [ ] `AuthContext.tsx` — user, token, login(), logout(), isAuthenticated
- [ ] `ProtectedRoute` — redirects to /login if not authenticated
- [ ] Token persisted to `localStorage`

### Pages
- [ ] `LoginPage` — `data-testid="email-input"`, `data-testid="password-input"`, error `role="alert"`
- [ ] `RegisterPage` — name, email, password, confirm-password, validation
- [ ] `DashboardPage` — 4 stat cards, projects grid
- [ ] `ProjectsPage` — project grid + CreateProjectModal
- [ ] `BoardPage` — loads tasks, passes to TaskBoard

### Components
- [ ] `TaskBoard` — renders 4 TaskColumns, shows `empty-board-state` when no tasks
- [ ] `TaskColumn` — `data-testid="column-{STATUS}"`, Add Task button on TODO column
- [ ] `TaskCard` — `data-testid="task-card-{title}"`, Move button
- [ ] `CreateTaskModal` — all testids, validation errors, "Creating..." state
- [ ] `CreateProjectModal` — `project-name-input`, `project-desc-input`

### Routing
- [ ] `/login` → LoginPage (public)
- [ ] `/register` → RegisterPage (public)
- [ ] `/dashboard` → DashboardPage (protected)
- [ ] `/projects` → ProjectsPage (protected)
- [ ] `/projects/:id/board` → BoardPage (protected)
