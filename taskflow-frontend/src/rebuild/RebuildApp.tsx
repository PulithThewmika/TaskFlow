import { useEffect, useState, type CSSProperties, type Dispatch, type DragEvent, type SetStateAction } from 'react';
import {
  ACTIVITY,
  AVATARS,
  COLUMNS,
  FEATURES,
  P,
  PROJECTS,
  SEED_TASKS,
  STATS_HERO,
  TECH,
  VALID_TRANSITIONS,
  daysUntil,
  fmtDate,
  isOverdue,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
} from './constants';
import { GLOBAL_CSS } from './styles';

interface StyleTagProps {
  dark: boolean;
}

function StyleTag({ dark }: StyleTagProps) {
  useEffect(() => {
    const s = document.createElement('style');
    s.id = 'tf-global-styles';
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById('tf-global-styles');
      if (el) el.remove();
    };
  }, []);

  return <div data-theme={dark ? 'dark' : 'light'} />;
}

const ThemeToggle = ({ dark, toggle }: { dark: boolean; toggle: () => void }) => (
  <button className="theme-toggle" onClick={toggle} title="Toggle theme">
    {dark ? '☀️' : '🌙'}
  </button>
);

const LogoMark = ({ size = 34 }: { size?: number }) => (
  <div className="logo-mark" style={{ width: size, height: size, borderRadius: size * 0.29, fontSize: size * 0.47 }}>
    T
  </div>
);

const Avatar = ({ user, size = 28 }: { user?: (typeof AVATARS)[number]; size?: number }) => (
  <div className="tc-av" style={{ width: size, height: size, fontSize: size * 0.38, background: `${user?.color ?? '#6366f1'}28`, color: user?.color ?? '#6366f1', borderRadius: size * 0.27 }}>
    {user?.initials}
  </div>
);

const PBadge = ({ priority, dark }: { priority: TaskPriority; dark: boolean }) => {
  const m = P[priority] ?? P.MEDIUM;
  return (
    <span className="p-badge" style={{ background: dark ? m.darkBg : m.bg, color: dark ? m.darkColor : m.color }}>
      <span className="p-dot" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
};

const DLChip = ({ deadline, status }: { deadline: string | null; status: TaskStatus }) => {
  if (!deadline) return null;
  const ov = isOverdue(deadline, status);
  const d = daysUntil(deadline);
  const soon = !ov && d !== null && d <= 3 && status !== 'DONE';
  return <span className={`dl-chip${ov ? ' ov' : soon ? ' soon' : ''}`}>{ov ? '⚠' : '📅'} {fmtDate(deadline)}</span>;
};

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const c = COLUMNS.find((x) => x.id === status);
  if (!c) return null;
  return (
    <span className="status-badge" style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
      {c.label}
    </span>
  );
};

