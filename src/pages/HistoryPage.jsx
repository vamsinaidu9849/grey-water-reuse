import React, { useState } from 'react';
import Papa from 'papaparse';
import { Download, Trash2, Clock, Search } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useDataset } from '../context/DatasetContext';

export default function HistoryPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { history, deleteHistoryRecord, clearHistory, showToast } = useDataset();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVal, setFilterVal] = useState('ALL');

  const filteredHistory = history.filter(item => {
    const matchSearch = String(item.sampleId).toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                        String(item.recommendation).toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                        String(item.date).toLowerCase().includes(searchQuery.toLowerCase().trim());

    let matchFilter = true;
    if (filterVal === 'SAFE') matchFilter = item.score >= 85;
    if (filterVal === 'TREATMENT') matchFilter = item.score >= 60 && item.score < 85;
    if (filterVal === 'DANGER') matchFilter = item.score < 60;

    return matchSearch && matchFilter;
  });

  const handleExportCSV = () => {
    if (history.length === 0) {
      showToast("No history logs to export.", "warning");
      return;
    }
    const csv = Papa.unparse(history);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GreyAI_History_Export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("History log exported to CSV!", "success");
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all historical logs?")) {
      clearHistory();
      showToast("Analysis history cleared.", "info");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="app-main">
        <Topbar setMobileOpen={setMobileOpen} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Analysis History Log</h1>
              <p>Review and export past greywater quality evaluation records in React.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn btn-outline-cyan btn-sm" onClick={handleExportCSV}>
                <Download size={14} /> Export History CSV
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleClear}>
                <Trash2 size={14} /> Clear History
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.88rem' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              </div>
              <select
                value={filterVal}
                onChange={(e) => setFilterVal(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.88rem', padding: '0.4rem 0.8rem' }}
              >
                <option value="ALL">All Classifications</option>
                <option value="SAFE">Suitable for Direct Reuse</option>
                <option value="TREATMENT">Suitable After Treatment</option>
                <option value="DANGER">Not Recommended</option>
              </select>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Synced in React State & LocalStorage</span>
          </div>

          {/* History Table */}
          <div className="glass-card" style={{ padding: '1.6rem', marginBottom: '2rem' }}>
            {filteredHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>No Analysis History Found</h3>
                <p>Run a prediction on the Recommendations page to populate history logs.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Sample ID</th>
                      <th>Quality Score</th>
                      <th>Classification</th>
                      <th>Confidence</th>
                      <th>Recommendation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map(item => {
                      let badge = <span className="badge badge-safe">SAFE</span>;
                      if (item.score < 60) badge = <span className="badge badge-danger">NOT RECOMMENDED</span>;
                      else if (item.score < 85) badge = <span className="badge badge-treatment">TREATMENT REQUIRED</span>;

                      return (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td><strong>{item.sampleId}</strong></td>
                          <td style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{item.score} / 100</td>
                          <td>{badge}</td>
                          <td>{item.confidence}%</td>
                          <td>{item.recommendation}</td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => { deleteHistoryRecord(item.id); showToast("Record deleted", "info"); }}>
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
