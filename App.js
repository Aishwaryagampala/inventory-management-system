import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardLayout from './components/DashboardLayout';
import ProductsPage from './components/ProductsPage';
import InventoryLogsPage from './components/InventoryLogsPage';
import ReportsPage from './components/ReportsPage';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout error:', err);
    }

    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole('');
    window.location.href = '/';
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) setUserRole(savedRole);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/session`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserRole(data.role || '');
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Session check failed', error);
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="app-container">
      <Router>
        <Routes>
          {/* Login route */}
          <Route path="/" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />

          {/* Protected Dashboard routes */}
          {isLoggedIn ? (
            <Route
              path="/dashboard"
              element={<DashboardLayout userRole={userRole} onLogout={handleLogout} />}
            >
              <Route path="products" element={<ProductsPage userRole={userRole} />} />
              <Route path="inventory-logs" element={<InventoryLogsPage userRole={userRole} />} />
              <Route path="reports" element={<ReportsPage userRole={userRole} />} />
              {/* ✅ Redirect /dashboard to /dashboard/products */}
              <Route index element={<Navigate to="products" replace />} />
            </Route>
          ) : (
            <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
          )}

          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
