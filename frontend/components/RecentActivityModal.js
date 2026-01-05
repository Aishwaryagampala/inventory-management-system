// src/components/RecentActivityModal.js
import React, { useState, useEffect, useCallback } from 'react';
import './Modals/Modals.css'; // Assuming modal styling comes from here
import './AdminInventoryLogsView.css'; // For table styling, from image_3178d7.png
import { fetchData } from '../api';

const RecentActivityModal = ({ isOpen, onClose }) => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Added loading state
    const [error, setError] = useState(null); // Added error state

    const fetchRecentActivity = useCallback(async () => {
        setIsLoading(true); // Set loading state
        setError(null); // Clear previous errors
        try {
            // Logs route is mounted at /api, so the path here is '/all-logs'
            const data = await fetchData('/all-logs', 'GET'); 

            // The image shows: Date, Product, Action, Qty. Your backend's getAllLogs returns: sku, action, amount, created_at, user.
            // Map to match the modal's expected fields. Removed 'id' from here as per your confirmation.
            const formattedActivities = data.map((log) => ({
                // No 'id' from backend, so we don't map it here
                date: new Date(log.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long' }),
                product: log.sku, // Assuming log.sku is sufficient, or you might need another lookup for product name
                action: log.action,
                quantityChange: log.amount, // Assuming 'amount' is the quantity changed
            }));
            setActivities(formattedActivities);
        } catch (err) {
            console.error('Network error fetching recent activity:', err);
            setError(err.message || 'Failed to fetch recent activity.'); // Display error message
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
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <h2 className="modal-title">Recent Activity</h2>

                {isLoading ? ( // Loading indicator
                    <p style={{ textAlign: 'center' }}>Loading recent activity...</p>
                ) : error ? ( // Error display
                    <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>
                ) : activities.length > 0 ? (
                    <div className="admin-inventory-logs-table-container"> {/* Re-using table container class if it exists */}
                        <table className="admin-inventory-logs-table"> {/* Assuming a general table class is used for logs */}
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Action</th>
                                    <th>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((activity, index) => ( // ADDED 'index' back here
                                    <tr key={index}> {/* REVERTED: key={index} as 'activity.id' is not available */}
                                        <td>{activity.date}</td>
                                        <td>{activity.product}</td>
                                        <td>{activity.action}</td>
                                        <td>{activity.quantityChange > 0 ? `+${activity.quantityChange}` : activity.quantityChange}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center' }}>No recent activity found.</p>
                )}
            </div>
        </div>
    );
};

export default RecentActivityModal;