import React, { useState } from 'react';
import { Sliders, Play, Brain, CheckCircle2, AlertTriangle, Cog, ShieldCheck, ListCheck } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useDataset } from '../context/DatasetContext';
import { predictGreywater, generateDefaultDashboardSamples } from '../services/decisionEngine';

export default function RecommendationsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dataset, addHistoryRecord } = useDataset();
  const samples = dataset?.data?.length > 0 ? dataset.data : generateDefaultDashboardSamples();

  const [formData, setFormData] = useState({
    pH: '7.2',
    Turbidity_NTU: '3.4',
    TDS_mg_L: '320',
    BOD_mg_L: '8.5',
    COD_mg_L: '35',
    Temperature_C: '22.4',
    EC_uS_cm: '510',
    DO_mg_L: '5.8'
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(() => predictGreywater(formData));

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAutofill = (e) => {
    const idx = parseInt(e.target.value, 10);
    if (isNaN(idx)) return;
    const s = samples[idx];
    setFormData({
      pH: String(s.pH || 7.2),
      Turbidity_NTU: String(s.Turbidity_NTU || 3.4),
      TDS_mg_L: String(s.TDS_mg_L || 320),
      BOD_mg_L: String(s.BOD_mg_L || 8.5),
      COD_mg_L: String(s.COD_mg_L || 35),
      Temperature_C: String(s.Temperature_C || 22.4),
      EC_uS_cm: String(s.EC_uS_cm || 510),
      DO_mg_L: String(s.DO_mg_L || 5.8)
    });
  };

  const handleRunAnalysis = (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep('Normalizing physical-chemical parameters...');

    setTimeout(() => {
      setLoadingStep('Evaluating WHO/EPA greywater standards...');
    }, 400);

    setTimeout(() => {
      setLoadingStep('Calculating neural decision confidence...');
    }, 800);

    setTimeout(() => {
      const pred = predictGreywater(formData);
      setResult(pred);
      setLoading(false);

      // Save to History Context
      addHistoryRecord({
        id: 'REC-' + Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sampleId: 'Manual-Input-' + Math.floor(100 + Math.random() * 900),
        score: pred.score,
        suitabilityClass: pred.suitabilityClass,
        statusText: pred.statusText,
        confidence: pred.confidence,
        recommendation: pred.applications.filter(a => a.suitable).map(a => a.name).join(', ') || 'No Direct Reuse'
      });
    }, 1200);
  };

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="app-main">
        <Topbar setMobileOpen={setMobileOpen} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>AI-Based Greywater Reuse Prediction</h1>
              <p>Input water quality parameters to trigger intelligent neural evaluation and reuse recommendations.</p>
            </div>
            <div>
              <select onChange={handleAutofill} className="form-control" style={{ fontSize: '0.88rem' }}>
                <option value="">-- Choose Sample to Autofill --</option>
                {samples.slice(0, 20).map((s, idx) => (
                  <option key={idx} value={idx}>{s.Sample_ID || `Sample-${idx + 1}`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={20} color="var(--accent-cyan)" /> Water Quality Parameters Input
            </h3>

            {loading && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(11, 19, 43, 0.92)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-lg)',
                zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem'
              }}>
                <Brain size={48} className="spin-icon" color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.3rem' }}>{loadingStep}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Decision Engine Processing</span>
              </div>
            )}

            <form onSubmit={handleRunAnalysis}>
              <div className="predict-form-grid">
                <div className="form-group">
                  <label>pH Level (pH units)</label>
                  <input type="number" step="0.1" id="pH" value={formData.pH} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Turbidity (NTU)</label>
                  <input type="number" step="0.1" id="Turbidity_NTU" value={formData.Turbidity_NTU} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Total Dissolved Solids (mg/L)</label>
                  <input type="number" step="1" id="TDS_mg_L" value={formData.TDS_mg_L} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>BOD (mg/L)</label>
                  <input type="number" step="0.1" id="BOD_mg_L" value={formData.BOD_mg_L} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>COD (mg/L)</label>
                  <input type="number" step="1" id="COD_mg_L" value={formData.COD_mg_L} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input type="number" step="0.1" id="Temperature_C" value={formData.Temperature_C} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Electrical Conductivity (µS/cm)</label>
                  <input type="number" step="1" id="EC_uS_cm" value={formData.EC_uS_cm} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Dissolved Oxygen (mg/L)</label>
                  <input type="number" step="0.1" id="DO_mg_L" value={formData.DO_mg_L} onChange={handleInputChange} className="form-control" required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary btn-lg"><Play size={18} /> Run AI Analysis</button>
              </div>
            </form>
          </div>

          {/* Results Display */}
          {result && (
            <div style={{ marginTop: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Prediction Output</span>
                    <h2 style={{ fontSize: '2rem' }}>{result.suitabilityClass}</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Water Quality Score</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{result.score}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>AI Confidence</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>{result.confidence}%</span>
                    </div>
                    <span className={`badge ${result.badgeClass}`} style={{ fontSize: '1rem', padding: '0.6rem 1.2rem' }}>{result.statusText}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} color="var(--accent-cyan)" /> Recommended Reuse Applications
                </h3>

                <div className="suitability-grid">
                  {result.applications.map((app, i) => {
                    let badgeStyle = 'badge-safe';
                    if (app.status === 'Conditional') badgeStyle = 'badge-caution';
                    if (app.status === 'Not Recommended') badgeStyle = 'badge-danger';

                    return (
                      <div key={i} className="suitability-card">
                        <div className="suitability-card-icon"><CheckCircle2 size={32} /></div>
                        <h4>{app.name}</h4>
                        <div><span className={`badge ${badgeStyle}`}>{app.status}</span></div>
                        <p>{app.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.6rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cog size={18} color="var(--accent-cyan)" /> Required Treatment Sequence
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {result.requiredTreatments.map((t, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Cog size={14} color="var(--accent-cyan)" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card" style={{ padding: '1.6rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ListCheck size={18} color="var(--accent-cyan)" /> Parameter Reasoning & Logic
                  </h3>
                  <div>
                    {result.reasoning.map((r, i) => (
                      <div key={i} style={{ marginBottom: '0.6rem', fontSize: '0.92rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {r.status === 'pass' && <CheckCircle2 size={16} color="var(--status-safe)" />}
                        {r.status === 'warn' && <AlertTriangle size={16} color="var(--status-caution)" />}
                        {r.status === 'fail' && <AlertTriangle size={16} color="var(--status-danger)" />}
                        {r.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="disclaimer-banner">
                <ShieldCheck className="disclaimer-icon" size={28} />
                <div className="disclaimer-text">
                  <h4>Regulatory & Safety Decision Support Notice</h4>
                  <p>
                    Recommendations are decision-support outputs and should be validated against applicable local regulations, treatment requirements, and professional water-quality assessment before real-world reuse.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
