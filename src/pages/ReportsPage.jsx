import React, { useState } from 'react';
import Papa from 'papaparse';
import { Printer, Download, Droplet } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useDataset } from '../context/DatasetContext';
import { predictGreywater, generateDefaultDashboardSamples } from '../services/decisionEngine';

export default function ReportsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dataset, showToast } = useDataset();
  const samples = dataset?.data?.length > 0 ? dataset.data : generateDefaultDashboardSamples();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedSample = samples[selectedIndex] || samples[0];
  const pred = predictGreywater(selectedSample);

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const reportData = [{
      Report_ID: 'RPT-' + Date.now().toString().slice(-6),
      Sample_ID: selectedSample.Sample_ID || 'GW-SAMPLE-001',
      Water_Quality_Score: pred.score,
      Suitability_Class: pred.suitabilityClass,
      Status: pred.statusText,
      Confidence: pred.confidence + '%',
      Recommended_Applications: pred.applications.filter(a => a.suitable).map(a => a.name).join('; '),
      Required_Treatments: pred.requiredTreatments.join('; ')
    }];

    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GreyAI_Report_${selectedSample.Sample_ID || 'Sample'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Report exported to CSV!", "success");
  };

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="app-main">
        <Topbar setMobileOpen={setMobileOpen} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Academic Research Reports</h1>
              <p>Generate, preview, print, and export formal water quality decision reports in React.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
                className="form-control"
                style={{ fontSize: '0.88rem', minWidth: '220px' }}
              >
                {samples.slice(0, 30).map((s, idx) => (
                  <option key={idx} value={idx}>{s.Sample_ID || `Sample-${idx + 1}`} — pH {s.pH || 7.0}</option>
                ))}
              </select>
              <button className="btn btn-outline-cyan btn-sm" onClick={handleExportCSV}>
                <Download size={14} /> Export Report CSV
              </button>
              <button className="btn btn-primary btn-sm" onClick={handlePrint}>
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Printable Report Paper */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="report-paper">
              <div className="report-header-row">
                <div>
                  <div className="report-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplet color="#00b4d8" size={24} /> GreyAI
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.88rem' }}>AI-Driven Intelligent Greywater Reuse Recommendation System</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${pred.badgeClass}`} style={{ fontSize: '1rem', padding: '0.6rem 1.2rem' }}>{pred.statusText}</span>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.4rem' }}>Report ID: RPT-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>

              <table className="report-meta-table">
                <tbody>
                  <tr>
                    <td><strong>Project Title:</strong> AI-Driven Greywater Quality & Reuse Analysis</td>
                    <td><strong>Date Generated:</strong> {dateStr}</td>
                  </tr>
                  <tr>
                    <td><strong>Sample ID:</strong> {selectedSample.Sample_ID || 'GW-SAMPLE-001'}</td>
                    <td><strong>Model Confidence:</strong> {pred.confidence}%</td>
                  </tr>
                  <tr>
                    <td><strong>Water Quality Score:</strong> {pred.score} / 100</td>
                    <td><strong>Classification:</strong> {pred.suitabilityClass}</td>
                  </tr>
                </tbody>
              </table>

              <h3>1. Executive Summary</h3>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                This report presents the decision-support evaluation for greywater sample <strong>{selectedSample.Sample_ID || 'GW-SAMPLE-001'}</strong>.
                The evaluation was executed by GreyAI using scientific reference ranges (EPA/WHO greywater standards).
                Overall suitability is evaluated as <strong>{pred.suitabilityClass}</strong> with a Water Quality Score of <strong>{pred.score}/100</strong>.
              </p>

              <h3>2. Water Quality Parameter Values</h3>
              <table className="report-table">
                <thead>
                  <tr><th>Parameter Name</th><th>Measured Value</th></tr>
                </thead>
                <tbody>
                  {Object.keys(selectedSample)
                    .filter(k => k !== 'Sample_ID' && k !== 'Reuse_Suitability' && k !== 'Recommendation')
                    .map(k => (
                      <tr key={k}>
                        <td><strong>{k.replace(/_/g, ' ')}</strong></td>
                        <td>{selectedSample[k]}</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <h3>3. Approved Non-Potable Reuse Applications</h3>
              <table className="report-table">
                <thead>
                  <tr><th>Application</th><th>Status</th><th>Guidelines & Limitations</th></tr>
                </thead>
                <tbody>
                  {pred.applications.map((a, i) => (
                    <tr key={i}>
                      <td><strong>{a.name}</strong></td>
                      <td><span style={{ fontWeight: 700, color: a.suitable ? '#059669' : '#dc2626' }}>{a.status}</span></td>
                      <td>{a.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>4. Required Treatment Sequence</h3>
              <ul style={{ marginLeft: '1.5rem', fontSize: '0.9rem', color: '#334155', marginBottom: '1.8rem' }}>
                {pred.requiredTreatments.map((t, i) => (
                  <li key={i} style={{ marginBottom: '0.3rem' }}>{t}</li>
                ))}
              </ul>

              <h3>5. Standard Safety & Regulatory Disclaimer</h3>
              <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '8px', fontSize: '0.82rem', color: '#92400e', marginTop: '1.5rem' }}>
                <strong>Notice:</strong> This document is generated as an academic decision-support prototype output based on parameter input thresholds. Real-world greywater reuse requires formal certified laboratory validation, treatment compliance, and alignment with local municipal water standards.
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
