// src/components/DashboardLayout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = ({ userRole, onLogout }) => {
    const navigate = useNavigate();

    const handleLogoutClick = async () => {
        await onLogout(); // Call the logout function passed from App.js
        navigate('/'); // Redirect to the login page after logout is handled
    };

    return (
        <div className="dashboard-layout-container">
            {/* Top Navigation Bar */}
            <header className="dashboard-header">
                <div className="header-left">
                    <Link to="/dashboard/products" className="header-logo">IMS</Link>
                </div>
                <nav className="header-nav">
                    <Link to="/dashboard/products" className="nav-link">Products</Link>
                    <Link to="/dashboard/inventory-logs" className="nav-link">Inventory Logs</Link>
                    <Link to="/dashboard/reports" className="nav-link">Reports</Link>
                    {/* REMOVED: Barcode Scanner link for staff - it will now be *inside* Inventory Logs page */}
                </nav>
                <div className="header-right">
                    <button onClick={handleLogoutClick} className="nav-logout-button">Logout</button>
                </div>
            </header>

            {/* Main content area where child routes will be rendered */}
            <main className="dashboard-content">
                <Outlet /> {/* This is where the nested routes (ProductsPage, InventoryLogsPage, etc.) will render */}
            </main>
        </div>
    );
};

export default DashboardLayout;