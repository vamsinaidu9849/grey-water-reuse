push itimport React, { useState } from 'react';
import { Network, Microscope, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useDataset } from '../context/DatasetContext';
import { predictGreywater, generateDefaultDashboardSamples } from '../services/decisionEngine';

export default function AnalysisPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dataset } = useDataset();
  const samples = dataset?.data?.length > 0 ? dataset.data : generateDefaultDashboardSamples();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedSample = samples[selectedIndex] || samples[0];
  const pred = predictGreywater(selectedSample);

  const offset = 440 - (440 * (pred.score / 100));

  let strokeColor = 'var(--status-safe)';
  if (pred.score < 60) strokeColor = 'var(--status-danger)';
  else if (pred.score < 85) strokeColor = 'var(--status-treatment)';

  const parameters = [
    { name: 'pH', key: 'pH', unit: 'pH', min: 0, max: 14, refMin: 6.5, refMax: 8.5, val: parseFloat(selectedSample.pH) || 7.0 },
    { name: 'Turbidity', key: 'Turbidity_NTU', unit: 'NTU', min: 0, max: 50, refMin: 0, refMax: 5.0, val: parseFloat(selectedSample.Turbidity_NTU) || 5.0 },
    { name: 'Total Dissolved Solids (TDS)', key: 'TDS_mg_L', unit: 'mg/L', min: 0, max: 1500, refMin: 0, refMax: 500, val: parseFloat(selectedSample.TDS_mg_L) || 350 },
    { name: 'Biochemical Oxygen Demand (BOD)', key: 'BOD_mg_L', unit: 'mg/L', min: 0, max: 100, refMin: 0, refMax: 10.0, val: parseFloat(selectedSample.BOD_mg_L) || 8.0 },
    { name: 'Chemical Oxygen Demand (COD)', key: 'COD_mg_L', unit: 'mg/L', min: 0, max: 250, refMin: 0, refMax: 50.0, val: parseFloat(selectedSample.COD_mg_L) || 35.0 },
    { name: 'Temperature', key: 'Temperature_C', unit: '°C', min: 10, max: 40, refMin: 18, refMax: 30, val: parseFloat(selectedSample.Temperature_C) || 22.0 },
    { name: 'Electrical Conductivity (EC)', key: 'EC_uS_cm', unit: 'µS/cm', min: 0, max: 2000, refMin: 0, refMax: 1000, val: parseFloat(selectedSample.EC_uS_cm) || 500 },
    { name: 'Dissolved Oxygen (DO)', key: 'DO_mg_L', unit: 'mg/L', min: 0, max: 10, refMin: 4.0, refMax: 10.0, val: parseFloat(selectedSample.DO_mg_L) || 6.0 }
  ];

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="app-main">
        <Topbar setMobileOpen={setMobileOpen} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Water Quality Analysis</h1>
              <p>Detailed sample parameter evaluation against non-potable greywater standards.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Sample:</label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
                className="form-control"
                style={{ minWidth: '240px', fontWeight: 600 }}
              >
                {samples.map((s, idx) => (
                  <option key={idx} value={idx}>{s.Sample_ID || `Sample-${idx + 1}`} — pH {s.pH || 7.0}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Analysis Hero Grid */}
          <div className="analysis-hero-grid">
            {/* Score Gauge */}
            <div className="glass-card score-card-gauge">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Water Quality Score</span>

              <div className="score-circle-container">
                <svg viewBox="0 0 160 160">
                  <circle class="score-circle-bg" cx="80" cy="80" r="70"></circle>
                  <circle
                    className="score-circle-progress"
                    cx="80"
                    cy="80"
                    r="70"
                    style={{ strokeDashoffset: offset, stroke: strokeColor }}
                  ></circle>
                </svg>
                <div className="score-text-overlay">
                  <h2>{pred.score}</h2>
                  <span>Score / 100</span>
                </div>
              </div>

              <div className={`badge ${pred.badgeClass}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                {pred.statusText}
              </div>
            </div>

            {/* Description Protocol Card */}
            <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Network size={22} color="var(--accent-cyan)" /> Parameter Evaluation Protocol
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.98rem', marginBottom: '1.2rem' }}>
                The Water Quality Score (WQS) aggregates physical, chemical, and biological measurements including pH, Turbidity, Total Dissolved Solids, BOD, COD, and dissolved oxygen. Values are benchmarked against EPA, WHO, and regional greywater reuse guidelines.
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <div><CheckCircle2 size={14} color="var(--status-safe)" /> <strong>Normal:</strong> Optimal threshold</div>
                <div><AlertTriangle size={14} color="var(--status-caution)" /> <strong>Moderate:</strong> Treatment needed</div>
                <div><XCircle size={14} color="var(--status-danger)" /> <strong>Critical:</strong> Exceeds limit</div>
              </div>
            </div>
          </div>

          {/* Parameter Health Cards Grid */}
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Microscope size={22} color="var(--accent-cyan)" /> Parameter Health Indicators
          </h3>

          <div className="params-cards-grid">
            {parameters.map(p => {
              let statusPill = <span className="badge badge-safe">NORMAL</span>;
              let fillPct = Math.min(100, Math.max(5, ((p.val - p.min) / (p.max - p.min)) * 100));
              let fillBg = 'var(--accent-cyan)';

              if (p.name === 'pH') {
                if (p.val < 6.5 || p.val > 8.5) {
                  statusPill = <span className="badge badge-danger">CRITICAL</span>;
                  fillBg = 'var(--status-danger)';
                }
              } else if (p.name === 'Dissolved Oxygen (DO)') {
                if (p.val < 4.0) {
                  statusPill = <span className="badge badge-caution">LOW</span>;
                  fillBg = 'var(--status-caution)';
                }
              } else {
                if (p.val > p.refMax * 2) {
                  statusPill = <span className="badge badge-danger">HIGH</span>;
                  fillBg = 'var(--status-danger)';
                } else if (p.val > p.refMax) {
                  statusPill = <span className="badge badge-treatment">MODERATE</span>;
                  fillBg = 'var(--status-treatment)';
                }
              }

              return (
                <div key={p.name} className="param-card">
                  <div className="param-card-header">
                    <h4>{p.name}</h4>
                    {statusPill}
                  </div>
                  <div className="param-val-large">{p.val.toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.unit}</span></div>
                  <div className="param-range-info">Standard Ref: {p.refMin} – {p.refMax} {p.unit}</div>
                  <div className="param-progress-track">
                    <div className="param-progress-fill" style={{ width: `${fillPct}%`, background: fillBg }}></div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
