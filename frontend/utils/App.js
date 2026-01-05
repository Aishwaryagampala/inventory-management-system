import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../styles/App.css';

import LoginPage from '../components/LoginPage';
import DashboardLayout from '../components/DashboardLayout';
import ProductsPage from '../components/ProductsPage';
import InventoryLogsPage from '../components/InventoryLogsPage';
import ReportsPage from '../components/ReportsPage';
import { fetchData } from '../api';

function App() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  const loadSession = useCallback(async () => {
    try {
      const data = await fetchData('/auth/session', 'GET');
      if (data && data.loggedIn) {
        setIsLoggedIn(true);
        setUserRole(data.role || '');
      } else {
        setIsLoggedIn(false);
        setUserRole('');
      }
    } catch {
      setIsLoggedIn(false);
      setUserRole('');
    } finally {
      setIsCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true);
    setUserRole(role || '');
  };

  const handleLogout = async () => {
    try {
      await fetchData('/auth/logout', 'POST');
    } catch {
      // ignore logout errors, just clear state
    } finally {
      setIsLoggedIn(false);
      setUserRole('');
    }
  };

  if (isCheckingSession) {
    return <div className="app-container"><p>Loading session...</p></div>;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn
                ? <Navigate to="/dashboard/products" replace />
                : <LoginPage onLoginSuccess={handleLoginSuccess} />
            }
          />

          <Route
            path="/dashboard"
            element={
              isLoggedIn
                ? <DashboardLayout userRole={userRole} onLogout={handleLogout} />
                : <Navigate to="/" replace />
            }
          >
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory-logs" element={<InventoryLogsPage userRole={userRole} />} />
            <Route path="reports" element={<ReportsPage userRole={userRole} />} />
          </Route>

          <Route
            path="*"
            element={
              isLoggedIn
                ? <Navigate to="/dashboard/products" replace />
                : <Navigate to="/" replace />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


