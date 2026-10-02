import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DatasetProvider, useDataset } from './context/DatasetContext';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DatasetPage from './pages/DatasetPage';
import AnalysisPage from './pages/AnalysisPage';
import RecommendationsPage from './pages/RecommendationsPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';

import './styles/index.css';
import './styles/dashboard.css';
import './styles/responsive.css';

function ToastContainer() {
  const { toast } = useDataset();
  if (!toast) return null;

  return (
    <div id="toast-container">
      <div className={`toast toast-${toast.type}`}>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DatasetProvider>
        <Router>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dataset" element={<DatasetPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </Router>
      </DatasetProvider>
    </ThemeProvider>
  );
}
