import { isAxiosError } from 'axios';
import { useEffect, useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { getDashboardStats, type DashboardStats } from '../api/dashboardApi';
import { getProjectMembers, addProjectMember, removeProjectMember, type ProjectMember } from '../api/memberApi';
import { getAllTasks } from '../api/taskApi';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import type { CreateProjectPayload, Project } from '../types/project.types';
import type { CreateTaskPayload, Task, TaskPriority, TaskStatus } from '../types/task.types';
import { COLUMNS, FEATURES, P, TECH, VALID_TRANSITIONS, daysUntil, fmtDate, isOverdue } from './constants';
import { GLOBAL_CSS } from './styles';

type Page = 'landing' | 'login' | 'register' | 'app';
type View = 'dashboard' | 'projects' | 'board';

interface MemberAvatar {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface ToastItem {
  id: string;
  message: string;
  kind: 'success' | 'error';
}

const HERO_STATS = [
  { value: 'Real API', label: 'Backend Connected' },
  { value: 'JWT', label: 'Auth Enabled' },
  { value: 'Mongo IDs', label: 'String-based Model' },
  { value: 'Live', label: 'Project & Task Data' },
] as const;

const PROJECT_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#8b5cf6', '#ef4444'];

function stringToColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = value.charCodeAt(i) + ((hash << 5) - hash);
  const palette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#8b5cf6', '#ef4444'];
  return palette[Math.abs(hash) % palette.length];
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function StyleTag({ dark }: { dark: boolean }) {
  useEffect(() => {
    const s = document.createElement('style');
    s.id = 'tf-global-styles';
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => document.getElementById('tf-global-styles')?.remove();
  }, []);
  return <div data-theme={dark ? 'dark' : 'light'} />;
}

const ThemeToggle = ({ dark, toggle }: { dark: boolean; toggle: () => void }) => <button className="theme-toggle" onClick={toggle}>{dark ? '☀️' : '🌙'}</button>;
const LogoMark = ({ size = 34 }: { size?: number }) => <div className="logo-mark" style={{ width: size, height: size, borderRadius: size * 0.29, fontSize: size * 0.47 }}>T</div>;

function Avatar({ user, size = 28 }: { user?: MemberAvatar; size?: number }) {
  return <div className="tc-av" style={{ width: size, height: size, fontSize: size * 0.38, background: `${user?.color ?? '#6366f1'}28`, color: user?.color ?? '#6366f1', borderRadius: size * 0.27 }}>{user?.initials ?? '?'}</div>;
}

function PBadge({ priority, dark }: { priority: TaskPriority; dark: boolean }) {
  const m = P[priority] ?? P.MEDIUM;
  return <span className="p-badge" style={{ background: dark ? m.darkBg : m.bg, color: dark ? m.darkColor : m.color }}><span className="p-dot" style={{ background: m.dot }} />{m.label}</span>;
}

function DLChip({ deadline, status }: { deadline: string | null; status: TaskStatus }) {
  if (!deadline) return null;
  const ov = isOverdue(deadline, status);
  const d = daysUntil(deadline);
  const soon = !ov && d !== null && d <= 3 && status !== 'DONE';
  return <span className={`dl-chip${ov ? ' ov' : soon ? ' soon' : ''}`}>{ov ? '⚠' : '📅'} {fmtDate(deadline)}</span>;
}

function TaskCard({ task, onClick, dark, onDragStart, members }: { task: Task; onClick: (task: Task) => void; dark: boolean; onDragStart: (e: DragEvent<HTMLDivElement>, id: string) => void; members: MemberAvatar[] }) {
  const assignee = members.find((a) => a.id === task.assigneeId);
  const m = P[task.priority] ?? P.MEDIUM;
  return (
    <div className="task-card" draggable onDragStart={(e) => onDragStart(e, task.id)} onClick={() => onClick(task)}>
      <div className="tc-bar" style={{ background: m.dot }} />
      <div className="tc-title">{task.title}</div>
      {task.description && <div className="tc-desc">{task.description}</div>}
      <div className="tc-foot"><PBadge priority={task.priority} dark={dark} /><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><DLChip deadline={task.deadline} status={task.status} />{assignee && <Avatar user={assignee} size={22} />}</div></div>
    </div>
  );
}

function AuthPage({ mode, onSubmit, onToggle, dark, toggleDark, loading, error, onBack }: { mode: 'login' | 'register'; onSubmit: (form: { name?: string; email: string; password: string; confirmPassword?: string }) => Promise<void>; onToggle: () => void; dark: boolean; toggleDark: () => void; loading: boolean; error: string | null; onBack: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [validationError, setValidationError] = useState<string | null>(null);
  const submit = async () => {
    setValidationError(null);
    if (!form.email || !form.password || (mode === 'register' && !form.name)) return setValidationError('All required fields must be completed.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setValidationError('Enter a valid email address.');
    if (mode === 'register') {
      if (form.password.length < 6) return setValidationError('Password must be at least 6 characters.');
      if (form.password !== form.confirmPassword) return setValidationError('Passwords do not match.');
    }
    await onSubmit(form);
  };
  return (
    <div className="login-page">
      <div className="login-glow-1" />
      <div className="login-glow-2" />
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <ThemeToggle dark={dark} toggle={toggleDark} />
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Landing</button>
      </div>
      <div style={{ width: 400, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}><LogoMark size={52} /><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, marginTop: 14, marginBottom: 6 }}>TaskFlow</div><div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}</div></div>
        <div className="login-card">
          {mode === 'register' && <div className="field"><label className="field-label">Name</label><input className="field-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>}
          <div className="field"><label className="field-label">Email</label><input className="field-input" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
          <div className="field"><label className="field-label">Password</label><input className="field-input" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} /></div>
          {mode === 'register' && <div className="field"><label className="field-label">Confirm Password</label><input className="field-input" type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} /></div>}
          {(validationError || error) && <div className="app-error">{validationError ?? error}</div>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, marginTop: 8 }} onClick={submit} disabled={loading}>{loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign in -&gt;' : 'Create account -&gt;')}</button>
          <button className="auth-toggle-btn" onClick={onToggle}>{mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}</button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, dark, toggleDark, projects, onLogout, userName }: { view: View; setView: (v: View) => void; dark: boolean; toggleDark: () => void; projects: Project[]; onLogout: () => void; userName: string }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo"><LogoMark /><div><div className="logo-name">TaskFlow</div><div className="logo-sub">Live API Mode</div></div></div>
      <div className="sb-nav">
        <div className="sb-sec-label">Menu</div>
        {(['dashboard', 'projects', 'board'] as const).map((item) => <div key={item} className={`sb-item${view === item ? ' active' : ''}`} onClick={() => setView(item)}><span className="sb-icon">{item === 'dashboard' ? '⊞' : item === 'projects' ? '◈' : '⊟'}</span><span>{item === 'dashboard' ? 'Dashboard' : item === 'projects' ? 'Projects' : 'Board'}</span></div>)}
        <div className="sb-sec-label" style={{ marginTop: 14 }}>Projects</div>
        {projects.map((p) => <div key={p.id} className={`sb-item${view === 'board' ? ' active' : ''}`} onClick={() => setView('board')}><span className="pdot" style={{ background: p.colorTag || '#6366f1' }} /><span style={{ fontSize: 13 }}>{p.name}</span></div>)}
        <div className="sb-sec-label" style={{ marginTop: 14 }}>Navigation</div>
        <div className="sb-item" onClick={onLogout}><span className="sb-icon">↪</span><span>Logout</span></div>
      </div>
      <div className="sb-footer"><div style={{ padding: '0 2px 8px' }}><ThemeToggle dark={dark} toggle={toggleDark} /></div><div className="user-row"><div className="u-av" style={{ background: '#6366f128', color: '#818cf8' }}>{initialsFromName(userName)}</div><div><div className="u-name">{userName}</div><div className="u-role">Authenticated User</div></div></div></div>
    </div>
  );
}

