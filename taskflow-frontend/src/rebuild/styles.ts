export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
:root, [data-theme="dark"] {
  --bg-base:#09090e; --bg-surface:#0f0f17; --bg-elevated:#16161f; --bg-card:#1c1c28; --bg-hover:#22222e;
  --border:rgba(255,255,255,0.07); --border-mid:rgba(255,255,255,0.10); --border-high:rgba(255,255,255,0.15);
  --text-primary:#f0f0f8; --text-secondary:#8888aa; --text-muted:#4e4e65; --accent:#6366f1; --accent-2:#8b5cf6;
  --shadow-sm:0 1px 4px rgba(0,0,0,0.5); --shadow-md:0 4px 20px rgba(0,0,0,0.6); --shadow-lg:0 8px 40px rgba(0,0,0,0.7); --shadow-xl:0 20px 60px rgba(0,0,0,0.8);
  --land-card-bg:#1c1c28; --land-card-border:rgba(255,255,255,0.07); --land-stat-bg:rgba(255,255,255,0.04); --scrollbar-thumb:rgba(255,255,255,0.12);
}
[data-theme="light"] {
  --bg-base:#f5f5fa; --bg-surface:#ffffff; --bg-elevated:#ffffff; --bg-card:#ffffff; --bg-hover:#f0f0f8;
  --border:rgba(0,0,0,0.07); --border-mid:rgba(0,0,0,0.10); --border-high:rgba(0,0,0,0.15);
  --text-primary:#111128; --text-secondary:#3f3f5a; --text-muted:#666683; --accent:#4f52e0; --accent-2:#7c3aed;
  --shadow-sm:0 1px 4px rgba(0,0,0,0.08); --shadow-md:0 4px 20px rgba(0,0,0,0.10); --shadow-lg:0 8px 40px rgba(0,0,0,0.12); --shadow-xl:0 20px 60px rgba(0,0,0,0.15);
  --land-card-bg:#ffffff; --land-card-border:rgba(0,0,0,0.07); --land-stat-bg:rgba(99,102,241,0.05); --scrollbar-thumb:rgba(0,0,0,0.15);
}
::-webkit-scrollbar { width:4px; height:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:var(--scrollbar-thumb); border-radius:99px; }
html, body, #root { height:100%; font-family:'Outfit', sans-serif; background:var(--bg-base); color:var(--text-primary); }
.app-shell { display:flex; height:100vh; overflow:hidden; font-size:14px; background:var(--bg-base); }
.sidebar { width:240px; flex-shrink:0; background:var(--bg-surface); border-right:1px solid var(--border); display:flex; flex-direction:column; overflow:hidden; position:relative; z-index:10; }
.sidebar-logo { padding:20px 18px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; }
.logo-mark { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:16px; color:#fff; box-shadow:0 0 20px rgba(99,102,241,0.45); }
.logo-name { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; color:var(--text-primary); } .logo-sub { font-size:10px; color:var(--text-muted); letter-spacing:0.05em; }
.sb-nav { flex:1; overflow-y:auto; padding:10px 8px; } .sb-sec-label { font-size:10px; font-weight:600; letter-spacing:0.12em; color:var(--text-muted); text-transform:uppercase; padding:12px 10px 5px; }
.sb-item { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:10px; cursor:pointer; transition:all .2s; color:var(--text-secondary); font-size:13.5px; margin-bottom:1px; border:1px solid transparent; }
.sb-item:hover { background:var(--bg-hover); color:var(--text-primary); } .sb-item.active { background:rgba(99,102,241,0.10); color:var(--text-primary); border-color:rgba(99,102,241,0.20); }
.sb-icon { font-size:15px; width:20px; text-align:center; flex-shrink:0; } .sb-badge { margin-left:auto; background:var(--bg-elevated); border:1px solid var(--border); color:var(--text-muted); font-size:10px; font-weight:700; padding:1px 6px; border-radius:99px; }
.pdot { width:8px; height:8px; border-radius:50%; flex-shrink:0; } .sb-footer { padding:10px 8px; border-top:1px solid var(--border); }
.user-row { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:10px; cursor:pointer; transition:all .2s; } .user-row:hover { background:var(--bg-hover); }
.u-av { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; font-family:'Syne',sans-serif; }
.u-name { font-size:13px; font-weight:500; color:var(--text-primary); } .u-role { font-size:11px; color:var(--text-muted); }
.topbar { height:58px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--bg-surface); display:flex; align-items:center; padding:0 24px; gap:12px; }
.topbar-ttl { font-family:'Syne',sans-serif; font-weight:700; font-size:17px; flex:1; } .topbar-sub { font-size:11px; color:var(--text-muted); margin-top:1px; } .topbar-actions { display:flex; align-items:center; gap:8px; }
.btn { display:inline-flex; align-items:center; gap:6px; border-radius:10px; font-family:'Outfit',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; border:none; outline:none; padding:8px 14px; white-space:nowrap; }
.btn-primary { background:linear-gradient(135deg,#6366f1,#7c3aed); color:#fff; box-shadow:0 0 16px rgba(99,102,241,0.3); } .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 22px rgba(99,102,241,0.5); }
.btn-ghost { background:var(--bg-elevated); color:var(--text-secondary); border:1px solid var(--border); } .btn-ghost:hover { background:var(--bg-hover); color:var(--text-primary); border-color:var(--border-mid); }
.btn-danger { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.2); } .btn-danger:hover { background:rgba(239,68,68,0.22); }
.btn-sm { padding:5px 10px; font-size:12px; border-radius:8px; } .btn-icon { padding:8px; }
.av-group { display:flex; } .av-group .av { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; border:2px solid var(--bg-surface); margin-left:-6px; font-family:'Syne',sans-serif; }
.av-group .av:first-child { margin-left:0; }
.main-area { flex:1; display:flex; flex-direction:column; overflow:hidden; } .content-area { flex:1; overflow:hidden; display:flex; flex-direction:column; }
.page-wrap { padding:24px; overflow-y:auto; } .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:26px; }
.stat-card { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:20px; position:relative; overflow:hidden; transition:all .2s; }
.stat-card:hover { border-color:var(--border-mid); transform:translateY(-2px); box-shadow:var(--shadow-md); }
.stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--c); }
.stat-glow { position:absolute; top:-20px; right:-20px; width:80px; height:80px; border-radius:50%; background:var(--c); opacity:0.06; filter:blur(20px); }
.stat-icon { font-size:22px; margin-bottom:10px; } .stat-label { font-size:11px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px; }
.stat-val { font-family:'Syne',sans-serif; font-size:34px; font-weight:800; } .stat-sub { font-size:12px; color:var(--text-muted); margin-top:5px; }
.sec-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; } .sec-ttl { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; }
.proj-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; } .projects-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.proj-card, .prj-card { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; padding:18px; cursor:pointer; transition:all .2s; position:relative; overflow:hidden; }
.proj-card:hover, .prj-card:hover { border-color:var(--border-mid); transform:translateY(-2px); box-shadow:var(--shadow-md); }
.proj-card::before, .prj-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--pc); border-radius:99px 0 0 99px; }
.proj-name, .prj-card-name { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; margin-bottom:3px; }
.proj-tag, .prj-tag { font-size:10px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; padding:2px 8px; border-radius:99px; background:rgba(255,255,255,0.06); color:var(--text-muted); }
.prog-bar-wrap { height:4px; background:var(--bg-hover); border-radius:99px; overflow:hidden; margin-top:10px; } .prog-bar { height:100%; border-radius:99px; transition:width .6s; }
.act-list { background:var(--bg-card); border:1px solid var(--border); border-radius:16px; overflow:hidden; } .act-item { display:flex; align-items:center; gap:12px; padding:11px 16px; border-bottom:1px solid var(--border); }
.act-item:last-child { border-bottom:none; } .act-av { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; font-family:'Syne',sans-serif; }
.act-txt { flex:1; font-size:13px; color:var(--text-secondary); } .act-txt strong { color:var(--text-primary); font-weight:500; } .act-time { font-size:11px; color:var(--text-muted); }
.act-to { display:inline-block; font-size:10px; font-weight:600; padding:1px 6px; border-radius:4px; background:rgba(99,102,241,0.12); color:#818cf8; margin-left:4px; }
.board-wrap { flex:1; overflow:hidden; display:flex; flex-direction:column; } .board-toolbar { padding:12px 22px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; flex-wrap:wrap; background:var(--bg-surface); }
.filter-pill { display:flex; align-items:center; gap:5px; padding:5px 11px; border-radius:99px; border:1px solid var(--border); background:var(--bg-elevated); font-size:12px; color:var(--text-secondary); cursor:pointer; }
.filter-pill.on { border-color:rgba(99,102,241,0.4); background:rgba(99,102,241,0.08); color:#818cf8; }
.search-box { display:flex; align-items:center; gap:7px; padding:5px 12px; border-radius:99px; border:1px solid var(--border); background:var(--bg-elevated); font-size:13px; color:var(--text-secondary); margin-left:auto; }
.search-box input { background:none; border:none; outline:none; color:var(--text-primary); font-size:13px; width:130px; }
.board-cols { flex:1; display:flex; overflow-x:auto; padding:18px 22px; gap:16px; } .board-col { width:285px; flex-shrink:0; display:flex; flex-direction:column; }
.col-hdr { display:flex; align-items:center; gap:8px; padding:10px 13px; border-radius:16px 16px 0 0; border:1px solid var(--border); border-bottom:none; background:var(--bg-card); }
.col-dot { width:8px; height:8px; border-radius:50%; } .col-label { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; flex:1; } .col-cnt { font-size:11px; font-weight:700; padding:2px 7px; border-radius:99px; font-family:'Syne',sans-serif; }
.col-body { flex:1; overflow-y:auto; padding:8px; border:1px solid var(--border); border-radius:0 0 16px 16px; min-height:380px; display:flex; flex-direction:column; gap:7px; background:var(--bg-elevated); }
.col-body.drag-on { border-color:rgba(99,102,241,0.45); background:rgba(99,102,241,0.04); }
.task-card { background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:13px; cursor:pointer; transition:all .2s; position:relative; overflow:hidden; animation:slideIn .22s ease; }
@keyframes slideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.task-card:hover { border-color:var(--border-mid); box-shadow:var(--shadow-sm); transform:translateY(-1px); }
.tc-bar { position:absolute; left:0; top:0; bottom:0; width:2.5px; } .tc-title { font-size:13px; font-weight:500; color:var(--text-primary); margin-bottom:7px; line-height:1.45; padding-left:6px; }
.tc-desc { font-size:11.5px; color:var(--text-muted); margin-bottom:9px; line-height:1.5; padding-left:6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.tc-foot { display:flex; align-items:center; justify-content:space-between; padding-left:6px; } .p-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:600; padding:2px 7px; border-radius:99px; text-transform:uppercase; letter-spacing:.04em; }
.p-dot { width:5px; height:5px; border-radius:50%; } .dl-chip { display:inline-flex; align-items:center; gap:3px; font-size:11px; color:var(--text-muted); padding:2px 7px; border-radius:99px; border:1px solid var(--border); background:var(--bg-elevated); }
.dl-chip.ov { color:#f87171; border-color:rgba(248,113,113,0.3); background:rgba(248,113,113,0.08); } .dl-chip.soon { color:#fbbf24; border-color:rgba(251,191,36,0.3); background:rgba(251,191,36,0.08); }
.tc-av { width:22px; height:22px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; font-family:'Syne',sans-serif; }
.col-add { width:100%; padding:8px; border-radius:10px; border:1px dashed var(--border); background:none; color:var(--text-muted); font-size:12px; cursor:pointer; margin-top:3px; }
.empty-col { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; opacity:0.4; font-size:13px; color:var(--text-muted); gap:7px; text-align:center; }
.empty-col-ico { font-size:26px; }
.overlay { position:fixed; inset:0; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; animation:fadeIn .15s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal { background:var(--bg-elevated); border:1px solid var(--border-mid); border-radius:22px; padding:28px; width:480px; max-width:95vw; max-height:90vh; overflow-y:auto; box-shadow:var(--shadow-xl); animation:slideUp .2s; }
@keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.modal-ttl { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; margin-bottom:4px; } .modal-sub { font-size:13px; color:var(--text-muted); margin-bottom:22px; } .modal-foot { display:flex; gap:8px; justify-content:flex-end; margin-top:22px; }
.drawer { position:fixed; right:0; top:0; bottom:0; width:420px; background:var(--bg-elevated); border-left:1px solid var(--border-mid); z-index:100; overflow-y:auto; padding:26px; animation:slideLeft .25s; box-shadow:-8px 0 40px rgba(0,0,0,0.35); }
@keyframes slideLeft { from{transform:translateX(100%)} to{transform:translateX(0)} }
.drawer-hdr { display:flex; align-items:flex-start; gap:12px; margin-bottom:22px; } .drawer-ttl { font-family:'Syne',sans-serif; font-size:17px; font-weight:800; flex:1; line-height:1.35; }
.dr-sec { margin-bottom:22px; } .dr-sec-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.09em; color:var(--text-muted); margin-bottom:9px; }
.dr-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); } .dr-row:last-child { border-bottom:none; }
.dr-key { font-size:13px; color:var(--text-muted); } .dr-val { font-size:13px; color:var(--text-primary); font-weight:500; }
.trans-grid { display:flex; flex-wrap:wrap; gap:7px; } .trans-btn { padding:6px 12px; border-radius:99px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid; background:transparent; }
.field { margin-bottom:16px; } .field-label { display:block; font-size:11px; font-weight:600; color:var(--text-secondary); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.07em; }
.field-input { width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--border-mid); background:var(--bg-card); color:var(--text-primary); font-size:13.5px; outline:none; }
.field-err { color:#f87171; font-size:11.5px; margin-top:4px; } .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.status-badge { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; padding:3px 9px; border-radius:99px; text-transform:uppercase; letter-spacing:0.05em; }
.chip { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:99px; font-size:11px; font-weight:600; background:var(--bg-hover); border:1px solid var(--border); color:var(--text-secondary); }
.overdue-pill { display:flex; align-items:center; gap:5px; padding:4px 10px; border-radius:99px; background:rgba(239,68,68,0.10); border:1px solid rgba(239,68,68,0.20); font-size:12px; color:#f87171; }
.login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg-base); position:relative; overflow:hidden; }
.login-glow-1 { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); top:-100px; left:-100px; pointer-events:none; }
.login-glow-2 { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%); bottom:-80px; right:-80px; pointer-events:none; }
.login-card { background:var(--bg-elevated); border:1px solid var(--border-mid); border-radius:22px; padding:32px; width:400px; max-width:95vw; }
.land { overflow-y:auto; height:100vh; scroll-behavior:smooth; background:var(--bg-base); }
.land-nav { position:sticky; top:0; z-index:50; height:64px; display:flex; align-items:center; padding:0 60px; border-bottom:1px solid var(--border); backdrop-filter:blur(16px); background:rgba(9,9,14,0.80); }
[data-theme="light"] .land-nav { background:rgba(245,245,250,0.85); }
.land-nav-logo { display:flex; align-items:center; gap:10px; } .land-nav-links { display:flex; align-items:center; gap:4px; margin:0 auto; } .land-nav-link { padding:7px 14px; border-radius:8px; font-size:14px; color:var(--text-secondary); cursor:pointer; }
.land-nav-link:hover { color:var(--text-primary); background:var(--bg-hover); } .land-nav-actions { display:flex; align-items:center; gap:8px; }
.land-hero { padding:100px 60px 80px; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; overflow:hidden; }
.land-hero-bg { position:absolute; inset:0; pointer-events:none; background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%); }
.land-hero-grid { position:absolute; inset:0; pointer-events:none; background-image: linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%); }
.land-badge { display:inline-flex; align-items:center; gap:7px; padding:6px 16px; border-radius:99px; border:1px solid rgba(99,102,241,0.3); background:rgba(99,102,241,0.08); font-size:12px; font-weight:600; color:#818cf8; margin-bottom:28px; }
.land[data-theme="light"] .land-badge { color:var(--accent); background:rgba(99,102,241,0.10); }
.land-badge-dot { width:6px; height:6px; border-radius:50%; background:#6366f1; animation:pulse 2s infinite; } @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
.land-h1 { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(40px,6vw,72px); line-height:1.08; margin-bottom:22px; }
.land-h1-accent { background:linear-gradient(135deg,#6366f1,#a78bfa,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.land-sub { font-size:clamp(15px,2vw,18px); color:var(--text-secondary); max-width:560px; line-height:1.7; margin-bottom:36px; font-weight:300; }
.land-ctas { display:flex; gap:12px; align-items:center; margin-bottom:64px; }
.hero-preview { width:100%; max-width:900px; position:relative; } .hero-preview-glow { position:absolute; bottom:-40px; left:50%; transform:translateX(-50%); width:70%; height:60px; background:#6366f1; opacity:0.12; filter:blur(30px); border-radius:50%; pointer-events:none; }
.hero-board { background:var(--bg-surface); border:1px solid var(--border-mid); border-radius:20px; padding:16px; box-shadow:var(--shadow-xl); display:grid; grid-template-columns:repeat(4,1fr); gap:10px; overflow:hidden; }
.hero-col-hdr { display:flex; align-items:center; gap:6px; margin-bottom:8px; padding:6px 8px; border-radius:8px; } .hero-col-dot { width:7px; height:7px; border-radius:50%; }
.hero-col-label { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; } .hero-col-cnt { font-size:10px; font-weight:700; padding:1px 6px; border-radius:99px; margin-left:auto; }
.hero-task { background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:9px 10px; margin-bottom:6px; position:relative; overflow:hidden; }
.hero-task-bar { position:absolute; left:0; top:0; bottom:0; width:2px; } .hero-task-title { font-size:11px; font-weight:500; color:var(--text-primary); padding-left:6px; margin-bottom:5px; }
.hero-task-foot { display:flex; align-items:center; justify-content:space-between; padding-left:6px; } .hero-p { font-size:9px; font-weight:600; padding:1px 5px; border-radius:99px; text-transform:uppercase; }
.hero-av { width:16px; height:16px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:7px; font-weight:700; }
.land-stats { display:flex; border-top:1px solid var(--border); border-bottom:1px solid var(--border); } .land-stat-item { flex:1; padding:28px 24px; text-align:center; border-right:1px solid var(--border); }
.land-stat-item:last-child { border-right:none; } .land-stat-val { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; background:linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.land-stat-label { font-size:13px; color:var(--text-muted); margin-top:4px; }
.land-features, .land-flow { padding:80px 60px; } .land-tech, .land-rules { padding:70px 60px; background:var(--bg-surface); border-top:1px solid var(--border); }
.land-section-tag { font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); margin-bottom:12px; } .land-section-h2 { font-family:'Syne',sans-serif; font-size:clamp(28px,4vw,42px); font-weight:800; margin-bottom:14px; }
.land-section-sub { font-size:16px; color:var(--text-secondary); max-width:500px; line-height:1.65; margin-bottom:52px; font-weight:300; }
.feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; } .feat-card { background:var(--land-card-bg); border:1px solid var(--land-card-border); border-radius:18px; padding:24px; transition:all .2s; }
.feat-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:rgba(99,102,241,0.25); } .feat-icon { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15)); display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:14px; }
.feat-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; margin-bottom:8px; } .feat-desc { font-size:13.5px; color:var(--text-secondary); line-height:1.65; font-weight:300; }
.tech-grid { display:flex; flex-wrap:wrap; gap:10px; margin-top:36px; } .tech-chip { display:flex; align-items:center; gap:10px; padding:12px 18px; border-radius:12px; border:1px solid var(--border-mid); background:var(--bg-card); transition:all .2s; }
.tech-dot { width:8px; height:8px; border-radius:50%; } .tech-name { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; } .tech-role { font-size:11px; color:var(--text-muted); margin-top:1px; }
.flow-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin-top:48px; position:relative; } .flow-steps::before { content:''; position:absolute; top:28px; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent); }
.flow-step { display:flex; flex-direction:column; align-items:center; text-align:center; padding:0 16px; } .flow-num { width:56px; height:56px; border-radius:50%; border:2px solid rgba(99,102,241,0.35); background:rgba(99,102,241,0.08); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:var(--accent); margin-bottom:18px; position:relative; z-index:1; }
.flow-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; margin-bottom:7px; } .flow-desc { font-size:13px; color:var(--text-secondary); line-height:1.6; font-weight:300; }
.rules-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:40px; align-items:start; } .rules-visual { background:var(--land-card-bg); border:1px solid var(--land-card-border); border-radius:18px; padding:24px; }
.rule-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--border); } .rule-row:last-child { border-bottom:none; } .rule-from { font-size:12px; font-weight:700; font-family:'Syne',sans-serif; padding:3px 10px; border-radius:99px; min-width:90px; text-align:center; }
.rule-arrow { color:var(--text-muted); font-size:16px; } .rule-to-list { display:flex; gap:6px; flex-wrap:wrap; } .rule-to { font-size:11px; font-weight:600; padding:2px 9px; border-radius:99px; }
.rule-blocked { font-size:11px; padding:2px 9px; border-radius:99px; background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.2); color:#dc2626; }
.rules-text .rules-bullet { display:flex; align-items:flex-start; gap:12px; margin-bottom:20px; } .rules-ico { width:36px; height:36px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:16px; }
.rules-bullet-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; margin-bottom:4px; } .rules-bullet-desc { font-size:13px; color:var(--text-secondary); line-height:1.6; font-weight:300; }
.land-cta { padding:90px 60px; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; overflow:hidden; } .land-cta-glow { position:absolute; inset:0; background:radial-gradient(ellipse 50% 70% at 50% 50%,rgba(99,102,241,0.12) 0%,transparent 70%); pointer-events:none; }
.land-cta-h2 { font-family:'Syne',sans-serif; font-size:clamp(32px,5vw,54px); font-weight:800; margin-bottom:16px; } .land-cta-sub { font-size:16px; color:var(--text-secondary); max-width:480px; line-height:1.65; margin-bottom:36px; font-weight:300; }
.land-footer { padding:28px 60px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; } .land-footer-copy { font-size:13px; color:var(--text-muted); } .land-footer-links { display:flex; gap:20px; }
.land-footer-link { font-size:13px; color:var(--text-muted); cursor:pointer; } .land-footer-link:hover { color:var(--text-primary); }
.theme-toggle { width:38px; height:38px; border-radius:10px; border:1px solid var(--border); background:var(--bg-elevated); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:17px; }
.theme-toggle:hover { background:var(--bg-hover); border-color:var(--border-mid); }
.color-picker { display:flex; gap:7px; flex-wrap:wrap; } .color-swatch { width:28px; height:28px; border-radius:8px; cursor:pointer; border:3px solid transparent; } .color-swatch.selected { border-color:var(--text-primary); }
@media (max-width: 1024px){ .stats-grid{grid-template-columns:repeat(2,1fr)} .proj-grid,.projects-grid,.feat-grid,.rules-grid{grid-template-columns:1fr 1fr} .hero-board{grid-template-columns:repeat(2,1fr)} .flow-steps{grid-template-columns:1fr 1fr; gap:16px} .flow-steps::before{display:none} }
@media (max-width: 720px){ .sidebar{display:none} .land-nav,.land-features,.land-flow,.land-tech,.land-rules,.land-cta,.land-footer,.land-hero{padding-left:16px;padding-right:16px} .feat-grid,.projects-grid,.proj-grid,.rules-grid,.stats-grid,.hero-board,.flow-steps{grid-template-columns:1fr} .land-nav-links{display:none} .land-footer{flex-direction:column;gap:10px} }
`;
