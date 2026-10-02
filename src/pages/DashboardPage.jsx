import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { TestTube, CheckCircle2, Cog, AlertTriangle, ChartBar, Activity, PieChart, Upload, Plus, Brain } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useDataset } from '../context/DatasetContext';
import { useTheme } from '../context/ThemeContext';
import { predictGreywater } from '../services/decisionEngine';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dataset } = useDataset();
  const { theme } = useTheme();

  const samples = dataset?.data || [];
  const totalCount = samples.length;

  let safeCount = 0;
  let treatmentCount = 0;
  let dangerCount = 0;

  samples.forEach(row => {
    const pred = predictGreywater(row);
    if (pred.score >= 85) safeCount++;
    else if (pred.score >= 60) treatmentCount++;
    else dangerCount++;
  });

  const safePct = totalCount > 0 ? ((safeCount / totalCount) * 100).toFixed(1) : '0.0';
  const treatPct = totalCount > 0 ? ((treatmentCount / totalCount) * 100).toFixed(1) : '0.0';

  const isDark = theme !== 'light';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Chart 1: pH Distribution Histogram
  const phBins = { '< 6.5': 0, '6.5 - 7.0': 0, '7.1 - 7.5': 0, '7.6 - 8.0': 0, '8.1 - 8.5': 0, '> 8.5': 0 };
  samples.forEach(s => {
    const ph = parseFloat(s.pH) || 7.0;
    if (ph < 6.5) phBins['< 6.5']++;
    else if (ph <= 7.0) phBins['6.5 - 7.0']++;
    else if (ph <= 7.5) phBins['7.1 - 7.5']++;
    else if (ph <= 8.0) phBins['7.6 - 8.0']++;
    else if (ph <= 8.5) phBins['8.1 - 8.5']++;
    else phBins['> 8.5']++;
  });

  const phData = {
    labels: Object.keys(phBins),
    datasets: [{
      label: 'Sample Count',
      data: Object.values(phBins),
      backgroundColor: ['#ef4444', '#00b4d8', '#00f5d4', '#00b4d8', '#0a9396', '#f59e0b'],
      borderRadius: 6
    }]
  };

  // Chart 2: Turbidity vs TDS
  const slicedSamples = samples.slice(0, 15);
  const turbTdsData = {
    labels: slicedSamples.map((s, i) => s.Sample_ID || `S-${i + 1}`),
    datasets: [
      {
        label: 'Turbidity (NTU)',
        data: slicedSamples.map(s => parseFloat(s.Turbidity_NTU) || 5),
        borderColor: '#00f5d4',
        backgroundColor: 'rgba(0, 245, 212, 0.15)',
        yAxisID: 'y1',
        tension: 0.3,
        fill: true
      },
      {
        label: 'TDS (mg/L)',
        data: slicedSamples.map(s => parseFloat(s.TDS_mg_L) || 350),
        borderColor: '#00b4d8',
        backgroundColor: 'transparent',
        yAxisID: 'y2',
        tension: 0.3
      }
    ]
  };

  // Chart 3: BOD vs COD
  const slicedBod = samples.slice(0, 12);
  const bodCodData = {
    labels: slicedBod.map((s, i) => s.Sample_ID || `S-${i + 1}`),
    datasets: [
      {
        label: 'BOD (mg/L)',
        data: slicedBod.map(s => parseFloat(s.BOD_mg_L) || 12),
        backgroundColor: '#0a9396',
        borderRadius: 6
      },
      {
        label: 'COD (mg/L)',
        data: slicedBod.map(s => parseFloat(s.COD_mg_L) || 45),
        backgroundColor: '#3b82f6',
        borderRadius: 6
      }
    ]
  };

  // Chart 4: Classification
  const classData = {
    labels: ['Suitable for Direct Reuse', 'Suitable After Treatment', 'Not Recommended'],
    datasets: [{
      data: [safeCount, treatmentCount, dangerCount],
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
      borderWidth: 0
    }]
  };

  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor } },
      y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true }
    }
  };

  const latestSample = samples[0] || {};
  const latestPred = predictGreywater(latestSample);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="app-main">
        <Topbar setMobileOpen={setMobileOpen} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Greywater Intelligence Dashboard</h1>
              <p>Monitor, analyze and optimize greywater reuse decisions in React.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <NavLink to="/dataset" className="btn btn-secondary btn-sm"><Upload size={14} /> Upload Dataset</NavLink>
              <NavLink to="/recommendations" className="btn btn-primary btn-sm"><Plus size={14} /> New AI Prediction</NavLink>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="glass-card kpi-card">
              <div className="kpi-info">
                <span className="label">Total Samples</span>
                <h2 className="val">{totalCount.toLocaleString()}</h2>
                <div className="kpi-trend up"><Activity size={14} /> Active Dataset</div>
              </div>
              <div className="kpi-icon"><TestTube size={24} /></div>
            </div>

            <div className="glass-card kpi-card kpi-safe">
              <div className="kpi-info">
                <span className="label">Suitable for Reuse</span>
                <h2 className="val">{safeCount.toLocaleString()}</h2>
                <div className="kpi-trend up">{safePct}% of total</div>
              </div>
              <div className="kpi-icon"><CheckCircle2 size={24} /></div>
            </div>

            <div className="glass-card kpi-card kpi-treatment">
              <div className="kpi-info">
                <span className="label">Treatment Required</span>
                <h2 className="val">{treatmentCount.toLocaleString()}</h2>
                <div className="kpi-trend" style={{ color: 'var(--status-treatment)' }}>{treatPct}% of total</div>
              </div>
              <div className="kpi-icon"><Cog size={24} /></div>
            </div>

            <div className="glass-card kpi-card kpi-danger">
              <div className="kpi-info">
                <span className="label">Not Recommended</span>
                <h2 className="val">{dangerCount.toLocaleString()}</h2>
                <div className="kpi-trend down"><AlertTriangle size={14} /> High Risk</div>
              </div>
              <div className="kpi-icon"><AlertTriangle size={24} /></div>
            </div>
          </div>

          {/* AI Summary Card */}
          <div className="glass-card" style={{ padding: '1.6rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} color="var(--accent-cyan)" /> AI Recommendation Summary
            </h3>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latest Sample Analysis</span>
                  <h3 style={{ fontSize: '1.4rem' }}>{latestSample.Sample_ID || 'GW-Sample-Latest'}</h3>
                </div>
                <span className={`badge ${latestPred.badgeClass}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  {latestPred.statusText}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.2rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Water Quality Score</span>
                  <h2 style={{ fontSize: '2.2rem', color: 'var(--accent-cyan)', lineHeight: 1 }}>{latestPred.score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span></h2>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Model Confidence</span>
                  <h2 style={{ fontSize: '2.2rem', color: 'var(--accent-aqua)', lineHeight: 1 }}>{latestPred.confidence}%</h2>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Recommended Applications:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {latestPred.applications.filter(a => a.suitable).map((a, i) => (
                    <span key={i} className="badge badge-safe"><CheckCircle2 size={12} /> {a.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid 2x2 */}
          <div className="charts-grid-2x2">
            <div className="glass-card chart-card">
              <div className="chart-header">
                <h3><ChartBar size={18} color="var(--accent-cyan)" /> pH Distribution</h3>
                <span className="badge badge-safe">Normal: 6.5 - 8.5</span>
              </div>
              <div className="chart-container">
                <Bar data={phData} options={{ ...chartOptionsBase, plugins: { legend: { display: false } } }} />
              </div>
            </div>

            <div className="glass-card chart-card">
              <div className="chart-header">
                <h3><Activity size={18} color="var(--accent-aqua)" /> Turbidity vs. TDS</h3>
                <span className="badge badge-treatment">Clarity & Salinity</span>
              </div>
              <div className="chart-container">
                <Line data={turbTdsData} options={{
                  ...chartOptionsBase,
                  scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y1: { type: 'linear', display: true, position: 'left', grid: { color: gridColor }, ticks: { color: textColor } },
                    y2: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: textColor } }
                  }
                }} />
              </div>
            </div>

            <div className="glass-card chart-card">
              <div className="chart-header">
                <h3><ChartBar size={18} color="var(--accent-teal)" /> BOD vs. COD Degradation</h3>
                <span className="badge badge-caution">Organic Load</span>
              </div>
              <div className="chart-container">
                <Bar data={bodCodData} options={chartOptionsBase} />
              </div>
            </div>

            <div className="glass-card chart-card">
              <div className="chart-header">
                <h3><PieChart size={18} color="var(--accent-cyan)" /> Sample Classification</h3>
                <span className="badge badge-safe">Distribution</span>
              </div>
              <div className="chart-container">
                <Doughnut data={classData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor } } } }} />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
