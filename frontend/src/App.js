import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import ProductsPage from "./components/ProductsPage";
import InventoryLogsPage from "./components/InventoryLogsPage";
import ReportsPage from "./components/ReportsPage";
import StaffBarcodeScannerView from "./components/StaffBarcodeScannerView";
import "./App.css";

const HomeRedirect = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard/products", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);
  return null;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem("userRole", role); // still optional for role-based UI
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

  // ✅ Check login session via backend
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
      <Router>
        <HomeRedirect isLoggedIn={isLoggedIn} />
        <Routes>
          <Route
            path="/"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
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
                element={<StaffBarcodeScannerView />}
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
