export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Column {
  id: TaskStatus;
  label: string;
  color: string;
  light: string;
}

export interface PriorityMeta {
  label: string;
  color: string;
  bg: string;
  dot: string;
  darkBg: string;
  darkColor: string;
}

export const COLUMNS: Column[] = [
  { id: 'TODO', label: 'To Do', color: '#6366f1', light: '#eef2ff' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b', light: '#fffbeb' },
  { id: 'IN_REVIEW', label: 'In Review', color: '#8b5cf6', light: '#f5f3ff' },
  { id: 'DONE', label: 'Done', color: '#10b981', light: '#ecfdf5' },
];

export const P: Record<TaskPriority, PriorityMeta> = {
  LOW: {
    label: 'Low',
    color: '#059669',
    bg: '#d1fae5',
    dot: '#10b981',
    darkBg: '#10b98118',
    darkColor: '#6ee7b7',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#d97706',
    bg: '#fef3c7',
    dot: '#f59e0b',
    darkBg: '#f59e0b18',
    darkColor: '#fcd34d',
  },
  HIGH: {
    label: 'High',
    color: '#ea580c',
    bg: '#ffedd5',
    dot: '#f97316',
    darkBg: '#f9731618',
    darkColor: '#fb923c',
  },
  CRITICAL: {
    label: 'Critical',
    color: '#dc2626',
    bg: '#fee2e2',
    dot: '#ef4444',
    darkBg: '#ef444418',
    darkColor: '#f87171',
  },
};


export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW', 'TODO'],
  IN_REVIEW: ['DONE', 'IN_PROGRESS'],
  DONE: [],
};

export const FEATURES = [
  { icon: '⬡', title: 'Kanban Board', desc: 'Drag tasks across TODO -> IN_PROGRESS -> IN_REVIEW -> DONE with enforced transition rules.' },
  { icon: '⬡', title: 'JWT Security', desc: 'Spring Security filter chain with role-based access. Protected routes on both frontend and backend.' },
  { icon: '⬡', title: 'Real-time Activity', desc: 'Live feed of team actions via server-sent events. Know what your team is working on instantly.' },
  { icon: '⬡', title: 'Smart Deadlines', desc: 'Automatic overdue detection. Visual alerts for tasks past their deadline across all dashboards.' },
  { icon: '⬡', title: 'E2E Test Coverage', desc: 'Playwright test suite covers the full user journey - login, project create, task CRUD, board moves.' },
  { icon: '⬡', title: 'Team Collaboration', desc: 'Invite members by email, assign tasks, track contributions per person with avatar groups.' },
] as const;

export const TECH = [
  { name: 'Spring Boot', role: 'REST API + Security', color: '#6db33f' },
  { name: 'React 18', role: 'Frontend UI', color: '#61dafb' },
  { name: 'MySQL', role: 'Production DB', color: '#4479a1' },
  { name: 'JWT', role: 'Auth Tokens', color: '#d63aff' },
  { name: 'Playwright', role: 'E2E Testing', color: '#2ead33' },
  { name: 'JUnit 5', role: 'Unit + Mockito', color: '#f59e0b' },
  { name: 'Tailwind CSS', role: 'Styling', color: '#06b6d4' },
  { name: 'GitHub CI/CD', role: 'Deployment', color: '#f0f0f0' },
] as const;

export const isOverdue = (d: string | null, s: TaskStatus): boolean => {
  if (!d || s === 'DONE') return false;
  return new Date(d) < new Date();
};

export const fmtDate = (d: string | null): string | null => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const daysUntil = (d: string | null): number | null => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - new Date().getTime()) / 86400000);
};