function TaskCard({ task, onClick, dark, onDragStart }: { task: TaskItem; onClick: (task: TaskItem) => void; dark: boolean; onDragStart: (e: DragEvent<HTMLDivElement>, id: number) => void }) {
  const assignee = AVATARS.find((a) => a.id === task.assigneeId);
  const m = P[task.priority] ?? P.MEDIUM;
  return (
    <div className="task-card" draggable onDragStart={(e) => onDragStart(e, task.id)} onClick={() => onClick(task)} data-testid={`task-card-${task.title}`}>
      <div className="tc-bar" style={{ background: m.dot }} />
      <div className="tc-title">{task.title}</div>
      {task.description && <div className="tc-desc">{task.description}</div>}
      <div className="tc-foot">
        <PBadge priority={task.priority} dark={dark} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <DLChip deadline={task.deadline} status={task.status} />
          {assignee && <Avatar user={assignee} size={22} />}
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({ onClose, onSave, defaultStatus = 'TODO' }: { onClose: () => void; onSave: (task: Omit<TaskItem, 'id' | 'projectId' | 'createdAt'>) => void; defaultStatus?: TaskStatus }) {
  const [f, setF] = useState({ title: '', description: '', priority: 'MEDIUM' as TaskPriority, status: defaultStatus, deadline: '', assigneeId: '' });
  const [err, setErr] = useState<{ title?: string; deadline?: string }>({});
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const e: { title?: string; deadline?: string } = {};
    if (!f.title.trim()) e.title = 'Title is required';
    if (f.deadline && new Date(f.deadline).getTime() < new Date().setHours(0, 0, 0, 0)) e.deadline = 'Deadline cannot be in the past';
    if (Object.keys(e).length > 0) {
      setErr(e);
      return;
    }
    onSave({ ...f, assigneeId: f.assigneeId ? Number(f.assigneeId) : null, deadline: f.deadline || null });
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-ttl">New Task ✦</div>
        <div className="modal-sub">Add a task to the board</div>
        <div className="field">
          <label className="field-label">Title *</label>
          <input data-testid="task-title-input" className="field-input" placeholder="e.g. Implement auth middleware" value={f.title} onChange={(e) => set('title', e.target.value)} />
          {err.title && <div className="field-err" data-testid="title-error">{err.title}</div>}
        </div>
        <div className="field">
          <label className="field-label">Description</label>
          <textarea className="field-input" placeholder="Optional context..." value={f.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label className="field-label">Priority</label>
            <select data-testid="task-priority-select" className="field-input" value={f.priority} onChange={(e) => set('priority', e.target.value)}>
              {Object.keys(P).map((k) => <option key={k} value={k}>{P[k as TaskPriority].label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Status</label>
            <select className="field-input" value={f.status} onChange={(e) => set('status', e.target.value)}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label className="field-label">Deadline</label>
            <input data-testid="task-deadline-input" type="date" className="field-input" value={f.deadline} onChange={(e) => set('deadline', e.target.value)} />
            {err.deadline && <div className="field-err" data-testid="deadline-error">{err.deadline}</div>}
          </div>
          <div className="field">
            <label className="field-label">Assignee</label>
            <select className="field-input" value={f.assigneeId} onChange={(e) => set('assigneeId', e.target.value)}>
              <option value="">Unassigned</option>
              {AVATARS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>✦ Create Task</button>
        </div>
      </div>
    </div>
  );
}

function TaskDrawer({ task, onClose, onStatusChange, onDelete }: { task: TaskItem | null; onClose: () => void; onStatusChange: (id: number, status: TaskStatus) => void; onDelete: (id: number) => void }) {
  if (!task) return null;
  const assignee = AVATARS.find((a) => a.id === task.assigneeId);
  const nexts = VALID_TRANSITIONS[task.status] ?? [];
  return (
    <>
      <div className="overlay" style={{ background: 'transparent' }} onClick={onClose} />
      <div className="drawer">
        <div className="drawer-hdr">
          <div>
            <div className="drawer-ttl">{task.title}</div>
            <div style={{ marginTop: 8 }}><StatusBadge status={task.status} /></div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        {task.description && (
          <div className="dr-sec">
            <div className="dr-sec-label">Description</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{task.description}</div>
          </div>
        )}
        <div className="dr-sec">
          <div className="dr-sec-label">Details</div>
          <div className="dr-row"><span className="dr-key">Priority</span><PBadge priority={task.priority} dark /></div>
          <div className="dr-row"><span className="dr-key">Deadline</span><DLChip deadline={task.deadline} status={task.status} /></div>
          <div className="dr-row"><span className="dr-key">Assignee</span><span className="dr-val">{assignee ? assignee.name : 'Unassigned'}</span></div>
          <div className="dr-row"><span className="dr-key">Created</span><span className="dr-val">{fmtDate(task.createdAt)}</span></div>
        </div>
        {nexts.length > 0 && (
          <div className="dr-sec">
            <div className="dr-sec-label">Move to</div>
            <div className="trans-grid">
              {nexts.map((s) => {
                const c = COLUMNS.find((x) => x.id === s)!;
                return (
                  <button key={s} className="trans-btn" style={{ background: `${c.color}15`, color: c.color, borderColor: `${c.color}40` }} onClick={() => { onStatusChange(task.id, s); onClose(); }}>
                    -&gt; {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <button className="btn btn-danger btn-sm" onClick={() => { onDelete(task.id); onClose(); }}>Delete Task</button>
      </div>
    </>
  );
}

function HeroPreview({ dark }: { dark: boolean }) {
  const preview = [
    { col: 'TODO', tasks: [{ title: 'Member invite flow', p: 'MEDIUM', av: AVATARS[1] }, { title: 'File attachments', p: 'LOW', av: null }] },
    { col: 'IN_PROGRESS', tasks: [{ title: 'Dashboard stats API', p: 'MEDIUM', av: AVATARS[2] }, { title: 'Notification service', p: 'LOW', av: AVATARS[3] }] },
    { col: 'IN_REVIEW', tasks: [{ title: 'Kanban drag & drop', p: 'HIGH', av: AVATARS[0] }] },
    { col: 'DONE', tasks: [{ title: 'JWT auth middleware', p: 'CRITICAL', av: AVATARS[2] }, { title: 'Design system tokens', p: 'HIGH', av: AVATARS[0] }] },
  ] as const;

  return (
    <div className="hero-preview">
      <div className="hero-preview-glow" />
      <div className="hero-board">
        {preview.map(({ col, tasks: hTasks }) => {
          const c = COLUMNS.find((x) => x.id === col)!;
          return (
            <div key={col}>
              <div className="hero-col-hdr" style={{ background: `${c.color}15` }}>
                <span className="hero-col-dot" style={{ background: c.color }} />
                <span className="hero-col-label" style={{ color: c.color }}>{c.label}</span>
                <span className="hero-col-cnt" style={{ background: `${c.color}20`, color: c.color }}>{hTasks.length}</span>
              </div>
              {hTasks.map((t) => {
                const m = P[t.p];
                return (
                  <div key={t.title} className="hero-task">
                    <div className="hero-task-bar" style={{ background: m.dot }} />
                    <div className="hero-task-title">{t.title}</div>
                    <div className="hero-task-foot">
                      <span className="hero-p" style={{ background: dark ? m.darkBg : m.bg, color: dark ? m.darkColor : m.color }}>{m.label}</span>
                      {t.av && <div className="hero-av" style={{ background: `${t.av.color}28`, color: t.av.color }}>{t.av.initials}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LandingPage({ onEnter, dark, toggleDark }: { onEnter: () => void; dark: boolean; toggleDark: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div className="land" data-theme={dark ? 'dark' : 'light'}>
      <nav className="land-nav">
        <div className="land-nav-logo">
          <LogoMark size={32} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginLeft: 8 }}>TaskFlow</span>
        </div>
        <div className="land-nav-links">
          {[
            ['Features', 'features'],
            ['Tech Stack', 'tech'],
            ['Workflow', 'workflow'],
            ['Transitions', 'rules'],
          ].map(([label, id]) => <span key={id} className="land-nav-link" onClick={() => scrollTo(id)}>{label}</span>)}
        </div>
        <div className="land-nav-actions">
          <ThemeToggle dark={dark} toggle={toggleDark} />
          <button className="btn btn-ghost btn-sm">Sign in</button>
          <button className="btn btn-primary btn-sm" onClick={onEnter}>Launch App -&gt;</button>
        </div>
      </nav>
      <section className="land-hero">
        <div className="land-hero-bg" />
        <div className="land-hero-grid" />
        <div className="land-badge"><span className="land-badge-dot" />Built for modern product teams</div>
        <h1 className="land-h1">Ship features,<br />not <span className="land-h1-accent">spreadsheets.</span></h1>
        <p className="land-sub">TaskFlow helps teams plan, prioritize, and deliver work faster with a clean collaborative workspace.</p>
        <div className="land-ctas">
          <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }} onClick={onEnter}>Open App -&gt;</button>
          <button className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: 15 }} onClick={() => scrollTo('features')}>See Features</button>
        </div>
        <HeroPreview dark={dark} />
      </section>
      <div className="land-stats">
        {STATS_HERO.map((s) => <div key={s.label} className="land-stat-item"><div className="land-stat-val">{s.value}</div><div className="land-stat-label">{s.label}</div></div>)}
      </div>
      <section id="features" className="land-features">
        <div className="land-section-tag">✦ Features</div>
        <h2 className="land-section-h2">Everything your team needs</h2>
        <p className="land-section-sub">A production-grade task management system with enforced workflow rules, full test coverage, and a polished UI.</p>
        <div className="feat-grid">{FEATURES.map((f) => <div key={f.title} className="feat-card"><div className="feat-icon">{f.icon}</div><div className="feat-title">{f.title}</div><div className="feat-desc">{f.desc}</div></div>)}</div>
      </section>
      <section id="tech" className="land-tech">
        <div className="land-section-tag">✦ Tech Stack</div>
        <h2 className="land-section-h2">Built on proven technology</h2>
        <p className="land-section-sub">Industry-standard tools across backend, frontend, database, auth, and testing.</p>
        <div className="tech-grid">{TECH.map((t) => <div key={t.name} className="tech-chip"><span className="tech-dot" style={{ background: t.color }} /><div><div className="tech-name">{t.name}</div><div className="tech-role">{t.role}</div></div></div>)}</div>
      </section>
      <section id="workflow" className="land-flow">
        <div className="land-section-tag">✦ Workflow</div>
        <h2 className="land-section-h2">How TaskFlow works</h2>
        <p className="land-section-sub">Four simple steps from idea to shipped feature.</p>
        <div className="flow-steps">
          {[
            { n: '01', title: 'Create Project', desc: 'Invite your team, set color tags, and define scope.' },
            { n: '02', title: 'Add Tasks', desc: 'Create tasks with priority, assignee, and deadline.' },
            { n: '03', title: 'Work Board', desc: 'Move TODO -> IN_PROGRESS -> IN_REVIEW with rules.' },
            { n: '04', title: 'Ship', desc: 'Mark done and monitor overdue alerts from dashboard.' },
          ].map((s) => <div key={s.n} className="flow-step"><div className="flow-num">{s.n}</div><div className="flow-title">{s.title}</div><div className="flow-desc">{s.desc}</div></div>)}
        </div>
      </section>
      <section id="rules" className="land-rules">
        <div className="land-section-tag">✦ Status Transitions</div>
        <h2 className="land-section-h2">Enforced workflow rules</h2>
        <p className="land-section-sub">Invalid transitions are blocked both in UI and backend.</p>
        <div className="rules-grid">
          <div className="rules-visual">
            {Object.entries(VALID_TRANSITIONS).map(([from, next]) => (
              <div key={from} className="rule-row">
                <span className="rule-from">{from.replace(/_/g, ' ')}</span>
                <span className="rule-arrow">-&gt;</span>
                <div className="rule-to-list">{next.length > 0 ? next.map((to) => <span key={to} className="rule-to">{to.replace(/_/g, ' ')}</span>) : <span className="rule-blocked">Terminal</span>}</div>
              </div>
            ))}
          </div>
          <div className="rules-text">
            <div className="rules-bullet"><div className="rules-ico" style={{ background: 'rgba(99,102,241,0.10)' }}>🧪</div><div><div className="rules-bullet-title">JUnit Transition Tests</div><div className="rules-bullet-desc">Valid and invalid transitions are covered.</div></div></div>
            <div className="rules-bullet"><div className="rules-ico" style={{ background: 'rgba(16,185,129,0.10)' }}>🎭</div><div><div className="rules-bullet-title">Playwright E2E</div><div className="rules-bullet-desc">Full journey and edge-case validation coverage.</div></div></div>
          </div>
        </div>
      </section>
      <section className="land-cta">
        <div className="land-cta-glow" />
        <h2 className="land-cta-h2">Ready to manage your sprint?</h2>
        <p className="land-cta-sub">Jump into the full board and see transition rules in action.</p>
        <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15 }} onClick={onEnter}>Open TaskFlow -&gt;</button>
      </section>
      <footer className="land-footer">
        <div className="land-footer-copy">© 2025 TaskFlow. All rights reserved.</div>
        <div className="land-footer-links"><span className="land-footer-link">GitHub</span><span className="land-footer-link">API Docs</span><span className="land-footer-link">Test Reports</span></div>
      </footer>
    </div>
  );
}

function LoginPage({ onLogin, dark, toggleDark, setPage }: { onLogin: () => void; dark: boolean; toggleDark: () => void; setPage: (page: 'landing' | 'login' | 'app') => void }) {
  const [f, setF] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const submit = () => {
    if (!f.email || !f.password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };
  return (
    <div className="login-page">
      <div className="login-glow-1" />
      <div className="login-glow-2" />
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <ThemeToggle dark={dark} toggle={toggleDark} />
        <button className="btn btn-ghost btn-sm" onClick={() => setPage('landing')}>← Landing</button>
      </div>
      <div style={{ width: 400, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LogoMark size={52} />
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, marginTop: 14, marginBottom: 6 }}>TaskFlow</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to your workspace</div>
        </div>
        <div className="login-card">
          <div className="field"><label className="field-label">Email</label><input data-testid="email-input" className="field-input" type="email" placeholder="you@company.com" value={f.email} onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} /></div>
          <div className="field"><label className="field-label">Password</label><input data-testid="password-input" className="field-input" type="password" placeholder="••••••••" value={f.password} onChange={(e) => setF((p) => ({ ...p, password: e.target.value }))} /></div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, marginTop: 8 }} onClick={submit} disabled={loading}>{loading ? 'Signing in…' : 'Sign in ->'}</button>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ tasks, setView }: { tasks: TaskItem[]; setView: (view: 'dashboard' | 'projects' | 'board') => void }) {
  const counts = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  tasks.forEach((t) => { counts[t.status] += 1; });
  const total = tasks.length;
  const overdue = tasks.filter((t) => isOverdue(t.deadline, t.status)).length;
  const doneP = total ? Math.round((counts.DONE / total) * 100) : 0;
  const stats = [{ label: 'Total Tasks', value: total, icon: '📋', c: '#6366f1', sub: `${doneP}% complete` }, { label: 'In Progress', value: counts.IN_PROGRESS, icon: '⚡', c: '#f59e0b', sub: `${counts.IN_REVIEW} in review` }, { label: 'Overdue', value: overdue, icon: '⚠️', c: '#ef4444', sub: overdue > 0 ? 'Needs attention' : 'All on track' }, { label: 'Done', value: counts.DONE, icon: '✓', c: '#10b981', sub: `of ${total} tasks` }];
  return (
    <div className="page-wrap">
      <div style={{ marginBottom: 26 }}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 5 }}>Good morning, Pmax ✦</div><div style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Here's what's happening across your projects today.</div></div>
      <div className="stats-grid">{stats.map((s) => <div key={s.label} className="stat-card" style={{ '--c': s.c } as CSSProperties}><div className="stat-glow" /><div className="stat-icon">{s.icon}</div><div className="stat-label">{s.label}</div><div className="stat-val" style={{ color: s.c }}>{s.value}</div><div className="stat-sub">{s.sub}</div></div>)}</div>
      <div className="sec-hdr"><div className="sec-ttl">Projects</div><button className="btn btn-ghost btn-sm" onClick={() => setView('projects')}>View all</button></div>
      <div className="proj-grid">{PROJECTS.map((p) => <div key={p.id} className="proj-card" style={{ '--pc': p.color } as CSSProperties} onClick={() => setView('board')}><div className="proj-name">{p.name}</div><span className="proj-tag">{p.tag}</span></div>)}</div>
      <div className="sec-hdr"><div className="sec-ttl">Activity Feed</div><span className="chip">Last 24h</span></div>
      <div className="act-list">{ACTIVITY.map((item) => <div key={item.id} className="act-item"><div className="act-av" style={{ background: `${item.avatar.color}22`, color: item.avatar.color }}>{item.avatar.initials}</div><div className="act-txt"><strong>{item.user}</strong> {item.action} <strong>{item.target}</strong></div><div className="act-time">{item.time}</div></div>)}</div>
    </div>
  );
}

function ProjectsPage({ tasks, setView }: { tasks: TaskItem[]; setView: (view: 'dashboard' | 'projects' | 'board') => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [projects, setProjects] = useState(PROJECTS);
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#8b5cf6', '#ef4444'];
  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}><div><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800 }}>Projects</div><div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{projects.length} active projects</div></div><button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button></div>
      <div className="projects-grid">{projects.map((p) => { const pt = tasks.filter((t) => t.projectId === p.id); const pd = pt.filter((t) => t.status === 'DONE').length; const pp = pt.length ? Math.round((pd / pt.length) * 100) : 0; return <div key={p.id} className="prj-card" style={{ '--pc': p.color } as CSSProperties} onClick={() => setView('board')}><div className="prj-card-name">{p.name}</div><span className="prj-tag" style={{ background: `${p.color}18`, color: p.color }}>{p.tag}</span><div className="prog-bar-wrap"><div className="prog-bar" style={{ width: `${pp}%`, background: p.color }} /></div></div>; })}</div>
      {showCreate && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <div className="modal-ttl">New Project</div>
            <div className="field"><label className="field-label">Project Name *</label><input data-testid="project-name-input" className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="field"><label className="field-label">Description</label><textarea data-testid="project-desc-input" className="field-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="field"><label className="field-label">Color Tag</label><div className="color-picker">{colors.map((c) => <button key={c} className={`color-swatch${form.color === c ? ' selected' : ''}`} style={{ background: c }} onClick={() => setForm((f) => ({ ...f, color: c }))} />)}</div></div>
            <div className="modal-foot"><button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { if (!form.name.trim()) return; setProjects((p) => [...p, { id: Date.now(), name: form.name, color: form.color, members: 1, tag: 'New' }]); setShowCreate(false); }}>Create Project</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardPage({ tasks, setTasks, dark }: { tasks: TaskItem[]; setTasks: Dispatch<SetStateAction<TaskItem[]>>; dark: boolean }) {
  const [showCreate, setShowCreate] = useState(false);
  const [defCol, setDefCol] = useState<TaskStatus>('TODO');
  const [sel, setSel] = useState<TaskItem | null>(null);
  const [search, setSearch] = useState('');
  const [fp, setFp] = useState<TaskPriority | null>(null);
  const [fa, setFa] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const filtered = tasks.filter((t) => (!search || t.title.toLowerCase().includes(search.toLowerCase())) && (!fp || t.priority === fp) && (!fa || t.assigneeId === fa));
  const addTask = (form: Omit<TaskItem, 'id' | 'projectId' | 'createdAt'>) => {
    setTasks((prev) => [...prev, { ...form, id: Date.now(), projectId: 1, createdAt: new Date().toISOString().slice(0, 10) }]);
    setShowCreate(false);
  };
  const changeStatus = (id: number, s: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: s } : t)));
    setSel((prev) => (prev?.id === id ? { ...prev, status: s } : prev));
  };
  const deleteTask = (id: number) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const onDrop = (e: DragEvent<HTMLDivElement>, col: TaskStatus) => {
    e.preventDefault();
    const t = tasks.find((x) => x.id === dragId);
    if (t && dragId !== null && (VALID_TRANSITIONS[t.status] || []).includes(col)) changeStatus(dragId, col);
    setDragId(null);
    setDragOver(null);
  };

  return (
    <div className="board-wrap">
      <div className="board-toolbar">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((k) => <button key={k} className={`filter-pill${fp === k ? ' on' : ''}`} onClick={() => setFp(fp === k ? null : k)}><span style={{ width: 6, height: 6, borderRadius: '50%', background: P[k].dot }} />{P[k].label}</button>)}
        {AVATARS.map((a) => <button key={a.id} className={`filter-pill${fa === a.id ? ' on' : ''}`} onClick={() => setFa(fa === a.id ? null : a.id)}><Avatar user={a} size={16} />{a.name}</button>)}
        <div className="search-box">🔍<input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <button className="btn btn-primary btn-sm" onClick={() => { setDefCol('TODO'); setShowCreate(true); }}>+ New Task</button>
      </div>
      <div className="board-cols">
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="board-col" data-testid={`column-${col.id}`}>
              <div className="col-hdr"><span className="col-dot" style={{ background: col.color }} /><span className="col-label">{col.label}</span><span className="col-cnt" style={{ background: `${col.color}20`, color: col.color }}>{colTasks.length}</span></div>
              <div className={`col-body${dragOver === col.id ? ' drag-on' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }} onDragLeave={() => setDragOver(null)} onDrop={(e) => onDrop(e, col.id)}>
                {colTasks.length === 0 && <div className="empty-col" data-testid="empty-board-state"><div className="empty-col-ico">📋</div><div>No tasks here</div></div>}
                {colTasks.map((task) => <TaskCard key={task.id} task={task} dark={dark} onClick={setSel} onDragStart={(e, id) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; }} />)}
                {col.id === 'TODO' && <button className="col-add" onClick={() => { setDefCol('TODO'); setShowCreate(true); }}>+ Add Task</button>}
              </div>
            </div>
          );
        })}
      </div>
      {showCreate && <CreateTaskModal defaultStatus={defCol} onClose={() => setShowCreate(false)} onSave={addTask} />}
      {sel && <TaskDrawer task={sel} onClose={() => setSel(null)} onStatusChange={changeStatus} onDelete={deleteTask} />}
    </div>
  );
}

function Sidebar({ view, setView, dark, toggleDark, setPage }: { view: 'dashboard' | 'projects' | 'board'; setView: (v: 'dashboard' | 'projects' | 'board') => void; dark: boolean; toggleDark: () => void; setPage: (page: 'landing' | 'login' | 'app') => void }) {
  const items: Array<{ id: 'dashboard' | 'projects' | 'board'; label: string; icon: string; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'projects', label: 'Projects', icon: '◈' },
    { id: 'board', label: 'Board', icon: '⊟', badge: '3' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo"><LogoMark /><div><div className="logo-name">TaskFlow</div><div className="logo-sub">SE3112 · Group 17</div></div></div>
      <div className="sb-nav">
        <div className="sb-sec-label">Menu</div>
        {items.map((item) => <div key={item.id} className={`sb-item${view === item.id ? ' active' : ''}`} onClick={() => setView(item.id)}><span className="sb-icon">{item.icon}</span><span>{item.label}</span>{item.badge && <span className="sb-badge">{item.badge}</span>}</div>)}
        <div className="sb-sec-label" style={{ marginTop: 14 }}>Projects</div>
        {PROJECTS.map((p) => <div key={p.id} className={`sb-item${view === 'board' ? ' active' : ''}`} onClick={() => setView('board')}><span className="pdot" style={{ background: p.color }} /><span style={{ fontSize: 13 }}>{p.name}</span></div>)}
        <div className="sb-sec-label" style={{ marginTop: 14 }}>Navigation</div>
        <div className="sb-item" onClick={() => setPage('landing')}><span className="sb-icon">🏠</span><span>Landing Page</span></div>
      </div>
      <div className="sb-footer">
        <div style={{ padding: '0 2px 8px' }}><ThemeToggle dark={dark} toggle={toggleDark} /></div>
        <div className="user-row"><div className="u-av" style={{ background: '#6366f128', color: '#818cf8' }}>PM</div><div><div className="u-name">Pmax</div><div className="u-role">IT23656338</div></div></div>
      </div>
    </div>
  );
}

function Topbar({ view, tasks, dark, toggleDark }: { view: 'dashboard' | 'projects' | 'board'; tasks: TaskItem[]; dark: boolean; toggleDark: () => void }) {
  const titles: Record<'dashboard' | 'projects' | 'board', [string, string]> = { dashboard: ['Overview', 'TaskFlow Platform'], projects: ['Projects', 'All workspaces'], board: ['Kanban Board', 'TaskFlow Platform'] };
  const [title, sub] = titles[view];
  const ov = tasks.filter((t) => isOverdue(t.deadline, t.status)).length;
  return (
    <div className="topbar">
      <div style={{ flex: 1 }}><div className="topbar-ttl">{title}</div>{sub && <div className="topbar-sub">{sub}</div>}</div>
      <div className="topbar-actions">
        {ov > 0 && <div className="overdue-pill">⚠ {ov} overdue</div>}
        <div className="av-group">{AVATARS.map((a) => <div key={a.id} className="av" style={{ background: `${a.color}28`, color: a.color }}>{a.initials}</div>)}</div>
        <ThemeToggle dark={dark} toggle={toggleDark} />
      </div>
    </div>
  );
}

export default function RebuildApp() {
  const [page, setPage] = useState<'landing' | 'login' | 'app'>('landing');
  const [view, setView] = useState<'dashboard' | 'projects' | 'board'>('dashboard');
  const [tasks, setTasks] = useState<TaskItem[]>(SEED_TASKS);
  const [dark, setDark] = useState(true);
  const toggleDark = () => setDark((d) => !d);

  return (
    <div data-theme={dark ? 'dark' : 'light'} style={{ height: '100%' }}>
      <StyleTag dark={dark} />
      {page === 'landing' && <LandingPage dark={dark} toggleDark={toggleDark} onEnter={() => setPage('login')} />}
      {page === 'login' && <LoginPage dark={dark} toggleDark={toggleDark} setPage={setPage} onLogin={() => setPage('app')} />}
      {page === 'app' && (
        <div className="app-shell">
          <Sidebar view={view} setView={setView} dark={dark} toggleDark={toggleDark} setPage={setPage} />
          <div className="main-area">
            <Topbar view={view} tasks={tasks} dark={dark} toggleDark={toggleDark} />
            <div className="content-area">
              {view === 'dashboard' && <DashboardPage tasks={tasks} setView={setView} />}
              {view === 'projects' && <ProjectsPage tasks={tasks} setView={setView} />}
              {view === 'board' && <BoardPage tasks={tasks} setTasks={setTasks} dark={dark} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
