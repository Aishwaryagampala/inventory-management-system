import React, { useState, useEffect, useCallback } from "react";
import "./Modal.css";
import "./AdminInventoryLogsView.css";

const RecentActivityModal = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state

  const fetchData = useCallback(async (path, method = "GET", body = null) => {
    // Construct the full URL using the environment variable
    // It looks for REACT_APP_API_BASE_URL from your .env file.
    // The part after '||' is a backup if the environment variable isn't set (e.g., during local testing without .env).
    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

    // 'path' is the specific part of the API route (like '/products' or '/logs/all-logs')
    // We combine the baseUrl and the path to get the complete address for the API call.
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
      // The fetch request now uses the full 'endpoint' which includes your base URL.
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        // Handle token expiry / unauthorized access
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("authToken"); // Clear invalid token
          alert("Session expired or unauthorized. Please log in again.");
          window.location.href = "/login"; // Redirect to login page
          return null; // Stop further processing
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
      throw err; // Re-throw to be caught by specific calling functions
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    setIsLoading(true); // Set loading state
    setError(null); // Clear previous errors
    try {
      // Using the correct path without '/api' prefix, as fetchData handles it.
      const data = await fetchData("/logs/all-logs", "GET");

      // The image shows: Date, Product, Action, Qty. Your backend's getAllLogs returns: sku, action, amount, created_at, user.
      // Map to match the modal's expected fields. Removed 'id' from here as per your confirmation.
      const formattedActivities = data.map((log) => ({
        // No 'id' from backend, so we don't map it here
        date: new Date(log.created_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
        }),
        product: log.sku, // Assuming log.sku is sufficient, or you might need another lookup for product name
        action: log.action,
        quantityChange: log.amount, // Assuming 'amount' is the quantity changed
      }));
      setActivities(formattedActivities);
    } catch (err) {
      console.error("Network error fetching recent activity:", err);
      setError(err.message || "Failed to fetch recent activity."); // Display error message
      setActivities([]); // Clear activities on error
    } finally {
      setIsLoading(false); // Clear loading state
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

        {isLoading ? ( // Loading indicator
          <p style={{ textAlign: "center" }}>Loading recent activity...</p>
        ) : error ? ( // Error display
          <p className="error-message" style={{ textAlign: "center" }}>
            {error}
          </p>
        ) : activities.length > 0 ? (
          <div className="admin-inventory-logs-table-container">
            {" "}
            {/* Re-using table container class if it exists */}
            <table className="admin-inventory-logs-table">
              {" "}
              {/* Assuming a general table class is used for logs */}
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Action</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(
                  (
                    activity,
                    index // ADDED 'index' back here
                  ) => (
                    <tr key={index}>
                      {" "}
                      {/* REVERTED: key={index} as 'activity.id' is not available */}
                      <td>{activity.date}</td>
                      <td>{activity.product}</td>
                      <td>{activity.action}</td>
                      <td>
                        {activity.quantityChange > 0
                          ? `+${activity.quantityChange}`
                          : activity.quantityChange}
                      </td>
                    </tr>
                  )
                )}
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
