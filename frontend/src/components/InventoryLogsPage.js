// src/components/InventoryLogsPage.js
import React, { useState, useEffect, useCallback } from "react";
import AdminInventoryLogsView from "./AdminInventoryLogsView";
import StaffBarcodeScannerView from "./StaffBarcodeScannerView";

const InventoryLogsPage = ({ userRole }) => {
  const [logs, setLogs] = useState([]);

  // Function to fetch logs data from backend for Admin view
  const fetchLogs = useCallback(async () => {
    if (!userRole || userRole.toLowerCase() !== "admin") return;
    console.log("Fetching logs for Admin view...");
    try {
      const response = await fetch("/api/logs/all-logs", {
        credentials: "include",
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Logs fetched:", data);
        console.log("Number of logs:", data.length);
        setLogs(data);
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to fetch logs:",
          errorData.message || "Unknown error"
        );
        setLogs([]);
      }
    } catch (error) {
      console.error("Network error fetching logs:", error);
      setLogs([]);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole && userRole.toLowerCase() === "admin") {
      fetchLogs();
    }
  }, [fetchLogs, userRole]);

  // Case-insensitive userRole checks
  const isAdmin = userRole && userRole.toLowerCase() === "admin";
  const isStaff = userRole && userRole.toLowerCase() === "staff";

  return (
    <div className="page-content-container">
      {isAdmin && <AdminInventoryLogsView logs={logs} onRefresh={fetchLogs} />}

      {isStaff && <StaffBarcodeScannerView />}

      {!isAdmin && !isStaff && (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            fontSize: "18px",
            color: "#666",
          }}
        >
          Access Denied: Please log in with appropriate permissions to view
          inventory logs.
        </div>
      )}
    </div>
  );
};

export default InventoryLogsPage;
