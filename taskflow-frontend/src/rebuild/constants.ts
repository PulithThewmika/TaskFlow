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

export interface AvatarUser {
  id: number;
  name: string;
  color: string;
  initials: string;
}

export interface ProjectItem {
  id: number;
  name: string;
  color: string;
  members: number;
  tag: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number | null;
  deadline: string | null;
  projectId: number;
  createdAt: string;
}

export interface ActivityItem {
  id: number;
  user: string;
  action: string;
  target: string;
  to: TaskStatus | null;
  time: string;
  avatar: AvatarUser;
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

export const AVATARS: AvatarUser[] = [
  { id: 1, name: 'Pmax', color: '#6366f1', initials: 'PM' },
  { id: 2, name: 'Sarah', color: '#ec4899', initials: 'SK' },
  { id: 3, name: 'Ravi', color: '#f59e0b', initials: 'RK' },
  { id: 4, name: 'Lena', color: '#10b981', initials: 'LT' },
];

export const PROJECTS: ProjectItem[] = [
  { id: 1, name: 'TaskFlow Platform', color: '#6366f1', members: 4, tag: 'Core' },
  { id: 2, name: 'Mobile App', color: '#ec4899', members: 3, tag: 'Mobile' },
  { id: 3, name: 'API Gateway', color: '#f59e0b', members: 2, tag: 'Infra' },
];

export const SEED_TASKS: TaskItem[] = [
  { id: 1, title: 'Design system tokens', description: 'Set up color, spacing, and typography tokens in Figma and export to CSS.', status: 'DONE', priority: 'HIGH', assigneeId: 1, deadline: '2025-04-10', projectId: 1, createdAt: '2025-03-28' },
  { id: 2, title: 'JWT auth middleware', description: 'Implement Spring Security filter chain with JWT validation and role-based access.', status: 'DONE', priority: 'CRITICAL', assigneeId: 3, deadline: '2025-04-12', projectId: 1, createdAt: '2025-03-29' },
  { id: 3, title: 'Kanban drag & drop', description: 'Integrate DnD kit for smooth task column transitions with optimistic UI updates.', status: 'IN_REVIEW', priority: 'HIGH', assigneeId: 1, deadline: '2025-04-28', projectId: 1, createdAt: '2025-04-01' },
  { id: 4, title: 'Playwright E2E suite', description: 'Write full user journey tests covering login, project create, task CRUD, and board moves.', status: 'IN_REVIEW', priority: 'MEDIUM', assigneeId: 2, deadline: '2025-04-30', projectId: 1, createdAt: '2025-04-02' },
  { id: 5, title: 'Dashboard stats API', description: 'Build /api/dashboard/stats endpoint aggregating task counts by status and overdue detection.', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: 3, deadline: '2025-05-03', projectId: 1, createdAt: '2025-04-05' },
  { id: 6, title: 'Notification service', description: 'Email + in-app notifications for task assignments, deadline reminders, and status changes.', status: 'IN_PROGRESS', priority: 'LOW', assigneeId: 4, deadline: '2025-05-10', projectId: 1, createdAt: '2025-04-06' },
  { id: 7, title: 'Member invite flow', description: 'Email invite with secure token-based onboarding and project role assignment.', status: 'TODO', priority: 'MEDIUM', assigneeId: 2, deadline: '2025-05-15', projectId: 1, createdAt: '2025-04-07' },
  { id: 8, title: 'Activity feed', description: 'Real-time feed of last 10 project actions using server-sent events or WebSocket.', status: 'TODO', priority: 'LOW', assigneeId: null, deadline: '2025-05-20', projectId: 1, createdAt: '2025-04-08' },
  { id: 9, title: 'File attachments', description: 'Allow uploading screenshots and documents to tasks with S3/R2 storage backend.', status: 'TODO', priority: 'LOW', assigneeId: null, deadline: '2025-05-25', projectId: 1, createdAt: '2025-04-09' },
];

export const ACTIVITY: ActivityItem[] = [
  { id: 1, user: 'Pmax', action: 'moved', target: 'Kanban drag & drop', to: 'IN_REVIEW', time: '2m ago', avatar: AVATARS[0] },
  { id: 2, user: 'Sarah', action: 'completed', target: 'Playwright E2E suite', to: null, time: '18m ago', avatar: AVATARS[1] },
  { id: 3, user: 'Ravi', action: 'created', target: 'Notification service', to: null, time: '1h ago', avatar: AVATARS[2] },
  { id: 4, user: 'Lena', action: 'assigned', target: 'Activity feed', to: null, time: '3h ago', avatar: AVATARS[3] },
  { id: 5, user: 'Pmax', action: 'updated priority of', target: 'JWT auth middleware', to: null, time: '5h ago', avatar: AVATARS[0] },
];

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

export const STATS_HERO = [
  { value: '9+', label: 'Tasks Managed' },
  { value: '4', label: 'Team Members' },
  { value: '3', label: 'Active Projects' },
  { value: '100%', label: 'Test Coverage' },
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
