// src/components/DashboardLayout.js
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./DashboardLayout.css";

const DashboardLayout = ({ userRole, onLogout }) => {
  const navigate = useNavigate();
  const isAdmin = userRole && userRole.toLowerCase() === "admin";
  const isStaff = userRole && userRole.toLowerCase() === "staff";

  const handleLogoutClick = async () => {
    await onLogout();
    navigate("/");
  };

  return (
    <div className="dashboard-layout-container">
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/dashboard/products" className="header-logo">
            IMS
          </Link>
        </div>
        <nav className="header-nav">
          <Link to="/dashboard/products" className="nav-link">
            Products
          </Link>
          {isAdmin && (
            <Link to="/dashboard/inventory-logs" className="nav-link">
              Inventory Logs
            </Link>
          )}
          {isStaff && (
            <Link to="/dashboard/barcode-scanner" className="nav-link">
              Barcode Scanner
            </Link>
          )}
          <Link to="/dashboard/reports" className="nav-link">
            Reports
          </Link>
        </nav>
        <div className="header-right">
          <button onClick={handleLogoutClick} className="nav-logout-button">
            Logout
          </button>
        </div>
      </header>

      {/* Main content area where child routes will be rendered */}
      <main className="dashboard-content">
        <Outlet />{" "}
        {/* This is where the nested routes (ProductsPage, InventoryLogsPage, etc.) will render */}
      </main>
    </div>
  );
};

export default DashboardLayout;
