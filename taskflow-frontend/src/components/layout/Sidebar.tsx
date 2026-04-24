import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">T</div>
        <h1>TaskFlow</h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink
          to="/projects"
          className={`sidebar-link ${isActive('/projects') ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Projects
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
