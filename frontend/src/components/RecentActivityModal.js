import React, { useState, useEffect, useCallback } from "react";
import "./Modal.css";
import "./AdminInventoryLogsView.css";
import { fetchData } from "../utils/api";

const RecentActivityModal = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentActivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching recent activity from /logs/all-logs");
      const data = await fetchData("/logs/all-logs", "GET");

      console.log("Received data:", data);

      if (data && Array.isArray(data)) {
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
      } else {
        console.log("No data or data is not an array");
        setActivities([]);
      }
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message || "Failed to fetch recent activity.");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
