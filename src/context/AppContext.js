import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [selectedCommodity, setSelectedCommodity] = useState('onion');
  const [dateRange, setDateRange] = useState({
    startDate: new Date('2022-12-01'),
    endDate: new Date('2025-03-31'),
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const value = {
    selectedCommodity,
    setSelectedCommodity,
    dateRange,
    setDateRange,
    mobileOpen,
    setMobileOpen,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};