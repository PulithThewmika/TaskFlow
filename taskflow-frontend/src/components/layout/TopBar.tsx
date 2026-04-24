import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

const TopBar: React.FC = () => {
  const { user, clearAuth } = useAuthContext();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        {/* Breadcrumb can be expanded later */}
      </div>
      <div className="topbar-user">
        {user && (
          <>
            <span className="topbar-username">{user.name}</span>
            <div className="topbar-avatar">{getInitials(user.name)}</div>
          </>
        )}
        <button onClick={clearAuth} className="topbar-logout">
          Sign out
        </button>
      </div>
    </header>
  );
};

export default TopBar;