export default function RebuildApp() {
  const { login, register, loading: authLoading, error: authError } = useAuth();
  const { projects, loading: projectsLoading, error: projectsError, addProject, removeProject } = useProjects();
  const [page, setPage] = useState<Page>(localStorage.getItem('token') ? 'app' : 'landing');
  const [view, setView] = useState<View>('dashboard');
  const [dark, setDark] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [members, setMembers] = useState<MemberAvatar[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [allTasksLoading, setAllTasksLoading] = useState(false);
  const [allTasksError, setAllTasksError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const effectivePage: Page = page === 'app' && !localStorage.getItem('token') ? 'login' : page;
  const effectiveProjectId = selectedProjectId || projects[0]?.id || '';
  const { tasks, loading: tasksLoading, error: tasksError, addTask, changeStatus, removeTask } = useTasks(effectiveProjectId);
  useEffect(() => {
    if (!effectiveProjectId || effectivePage !== 'app') return;
    const loadMembers = async () => {
      try {
        setMembersLoading(true); setMembersError(null);
        const data = await getProjectMembers(effectiveProjectId);
        setMembers(data.map((m: ProjectMember) => ({ id: m.user.id, name: m.user.name, initials: initialsFromName(m.user.name), color: stringToColor(m.user.id) })));
      } catch (err) {
        setMembersError(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to fetch project members' : 'Failed to fetch project members');
      } finally { setMembersLoading(false); }
    };
    void loadMembers();
  }, [effectiveProjectId, effectivePage]);
  useEffect(() => {
    if (effectivePage !== 'app') return;
    const loadDashboard = async () => {
      try {
        setDashboardLoading(true); setDashboardError(null); setAllTasksLoading(true); setAllTasksError(null);
        const [stats, allTasks] = await Promise.all([getDashboardStats(), getAllTasks()]);
        setDashboardStats(stats);
        setRecentTasks(allTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8));
      } catch (err) {
        const message = isAxiosError(err) ? err.response?.data?.message ?? 'Failed to fetch dashboard data' : 'Failed to fetch dashboard data';
        setDashboardError(message); setAllTasksError(message);
      } finally { setDashboardLoading(false); setAllTasksLoading(false); }
    };
    void loadDashboard();
  }, [effectivePage, projects.length, tasks.length]);

  const pushToast = (message: string, kind: ToastItem['kind']) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const selectedProject = useMemo(() => projects.find((p) => p.id === effectiveProjectId) ?? null, [projects, effectiveProjectId]);
  const toggleDark = () => setDark((d) => !d);
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('userName'); localStorage.removeItem('userEmail'); setPage('login'); pushToast('Logged out successfully', 'success'); };

  const handleLogin = async (form: { email: string; password: string }) => {
    const response = await login(form);
    if (!response) return;
    localStorage.setItem('userName', response.name);
    localStorage.setItem('userEmail', response.email);
    setPage('app');
    pushToast('Welcome back!', 'success');
  };

  const handleRegister = async (form: { name?: string; email: string; password: string }) => {
    const response = await register({ name: form.name || '', email: form.email, password: form.password });
    if (!response) return;
    pushToast('Registration successful. Please sign in.', 'success');
    setPage('login');
  };

  const createProjectHandler = async (payload: CreateProjectPayload) => {
    try { const project = await addProject(payload); setSelectedProjectId(project.id); pushToast('Project created successfully', 'success'); }
    catch (err) { pushToast(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to create project' : 'Failed to create project', 'error'); }
  };

  const createTaskHandler = async (payload: CreateTaskPayload) => {
    try { await addTask(payload); pushToast('Task created successfully', 'success'); }
    catch (err) { pushToast(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to create task' : 'Failed to create task', 'error'); }
  };

  const statusChangeHandler = async (taskId: string, status: TaskStatus) => {
    try { await changeStatus(taskId, status); pushToast('Task status updated', 'success'); }
    catch (err) { pushToast(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to update status' : 'Failed to update status', 'error'); }
  };

  const deleteTaskHandler = async (taskId: string) => {
    try { await removeTask(taskId); pushToast('Task deleted', 'success'); }
    catch (err) { pushToast(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete task' : 'Failed to delete task', 'error'); }
  };

  const reloadMembers = async () => {
    if (!effectiveProjectId) return;
    try {
      const data = await getProjectMembers(effectiveProjectId);
      setMembers(data.map((m: ProjectMember) => ({ id: m.user.id, name: m.user.name, initials: initialsFromName(m.user.name), color: stringToColor(m.user.id) })));
    } catch { /* silently fail */ }
  };

  const addMemberHandler = async (email: string) => {
    try { await addProjectMember(effectiveProjectId, email); await reloadMembers(); pushToast('Member added successfully', 'success'); }
    catch (err) { pushToast(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to add member' : 'Failed to add member', 'error'); throw err; }
  };

  const removeMemberHandler = async (userId: string) => {
    try { await removeProjectMember(effectiveProjectId, userId); await reloadMembers(); pushToast('Member removed', 'success'); }
    catch (err) { pushToast(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to remove member' : 'Failed to remove member', 'error'); }
  };

  const deleteProjectHandler = async (projectId: string) => {
    try { await removeProject(projectId); if (selectedProjectId === projectId) setSelectedProjectId(''); setView('projects'); pushToast('Project deleted', 'success'); }
    catch (err) { pushToast(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete project' : 'Failed to delete project', 'error'); }
  };

  return (
    <div data-theme={dark ? 'dark' : 'light'} style={{ height: '100%' }}>
      <StyleTag dark={dark} />
      {effectivePage === 'landing' && (
        <div className="land" data-theme={dark ? 'dark' : 'light'}>
          <nav className="land-nav"><div className="land-nav-logo"><LogoMark size={32} /><span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginLeft: 8 }}>TaskFlow</span></div><div className="land-nav-links"><span className="land-nav-link">Features</span><span className="land-nav-link">Tech Stack</span><span className="land-nav-link">Workflow</span></div><div className="land-nav-actions"><ThemeToggle dark={dark} toggle={toggleDark} /><button className="btn btn-ghost btn-sm" onClick={() => setPage('login')}>Sign in</button><button className="btn btn-primary btn-sm" onClick={() => setPage(localStorage.getItem('token') ? 'app' : 'login')}>Launch App -&gt;</button></div></nav>
          <section className="land-hero"><div className="land-hero-bg" /><div className="land-hero-grid" /><div className="land-badge"><span className="land-badge-dot" />Built for modern product teams</div><h1 className="land-h1">Ship features,<br />not <span className="land-h1-accent">spreadsheets.</span></h1><p className="land-sub">TaskFlow helps teams plan, prioritize, and deliver work faster with a clean collaborative workspace.</p><div className="land-ctas"><button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }} onClick={() => setPage('register')}>Create Account -&gt;</button><button className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 15 }} onClick={() => setPage('login')}>Sign In</button></div></section>
          <div className="land-stats">{HERO_STATS.map((s) => <div key={s.label} className="land-stat-item"><div className="land-stat-val">{s.value}</div><div className="land-stat-label">{s.label}</div></div>)}</div>
          <section className="land-features"><div className="land-section-tag">✦ Features</div><h2 className="land-section-h2">Everything your team needs</h2><p className="land-section-sub">A production-grade task management system with backend auth and persistent project data.</p><div className="feat-grid">{FEATURES.map((f) => <div key={f.title} className="feat-card"><div className="feat-icon">{f.icon}</div><div className="feat-title">{f.title}</div><div className="feat-desc">{f.desc}</div></div>)}</div></section>
          <section className="land-tech"><div className="land-section-tag">✦ Tech Stack</div><h2 className="land-section-h2">Built on proven technology</h2><p className="land-section-sub">Industry-standard tools across backend, frontend, database, auth, and testing.</p><div className="tech-grid">{TECH.map((t) => <div key={t.name} className="tech-chip"><span className="tech-dot" style={{ background: t.color }} /><div><div className="tech-name">{t.name}</div><div className="tech-role">{t.role}</div></div></div>)}</div></section>
        </div>
      )}
      {effectivePage === 'login' && <AuthPage mode="login" dark={dark} toggleDark={toggleDark} loading={authLoading} error={authError} onBack={() => setPage('landing')} onToggle={() => setPage('register')} onSubmit={(f) => handleLogin({ email: f.email, password: f.password })} />}
      {effectivePage === 'register' && <AuthPage mode="register" dark={dark} toggleDark={toggleDark} loading={authLoading} error={authError} onBack={() => setPage('landing')} onToggle={() => setPage('login')} onSubmit={(f) => handleRegister({ name: f.name, email: f.email, password: f.password })} />}
      {effectivePage === 'app' && (
        <div className="app-shell">
          <Sidebar view={view} setView={setView} dark={dark} toggleDark={toggleDark} projects={projects} onLogout={logout} userName={localStorage.getItem('userName') || 'User'} />
          <div className="main-area">
            <div className="topbar"><div style={{ flex: 1 }}><div className="topbar-ttl">{view === 'dashboard' ? 'Overview' : view === 'projects' ? 'Projects' : 'Kanban Board'}</div><div className="topbar-sub">{selectedProject?.name ?? 'No project selected'}</div></div><div className="topbar-actions">{dashboardStats && dashboardStats.overdueCount > 0 && <div className="overdue-pill">⚠ {dashboardStats.overdueCount} overdue</div>}<ThemeToggle dark={dark} toggle={toggleDark} /></div></div>
            <div className="content-area">
              {(projectsLoading || dashboardLoading || allTasksLoading) && <div className="loading-state"><div className="spinner" /><span>Loading data...</span></div>}
              {(projectsError || dashboardError || allTasksError || tasksError || membersError) && <div className="app-error">{projectsError || dashboardError || allTasksError || tasksError || membersError}</div>}
              {!projectsLoading && !dashboardLoading && !allTasksLoading && view === 'dashboard' && (
                <div className="page-wrap">
                  <div style={{ marginBottom: 26 }}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 5 }}>Welcome, {localStorage.getItem('userName') || 'User'} ✦</div><div style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Live dashboard stats from backend API.</div></div>
                  <div className="stats-grid">{[{ label: 'Total Tasks', value: dashboardStats?.totalTasks ?? 0, icon: '📋', c: '#6366f1', sub: `${dashboardStats?.doneCount ?? 0} done` }, { label: 'In Progress', value: dashboardStats?.inProgressCount ?? 0, icon: '⚡', c: '#f59e0b', sub: `${dashboardStats?.inReviewCount ?? 0} in review` }, { label: 'Overdue', value: dashboardStats?.overdueCount ?? 0, icon: '⚠️', c: '#ef4444', sub: (dashboardStats?.overdueCount ?? 0) > 0 ? 'Needs attention' : 'All on track' }, { label: 'Done', value: dashboardStats?.doneCount ?? 0, icon: '✓', c: '#10b981', sub: `of ${dashboardStats?.totalTasks ?? 0} tasks` }].map((s) => <div key={s.label} className="stat-card" style={{ '--c': s.c } as CSSProperties}><div className="stat-glow" /><div className="stat-icon">{s.icon}</div><div className="stat-label">{s.label}</div><div className="stat-val" style={{ color: s.c }}>{s.value}</div><div className="stat-sub">{s.sub}</div></div>)}</div>
                  <div className="sec-hdr"><div className="sec-ttl">Projects</div><button className="btn btn-ghost btn-sm" onClick={() => setView('projects')}>View all</button></div>
                  <div className="proj-grid">{projects.map((p) => <div key={p.id} className="proj-card" style={{ '--pc': p.colorTag || '#6366f1' } as CSSProperties} onClick={() => { setSelectedProjectId(p.id); setView('board'); }}><div className="proj-name">{p.name}</div><span className="proj-tag">{p.memberCount} members</span></div>)}</div>
                  <div className="sec-hdr"><div className="sec-ttl">Recent Tasks</div><span className="chip">Live Data</span></div>
                  <div className="act-list">{recentTasks.length === 0 ? <div className="empty-state">No recent tasks available.</div> : recentTasks.map((task) => <div key={task.id} className="act-item"><div className="act-txt"><strong>{task.title}</strong> in {task.status.replace('_', ' ')}</div><div className="act-time">{fmtDate(task.updatedAt)}</div></div>)}</div>
                </div>
              )}
              {!projectsLoading && view === 'projects' && (
                <ProjectsPanel
                  projects={projects}
                  selectedProjectId={effectiveProjectId}
                  setSelectedProjectId={setSelectedProjectId}
                  onCreateProject={createProjectHandler}
                  onDeleteProject={deleteProjectHandler}
                  setView={setView}
                />
              )}
              {!projectsLoading && view === 'board' && (
                <BoardPanel
                  tasks={tasks}
                  tasksLoading={tasksLoading}
                  dark={dark}
                  members={members}
                  membersLoading={membersLoading}
                  selectedProject={selectedProject}
                  setSelectedProjectId={setSelectedProjectId}
                  projects={projects}
                  onCreateTask={createTaskHandler}
                  onChangeStatus={statusChangeHandler}
                  onDeleteTask={deleteTaskHandler}
                  onAddMember={addMemberHandler}
                  onRemoveMember={removeMemberHandler}
                />
              )}
            </div>
          </div>
          <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.kind}`}>{t.message}</div>)}</div>
        </div>
      )}
    </div>
  );
}

function ProjectsPanel({ projects, selectedProjectId, setSelectedProjectId, onCreateProject, onDeleteProject, setView }: { projects: Project[]; selectedProjectId: string; setSelectedProjectId: (id: string) => void; onCreateProject: (payload: CreateProjectPayload) => Promise<void>; onDeleteProject: (id: string) => Promise<void>; setView: (view: View) => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', colorTag: '#6366f1' });
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}><div><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800 }}>Projects</div><div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{projects.length} active projects</div></div><button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button></div>
      <div className="projects-grid">{projects.map((p) => <div key={p.id} className="prj-card-wrap"><div className={`prj-card${selectedProjectId === p.id ? ' active-prj' : ''}`} style={{ '--pc': p.colorTag || '#6366f1' } as CSSProperties} onClick={() => { setSelectedProjectId(p.id); setView('board'); }}><div className="prj-card-name">{p.name}</div><span className="prj-tag" style={{ background: `${p.colorTag || '#6366f1'}18`, color: p.colorTag || '#6366f1' }}>{p.memberCount} members</span><div className="prog-bar-wrap"><div className="prog-bar" style={{ width: `${Math.min(100, p.taskCount * 10)}%`, background: p.colorTag || '#6366f1' }} /></div></div><button className="prj-delete-btn" title="Delete project" onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}>🗑</button></div>)}</div>
      {showCreate && <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}><div className="modal"><div className="modal-ttl">New Project</div><div className="field"><label className="field-label">Project Name *</label><input className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div><div className="field"><label className="field-label">Description</label><textarea className="field-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div><div className="field"><label className="field-label">Color Tag</label><div className="color-picker">{PROJECT_COLORS.map((c) => <button key={c} className={`color-swatch${form.colorTag === c ? ' selected' : ''}`} style={{ background: c }} onClick={() => setForm((f) => ({ ...f, colorTag: c }))} />)}</div></div><div className="modal-foot"><button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={async () => { if (!form.name.trim()) return; await onCreateProject({ name: form.name.trim(), description: form.description.trim() || undefined, colorTag: form.colorTag }); setShowCreate(false); setForm({ name: '', description: '', colorTag: '#6366f1' }); }}>Create Project</button></div></div></div>}
      {deleteTarget && <div className="overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}><div className="confirm-modal"><div className="confirm-modal-icon">⚠️</div><div className="confirm-modal-title">Delete "{deleteTarget.name}"?</div><div className="confirm-modal-desc">This will permanently delete the project and cannot be undone. All tasks in this project may become orphaned.</div><div className="confirm-modal-actions"><button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="btn btn-danger" onClick={async () => { await onDeleteProject(deleteTarget.id); setDeleteTarget(null); }}>Delete Project</button></div></div></div>}
    </div>
  );
}

function BoardPanel({ tasks, tasksLoading, dark, members, membersLoading, selectedProject, setSelectedProjectId, projects, onCreateTask, onChangeStatus, onDeleteTask, onAddMember, onRemoveMember }: { tasks: Task[]; tasksLoading: boolean; dark: boolean; members: MemberAvatar[]; membersLoading: boolean; selectedProject: Project | null; setSelectedProjectId: (id: string) => void; projects: Project[]; onCreateTask: (payload: CreateTaskPayload) => Promise<void>; onChangeStatus: (taskId: string, status: TaskStatus) => Promise<void>; onDeleteTask: (taskId: string) => Promise<void>; onAddMember: (email: string) => Promise<void>; onRemoveMember: (userId: string) => Promise<void> }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' as TaskPriority, deadline: '', assigneeId: '' });
  const filtered = tasks.filter((t) => (!search || t.title.toLowerCase().includes(search.toLowerCase())) && (!priorityFilter || t.priority === priorityFilter) && (!assigneeFilter || t.assigneeId === assigneeFilter));
  const onDrop = async (e: DragEvent<HTMLDivElement>, column: TaskStatus) => {
    e.preventDefault();
    const task = tasks.find((t) => t.id === dragId);
    if (task && dragId && (VALID_TRANSITIONS[task.status] || []).includes(column)) await onChangeStatus(dragId, column);
    setDragId(null); setDragOver(null);
  };
  return (
    <div className="board-wrap">
      <div className="board-toolbar">
        <select className="field-input project-select" value={selectedProject?.id || ''} onChange={(e) => setSelectedProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((k) => <button key={k} className={`filter-pill${priorityFilter === k ? ' on' : ''}`} onClick={() => setPriorityFilter(priorityFilter === k ? null : k)}><span style={{ width: 6, height: 6, borderRadius: '50%', background: P[k].dot }} />{P[k].label}</button>)}
        {members.map((m) => <button key={m.id} className={`filter-pill${assigneeFilter === m.id ? ' on' : ''}`} onClick={() => setAssigneeFilter(assigneeFilter === m.id ? null : m.id)}><Avatar user={m} size={16} />{m.name}</button>)}
        <div className="search-box">🔍<input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setShowMembers(true); setInviteError(null); }}><span className="member-count-badge">👥 {members.length} Members</span></button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ New Task</button>
      </div>
      {(tasksLoading || membersLoading) && <div className="loading-state"><div className="spinner" /><span>Loading board data...</span></div>}
      <div className="board-cols">
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="board-col"><div className="col-hdr"><span className="col-dot" style={{ background: col.color }} /><span className="col-label">{col.label}</span><span className="col-cnt" style={{ background: `${col.color}20`, color: col.color }}>{colTasks.length}</span></div><div className={`col-body${dragOver === col.id ? ' drag-on' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }} onDragLeave={() => setDragOver(null)} onDrop={(e) => void onDrop(e, col.id)}>{colTasks.length === 0 && <div className="empty-col"><div className="empty-col-ico">📋</div><div>No tasks here</div></div>}{colTasks.map((task) => <TaskCard key={task.id} task={task} dark={dark} onClick={setSelectedTask} members={members} onDragStart={(e, id) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; }} />)}</div></div>
          );
        })}
      </div>
      {showCreate && <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}><div className="modal"><div className="modal-ttl">New Task ✦</div><div className="modal-sub">Add a task to the selected project</div><div className="field"><label className="field-label">Title *</label><input className="field-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div><div className="field"><label className="field-label">Description</label><textarea className="field-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div><div className="field-row"><div className="field"><label className="field-label">Priority</label><select className="field-input" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}>{Object.keys(P).map((k) => <option key={k} value={k}>{P[k as TaskPriority].label}</option>)}</select></div><div className="field"><label className="field-label">Assignee</label><select className="field-input" value={form.assigneeId} onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}><option value="">Unassigned</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div></div><div className="field"><label className="field-label">Deadline</label><input type="date" className="field-input" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} /></div><div className="modal-foot"><button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={async () => { if (!form.title.trim()) return; await onCreateTask({ title: form.title.trim(), description: form.description.trim() || undefined, priority: form.priority, deadline: form.deadline || undefined, assigneeId: form.assigneeId || undefined }); setShowCreate(false); setForm({ title: '', description: '', priority: 'MEDIUM', deadline: '', assigneeId: '' }); }}>✦ Create Task</button></div></div></div>}
      {showMembers && <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowMembers(false)}><div className="modal"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}><div className="modal-ttl">Team Members ✦</div><button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowMembers(false)}>✕</button></div><div className="modal-sub">Manage members for {selectedProject?.name || 'this project'}</div>{members.length === 0 ? <div className="member-empty"><div className="member-empty-icon">👥</div><div>No members yet</div><div style={{ fontSize: 12 }}>Invite team members by email below</div></div> : <div className="member-list">{members.map((m) => <div key={m.id} className="member-row"><Avatar user={m} size={32} /><div className="member-info"><div className="member-name">{m.name}</div></div><span className="member-role-badge member">Member</span><button className="member-remove-btn" onClick={async () => { await onRemoveMember(m.id); }}>Remove</button></div>)}</div>}<div className="invite-section"><div className="field-label" style={{ marginBottom: 10 }}>Invite by Email</div>{inviteError && <div className="app-error" style={{ marginBottom: 10 }}>{inviteError}</div>}<div className="invite-row"><div className="field"><input className="field-input" type="email" placeholder="colleague@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} /></div><button className="btn btn-primary" disabled={inviteLoading || !inviteEmail.trim()} onClick={async () => { if (!inviteEmail.trim()) return; setInviteLoading(true); setInviteError(null); try { await onAddMember(inviteEmail.trim()); setInviteEmail(''); } catch (err) { setInviteError(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to invite member' : 'Failed to invite member'); } finally { setInviteLoading(false); } }}>{inviteLoading ? 'Inviting...' : '+ Invite'}</button></div></div></div></div>}
      {selectedTask && <div className="overlay" style={{ background: 'transparent' }} onClick={() => setSelectedTask(null)}><div className="drawer" onClick={(e) => e.stopPropagation()}><div className="drawer-hdr"><div><div className="drawer-ttl">{selectedTask.title}</div></div><button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedTask(null)}>✕</button></div>{selectedTask.description && <div className="dr-sec"><div className="dr-sec-label">Description</div><div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{selectedTask.description}</div></div>}<div className="dr-sec"><div className="dr-sec-label">Details</div><div className="dr-row"><span className="dr-key">Priority</span><PBadge priority={selectedTask.priority} dark={dark} /></div><div className="dr-row"><span className="dr-key">Deadline</span><DLChip deadline={selectedTask.deadline} status={selectedTask.status} /></div><div className="dr-row"><span className="dr-key">Assignee</span><span className="dr-val">{selectedTask.assigneeName || 'Unassigned'}</span></div><div className="dr-row"><span className="dr-key">Created</span><span className="dr-val">{fmtDate(selectedTask.createdAt)}</span></div></div><div className="dr-sec"><div className="dr-sec-label">Move to</div><div className="trans-grid">{(VALID_TRANSITIONS[selectedTask.status] || []).map((s) => <button key={s} className="trans-btn" onClick={async () => { await onChangeStatus(selectedTask.id, s); setSelectedTask(null); }}>-&gt; {COLUMNS.find((x) => x.id === s)?.label ?? s}</button>)}</div></div><button className="btn btn-danger btn-sm" onClick={async () => { await onDeleteTask(selectedTask.id); setSelectedTask(null); }}>Delete Task</button></div></div>}
    </div>
  );
}
