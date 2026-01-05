import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import ProductsPage from "./components/ProductsPage";
import InventoryLogsPage from "./components/InventoryLogsPage";
import ReportsPage from "./components/ReportsPage";
import StaffBarcodeScannerView from "./components/StaffBarcodeScannerView";
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem("userRole", role);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout error:", err);
    }

    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole("");
    window.location.href = "/";
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/auth/session`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserRole(data.role || "");
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Session check failed", error);
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="app-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard/products" replace />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {isLoggedIn ? (
            <Route
              path="/dashboard"
              element={
                <DashboardLayout userRole={userRole} onLogout={handleLogout} />
              }
            >
              <Route index element={<ProductsPage userRole={userRole} />} />
              <Route
                path="products"
                element={<ProductsPage userRole={userRole} />}
              />
              <Route
                path="inventory-logs"
                element={<InventoryLogsPage userRole={userRole} />}
              />
              <Route
                path="barcode-scanner"
                element={
                  userRole && userRole.toLowerCase() === "staff" ? (
                    <StaffBarcodeScannerView />
                  ) : (
                    <div style={{ padding: "50px", textAlign: "center" }}>
                      <h2>Access Denied</h2>
                      <p>Only staff members can access the barcode scanner.</p>
                    </div>
                  )
                }
              />
              <Route
                path="reports"
                element={<ReportsPage userRole={userRole} />}
              />
            </Route>
          ) : (
            <Route
              path="/dashboard/*"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
          )}

          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
