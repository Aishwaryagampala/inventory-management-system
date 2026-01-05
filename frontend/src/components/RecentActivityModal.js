import React, { useState, useEffect, useCallback } from "react";
import "./Modal.css";
import "./AdminInventoryLogsView.css";

const RecentActivityModal = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (path, method = "GET", body = null) => {
    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

    const endpoint = `${baseUrl}${path}`;

    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("authToken");
          alert("Session expired or unauthorized. Please log in again.");
          window.location.href = "/login";
          return null;
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API call failed with status: ${response.status}`
        );
      }
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return null;
      }
      return await response.json();
    } catch (err) {
      console.error("API call error:", err);
      throw err;
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchData("/logs/all-logs", "GET");

      const formattedActivities = data.map((log) => ({
        date: new Date(log.created_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
        }),
        product: log.sku,
        action: log.action,
        quantityChange: log.amount,
      }));
      setActivities(formattedActivities);
    } catch (err) {
      console.error("Network error fetching recent activity:", err);
      setError(err.message || "Failed to fetch recent activity.");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    if (isOpen) {
      fetchRecentActivity();
    }
  }, [isOpen, fetchRecentActivity]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Recent Activity</h2>

        {isLoading ? (
          <p style={{ textAlign: "center" }}>Loading recent activity...</p>
        ) : error ? (
          <p className="error-message" style={{ textAlign: "center" }}>
            {error}
          </p>
        ) : activities.length > 0 ? (
          <div className="admin-inventory-logs-table-container">
            {" "}
            <table className="admin-inventory-logs-table">
              {" "}
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Action</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => (
                  <tr key={index}>
                    {" "}
                    <td>{activity.date}</td>
                    <td>{activity.product}</td>
                    <td>{activity.action}</td>
                    <td>
                      {activity.quantityChange > 0
                        ? `+${activity.quantityChange}`
                        : activity.quantityChange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>No recent activity found.</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivityModal;
