import React from 'react';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ setMobileOpen }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button className="mobile-nav-toggle" onClick={() => setMobileOpen(prev => !prev)}>
          <Menu size={20} />
        </button>
        <div className="topbar-search">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search parameters or samples..." />
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="badge-dot"></span>
        </button>
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="user-profile-badge">
          <div className="avatar-img">AI</div>
          <div className="user-info">
            <span className="name">Research Demo</span>
            <span className="role">B.Tech Project</span>
          </div>
        </div>
      </div>
    </header>
  );
}
