// src/components/ReportsPage.js

import React, { useState, useEffect, useCallback } from "react";
import AdminReportsView from "./AdminReportsView";
import StaffReportsView from "./StaffReportsView";
import RecentActivityModal from "./RecentActivityModal";
import "./ReportsPage.css"; // Import the new CSS

// Import fetchData from your utilities (adjust path if necessary)
import { fetchData } from "../utils/api";

// Import necessary chart components and elements from react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportsPage = ({ userRole }) => {
  // State for the Recent Activity Modal
  const [showRecentActivityModal, setShowRecentActivityModal] = useState(false);

  // States for chart data and loading/error
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // State for chart data loading
  const [error, setError] = useState(null); // State for chart data errors

  // Case-insensitive userRole checks for rendering specific views or data
  const isAdmin = userRole && userRole.toLowerCase() === "admin";
  const isStaff = userRole && userRole.toLowerCase() === "staff";

  // Handlers for Recent Activity Modal
  const handleShowRecentActivity = () => {
    setShowRecentActivityModal(true);
  };

  const handleCloseRecentActivity = () => {
    setShowRecentActivityModal(false);
  };

  // Function to fetch top selling products for the chart
  const fetchTopSellingProducts = useCallback(async () => {
    setIsLoading(true); // Start loading state for chart data
    setError(null); // Clear any previous errors

    try {
      // Use fetchData to get data from your backend report endpoint
      const data = await fetchData("/report/top-selling-products", "GET");
      setTopSellingProducts(data || []); // Ensure data is an array
    } catch (err) {
      console.error("Error fetching top selling products:", err);
      setError(err.message || "Failed to fetch top selling products.");
    } finally {
      setIsLoading(false); // End loading state
    }
  }, []);

  // Effect to fetch chart data when the component mounts or userRole changes
  useEffect(() => {
    // Only fetch chart data if the user is an admin or staff
    if (isAdmin || isStaff) {
      fetchTopSellingProducts();
    }
  }, [fetchTopSellingProducts, isAdmin, isStaff]); // Dependencies for useEffect

  // Data structure for the Bar chart
  const chartData = {
    labels: topSellingProducts.map((product) => product.sku), // Product SKUs for X-axis labels
    datasets: [
      {
        label: "Quantity Sold", // Label for the bars
        data: topSellingProducts.map((product) => product.total_quantity_sold), // Quantities for bar heights
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Options for the Bar chart's appearance and behavior
  const chartOptions = {
    responsive: true, // Chart scales with container size
    plugins: {
      title: {
        display: true,
        text: "Top Selling Products", // Chart title
        font: {
          size: 18,
        },
      },
      legend: {
        display: false, // Hide legend if only one dataset
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Product SKU", // X-axis title
        },
      },
      y: {
        beginAtZero: true, // Y-axis starts from zero
        title: {
          display: true,
          text: "Total Quantity Sold", // Y-axis title
        },
      },
    },
  };

  return (
    <div className="reports-page-container">
      <div className="reports-header-section">
        <h1 className="reports-title">Reports</h1>
      </div>

      {/* Render Admin or Staff specific views */}
      {isAdmin && (
        <AdminReportsView onShowRecentActivity={handleShowRecentActivity} />
      )}
      {isStaff && <StaffReportsView />}

      {/* Conditional rendering for the chart section */}
      {isAdmin || isStaff ? ( // Only show reports/charts if admin or staff
        isLoading ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Loading chart data...
          </p>
        ) : error ? (
          <p
            className="error-message"
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            {error}
          </p>
        ) : topSellingProducts.length > 0 ? (
          <div
            className="chart-container"
            style={{
              width: "80%",
              margin: "20px auto",
              padding: "20px",
              border: "1px solid #eee",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Top Selling Products Overview</h3>
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            No top selling products data available.
          </p>
        )
      ) : (
        // Message for users without appropriate permissions
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            fontSize: "18px",
            color: "#666",
          }}
        >
          Access Denied: Please log in with appropriate permissions to view
          reports.
        </div>
      )}

      {/* Recent Activity Modal, visible based on state */}
      <RecentActivityModal
        isOpen={showRecentActivityModal}
        onClose={handleCloseRecentActivity}
      />
    </div>
  );
};

export default ReportsPage;
