import React from 'react';
import { NavLink } from 'react-router-dom';
import { Droplet, PieChart, Database, FlaskConical, Brain, RotateCcw, FileText } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { dataset } = useDataset();
  const sampleCount = dataset?.data?.length || 0;

  return (
    <aside className={`app-sidebar ${mobileOpen ? 'show' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/" className="brand-logo">
          <div className="brand-icon"><Droplet size={22} /></div>
          <span>Grey<span class="cyan-text">AI</span></span>
        </NavLink>
      </div>

      <nav className="sidebar-menu">
        <div className="sidebar-menu-category">Main Menu</div>
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <PieChart size={18} /> <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dataset" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <Database size={18} /> <span>Dataset</span>
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <FlaskConical size={18} /> <span>Water Quality</span>
        </NavLink>
        <NavLink to="/recommendations" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <Brain size={18} /> <span>AI Prediction</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <RotateCcw size={18} /> <span>History</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <FileText size={18} /> <span>Reports</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-dataset-status">
          <span className="status-title">Loaded Dataset</span>
          <span className="status-val">{sampleCount > 0 ? `${sampleCount} Samples` : 'No Dataset'}</span>
        </div>
      </div>
    </aside>
  );
}
