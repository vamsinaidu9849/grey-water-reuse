import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateDefaultDashboardSamples } from '../services/decisionEngine';

const DatasetContext = createContext();

export function DatasetProvider({ children }) {
  const [dataset, setDatasetState] = useState(() => {
    try {
      const saved = localStorage.getItem('greyai_current_dataset');
      return saved ? JSON.parse(saved) : { filename: 'greywater_quality_dataset.csv', filesize: '18.4 KB', data: generateDefaultDashboardSamples() };
    } catch (e) {
      return { filename: 'greywater_quality_dataset.csv', filesize: '18.4 KB', data: generateDefaultDashboardSamples() };
    }
  });

  const [history, setHistoryState] = useState(() => {
    try {
      const saved = localStorage.getItem('greyai_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setDataset = (datasetObj) => {
    setDatasetState(datasetObj);
    localStorage.setItem('greyai_current_dataset', JSON.stringify(datasetObj));
  };

  const addHistoryRecord = (record) => {
    setHistoryState(prev => {
      const updated = [record, ...prev].slice(0, 50);
      localStorage.setItem('greyai_history', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHistoryRecord = (id) => {
    setHistoryState(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('greyai_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistoryState([]);
    localStorage.removeItem('greyai_history');
  };

  return (
    <DatasetContext.Provider value={{
      dataset,
      setDataset,
      history,
      addHistoryRecord,
      deleteHistoryRecord,
      clearHistory,
      toast,
      showToast
    }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}
