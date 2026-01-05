// src/components/AdminReportsView.js
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const AdminReportsView = ({ onShowRecentActivity }) => {
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [dailyActivityLogs, setDailyActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("7"); // Default to 7 days

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Fetch Category Distribution with cookies
      const categoryDistResponse = await fetch(
        "/api/report/category-distribution",
        {
          credentials: "include",
        }
      );
      if (categoryDistResponse.ok) {
        const data = await categoryDistResponse.json();
        setCategoryDistribution(data);
      } else {
        setError("Failed to load category distribution.");
      }

      // ✅ Fetch Low Stock Items with cookies
      const lowStockResponse = await fetch("/api/report/low-stock", {
        credentials: "include",
      });
      if (lowStockResponse.ok) {
        const data = await lowStockResponse.json();
        setLowStockItems(data);
      } else {
        setError("Failed to load low stock trends.");
      }

      // ✅ Fetch Daily Activity Logs with cookies
      const dailyLogsResponse = await fetch(
        `/api/report/daily-logs?days=${timeFilter}`,
        {
          credentials: "include",
        }
      );
      if (dailyLogsResponse.ok) {
        const data = await dailyLogsResponse.json();
        setDailyActivityLogs(data);
      } else {
        setError("Failed to load activity over time.");
      }
    } catch (err) {
      console.error("Network error fetching admin reports data:", err);
      setError("Network error. Could not load admin reports.");
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (format, type) => {
    try {
      const response = await fetch(`/api/export/${type}/${format}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${type}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to export ${type}: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred during export.");
    }
  };

  if (loading) return <p>Loading admin reports...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="admin-reports-content">
      <div className="reports-filter-row">
        <div className="reports-filter-group">
          <select
            className="reports-filter-dropdown"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="reports-actions">
        <button
          className="reports-action-button"
          onClick={onShowRecentActivity}
        >
          Recent Activity
        </button>
        <select
          className="reports-export-dropdown"
          defaultValue=""
          onChange={(e) => {
            const [type, format] = e.target.value.split("-");
            if (type && format) {
              handleExport(format, type);
            }
            e.target.value = "";
          }}
        >
          <option value="" disabled>
            Export Data
          </option>
          <option value="products-excel">Products (Excel)</option>
          <option value="products-pdf">Products (PDF)</option>
          <option value="logs-excel">Logs (Excel)</option>
          <option value="logs-pdf">Logs (PDF)</option>
        </select>
      </div>

      <div className="admin-reports-grid">
        <div className="report-card">
          <h3>Stock Distribution By Category</h3>
          {categoryDistribution.length > 0 ? (
            <div className="report-table-wrapper">
              <table className="report-data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryDistribution.map((item, index) => (
                    <tr key={index}>
                      <td>{item.category}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-message">No category data available</p>
          )}
        </div>
        <div className="report-card">
          <h3>Low Stock Trends</h3>
          {lowStockItems.length > 0 ? (
            <div className="report-table-wrapper">
              <table className="report-data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <span
                          className={`status-badge status-${item.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-message">All items are well stocked!</p>
          )}
        </div>
        <div className="report-card">
          <h3>Activity Over Time</h3>
          {dailyActivityLogs.length > 0 ? (
            <div className="report-table-wrapper">
              <table className="report-data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Logs</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyActivityLogs.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {new Date(item.day).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>{item.total_logs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-message">
              No activity data for selected period
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsView;
