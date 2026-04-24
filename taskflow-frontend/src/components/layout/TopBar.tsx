import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

const TopBar: React.FC = () => {
  const { user, clearAuth } = useAuthContext();

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        {/* Breadcrumb placeholder */}
      </div>
      <div className="topbar-user">
        {user && <span className="topbar-username">{user.name}</span>}
        <button onClick={clearAuth} className="topbar-logout">
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopBar;
