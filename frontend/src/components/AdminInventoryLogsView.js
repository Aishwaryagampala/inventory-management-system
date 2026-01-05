// src/components/AdminInventoryLogsView.js
import React, { useState, useMemo } from "react";
import "./AdminInventoryLogsView.css";

const AdminInventoryLogsView = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterAction, setFilterAction] = useState("All");
  const [logLimit, setLogLimit] = useState(50);

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this log entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/logs/${logId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        alert("Log deleted successfully");
        if (onRefresh) onRefresh();
      } else {
        const error = await response.json();
        alert(`Failed to delete log: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting log:", error);
      alert("Network error. Could not delete log.");
    }
  };

  const filteredLogs = useMemo(() => {
    let filtered = logs || [];

    if (filterAction !== "All") {
      filtered = filtered.filter(
        (log) =>
          log.action && log.action.toLowerCase() === filterAction.toLowerCase()
      );
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((log) => {
        return (
          (log.sku && log.sku.toLowerCase().includes(q)) ||
          (log.action && log.action.toLowerCase().includes(q)) ||
          (log.user && log.user.toLowerCase().includes(q))
        );
      });
    }

    // Apply limit
    return filtered.slice(0, logLimit);
  }, [logs, searchTerm, filterAction, logLimit]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="admin-inventory-logs-view-container">
      <div className="inventory-logs-header">
        <h1>Inventory Logs</h1>
      </div>

      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search (press Enter)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setSearchTerm(searchInput);
            }
          }}
        />
        <select
          value={logLimit}
          onChange={(e) => setLogLimit(parseInt(e.target.value))}
          style={{
            padding: "14px 20px",
            border: "2px solid #e0e0e0",
            borderRadius: "12px",
            fontSize: "15px",
            background: "#fafafa",
            cursor: "pointer",
            outline: "none",
            fontWeight: "500",
          }}
        >
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
          <option value={500}>Show 500</option>
          <option value={99999}>Show All</option>
        </select>
      </div>

      <div className="category-filter-buttons">
        <button
          className={`filter-btn ${filterAction === "All" ? "active" : ""}`}
          onClick={() => setFilterAction("All")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterAction === "sale" ? "active" : ""}`}
          onClick={() => setFilterAction("sale")}
        >
          Sale
        </button>
        <button
          className={`filter-btn ${filterAction === "restock" ? "active" : ""}`}
          onClick={() => setFilterAction("restock")}
        >
          Restock
        </button>
        <button
          className={`filter-btn ${filterAction === "update" ? "active" : ""}`}
          onClick={() => setFilterAction("update")}
        >
          Update
        </button>
        <button
          className={`filter-btn ${filterAction === "added" ? "active" : ""}`}
          onClick={() => setFilterAction("added")}
        >
          Added
        </button>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>SKU</th>
              <th>Action</th>
              <th>Amount</th>
              <th>User</th>
              <th>Date & Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.sku || "-"}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {log.action || "-"}
                  </td>
                  <td>{log.amount || "-"}</td>
                  <td>{log.user || "-"}</td>
                  <td>{formatDate(log.created_at)}</td>
                  <td>
                    <button
                      className="delete-log-btn"
                      onClick={() => handleDeleteLog(log.id)}
                      style={{
                        background:
                          "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(0, 0, 0, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventoryLogsView;
