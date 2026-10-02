import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, Database, Calculator, Table, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useDataset } from '../context/DatasetContext';
import { predictGreywater } from '../services/decisionEngine';

export default function DatasetPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dataset, setDataset, showToast } = useDataset();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('Sample_ID');
  const [sortAsc, setSortAsc] = useState(true);
  const [loadingSample, setLoadingSample] = useState(false);

  const currentRows = dataset?.data || [];

  const handleFileUpload = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      showToast('Please upload a valid CSV file.', 'danger');
      return;
    }

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          showToast('CSV file is empty or corrupted.', 'danger');
          return;
        }

        const cleanData = results.data.map((row, idx) => ({
          ...row,
          Sample_ID: row.Sample_ID || `GW-UP-${String(idx + 1).padStart(3, '0')}`
        }));

        setDataset({
          filename: file.name,
          filesize: sizeStr,
          uploadedAt: new Date().toLocaleString(),
          data: cleanData
        });

        showToast(`Parsed "${file.name}" (${cleanData.length} rows) successfully!`, 'success');
      }
    });
  };

  const handleLoadSampleDataset = () => {
    setLoadingSample(true);
    Papa.parse('/datasets/greywater_quality_dataset.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setLoadingSample(false);
        if (results.data && results.data.length > 0) {
          setDataset({
            filename: 'greywater_quality_dataset.csv',
            filesize: '18.4 KB',
            uploadedAt: new Date().toLocaleString(),
            data: results.data
          });
          showToast('Loaded sample dataset (100 rows)!', 'success');
        }
      },
      error: () => {
        setLoadingSample(false);
        showToast('Failed to load sample dataset file.', 'warning');
      }
    });
  };

  // Statistical Parameter Metrics Calculation
  const numericKeys = ['pH', 'Turbidity_NTU', 'TDS_mg_L', 'BOD_mg_L', 'COD_mg_L', 'Temperature_C', 'EC_uS_cm', 'DO_mg_L'];
  const statsList = numericKeys.map(key => {
    const values = currentRows
      .map(r => parseFloat(r[key]))
      .filter(v => !isNaN(v));

    if (values.length === 0) return null;
    values.sort((a, b) => a - b);

    const min = values[0];
    const max = values[values.length - 1];
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / values.length;
    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { key, mean, median, min, max, stdDev };
  }).filter(Boolean);

  // Search & Filter
  const filteredRows = currentRows.filter(row => {
    return Object.values(row).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase().trim()));
  });

  // Sort
  filteredRows.sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    valA = String(valA || '').toLowerCase();
    valB = String(valB || '').toLowerCase();
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  const columns = currentRows.length > 0 ? Object.keys(currentRows[0]) : [];

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortAsc(prev => !prev);
    } else {
      setSortColumn(col);
      setSortAsc(true);
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
              <h1>Greywater Dataset Management</h1>
              <p>Upload, parse, and analyze greywater quality datasets in React.</p>
            </div>
            <div>
              <button className="btn btn-outline-cyan btn-sm" onClick={handleLoadSampleDataset} disabled={loadingSample}>
                <Database size={14} /> {loadingSample ? 'Loading...' : 'Load Sample Dataset (100 Rows)'}
              </button>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            className="upload-dropzone"
            onClick={() => document.getElementById('react-file-input').click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
          >
            <UploadCloud size={54} className="upload-icon" />
            <h3>Drag and drop your greywater CSV dataset here</h3>
            <p>Supported format: .CSV (pH, Turbidity, TDS, BOD, COD, Temp, EC, DO, etc.)</p>
            <input
              type="file"
              id="react-file-input"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); document.getElementById('react-file-input').click(); }}>
              <FileSpreadsheet size={16} /> Choose CSV File
            </button>
          </div>

          {/* Metadata Chip Bar */}
          <div className="dataset-stats-bar">
            <div className="meta-chip">
              <span className="meta-label">File Name</span>
              <h4 className="meta-val" style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dataset?.filename || 'No File'}</h4>
            </div>
            <div className="meta-chip">
              <span className="meta-label">File Size</span>
              <h4 className="meta-val">{dataset?.filesize || '-'}</h4>
            </div>
            <div className="meta-chip">
              <span className="meta-label">Total Rows</span>
              <h4 className="meta-val">{currentRows.length.toLocaleString()}</h4>
            </div>
            <div className="meta-chip">
              <span className="meta-label">Total Columns</span>
              <h4 className="meta-val">{columns.length}</h4>
            </div>
            <div className="meta-chip">
              <span className="meta-label">Status</span>
              <h4 className="meta-val" style={{ fontSize: '0.9rem' }}>Active</h4>
            </div>
          </div>

          {/* Statistical Summary Grid */}
          <div style={{ margin: '2rem 0' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} color="var(--accent-cyan)" /> Parameter Statistical Summary
            </h3>
            <div className="dataset-stats-bar">
              {statsList.map(s => (
                <div key={s.key} className="meta-chip">
                  <span className="meta-label">{s.key.replace('_', ' ')}</span>
                  <h4 className="meta-val">{s.mean.toFixed(1)} <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>(Mean)</span></h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Min: {s.min.toFixed(1)} | Max: {s.max.toFixed(1)} | SD: {s.stdDev.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="glass-card" style={{ padding: '1.6rem', marginBottom: '2rem' }}>
            <div className="table-controls">
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Table size={18} color="var(--accent-cyan)" /> Dataset Preview Table
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search table..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="form-control"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                />
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                  className="form-control"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <option value={10}>10 rows</option>
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                </select>
              </div>
            </div>

            {currentRows.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No dataset loaded. Upload a CSV file above.</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        {columns.map(col => (
                          <th key={col} style={{ cursor: 'pointer' }} onClick={() => handleSort(col)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {col.replace(/_/g, ' ')} <ArrowUpDown size={12} />
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, idx) => {
                        const pred = predictGreywater(row);
                        return (
                          <tr key={idx}>
                            {columns.map(col => {
                              let val = row[col];
                              if (col === 'Reuse_Suitability' || col === 'Status') {
                                return <td key={col}><span className={`badge ${pred.badgeClass}`}>{pred.statusText}</span></td>;
                              }
                              if (typeof val === 'number') val = val.toFixed(1);
                              return <td key={col}>{val !== undefined ? val : '-'}</td>;
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-wrapper">
                  <span>Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredRows.length)} of {filteredRows.length} entries</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-secondary" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span className="btn btn-sm btn-outline-cyan" style={{ pointerEvents: 'none' }}>Page {safeCurrentPage} of {totalPages}</span>
                    <button className="btn btn-sm btn-secondary" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
