import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>TaskFlow</h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          📊 Dashboard
        </NavLink>
        <NavLink to="/projects" className="sidebar-link">
          📁 Projects
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
