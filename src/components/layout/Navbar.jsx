import React from 'react';
import { NavLink } from 'react-router-dom';
import { Droplet, Upload, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="landing-nav">
      <div className="nav-container">
        <NavLink to="/" className="brand-logo">
          <div className="brand-icon"><Droplet size={22} /></div>
          <span>Grey<span className="cyan-text">AI</span></span>
        </NavLink>

        <ul className="nav-links">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/dataset">Dataset</NavLink></li>
          <li><NavLink to="/analysis">Analysis</NavLink></li>
          <li><NavLink to="/recommendations">Recommendations</NavLink></li>
          <li><NavLink to="/history">History</NavLink></li>
          <li><NavLink to="/reports">Reports</NavLink></li>
        </ul>

        <div className="nav-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <NavLink to="/dataset" className="btn btn-secondary btn-sm"><Upload size={14} /> Upload CSV</NavLink>
          <NavLink to="/dashboard" className="btn btn-primary btn-sm">Get Started <ArrowRight size={14} /></NavLink>
        </div>
      </div>
    </nav>
  );
}
