import React from 'react';
import { NavLink } from 'react-router-dom';
import { Droplet } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-brand">
          <NavLink to="/" className="brand-logo">
            <div className="brand-icon"><Droplet size={22} /></div>
            <span>Grey<span className="cyan-text">AI</span></span>
          </NavLink>
          <p>Turning Water Quality Data into Intelligent Reuse Decisions. Final-year academic research project prototype.</p>
        </div>
        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            <li><NavLink to="/dataset">Dataset Upload</NavLink></li>
            <li><NavLink to="/analysis">Water Analysis</NavLink></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>AI Features</h4>
          <ul>
            <li><NavLink to="/recommendations">AI Prediction</NavLink></li>
            <li><NavLink to="/history">Analysis History</NavLink></li>
            <li><NavLink to="/reports">Printable Reports</NavLink></li>
            <li><a href="/datasets/dataset_description.txt" target="_blank" rel="noreferrer">Dataset Schema</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Academic Project</h4>
          <ul>
            <li><span>Domain: Environmental AI</span></li>
            <li><span>Tech: Vite, React 18, Chart.js</span></li>
            <li><span>Parser: PapaParse CSV</span></li>
            <li><span>Status: Demonstration Ready</span></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 GreyAI — Academic Research Project. All rights reserved.</span>
        <span>Designed for B.Tech Final Year Presentation & Demo</span>
      </div>
    </footer>
  );
}
