// src/components/AdminInventoryLogsView.js
import React, { useState, useMemo } from "react";
import "./AdminInventoryLogsView.css";

const AdminInventoryLogsView = ({
  products, // Products passed from InventoryLogsPage (fetched from backend)
  handleUpdateProductClick,
  handleRestockClick,
  isAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    let filtered = products || [];

    if (filterCategory !== "All") {
      filtered = filtered.filter(
        (product) =>
          product.category &&
          product.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => {
        return (
          (product.sku && product.sku.toLowerCase().includes(q)) ||
          (product.name && product.name.toLowerCase().includes(q)) ||
          (product.brand && product.brand.toLowerCase().includes(q)) ||
          (product.category && product.category.toLowerCase().includes(q))
        );
      });
    }

    return filtered;
  }, [products, searchTerm, filterCategory]);

  const getStatusClassName = (status) => {
    switch (status) {
      case "In Stock":
        return "status-in-stock";
      case "Low Stock":
        return "status-low-stock";
      case "Critical":
        return "status-critical";
      default:
        return "";
    }
  };

  return (
    <div className="admin-inventory-logs-view-container">
      <div className="inventory-logs-header">
        <h1>Inventory Logs (Admin View)</h1>
        <div className="header-actions">
          {isAdmin && (
            <>
              <button
                className="header-button"
                onClick={() => handleUpdateProductClick()}
              >
                Update Product
              </button>
              <button className="header-button" onClick={handleRestockClick}>
                Restock
              </button>
            </>
          )}
          <span className="notification-icon">🔔</span>
        </div>
      </div>

      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="🔍 Search (press Enter)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setSearchTerm(searchInput);
            }
          }}
        />
        <span className="microphone-icon">🎤</span>{" "}
        {/* Placeholder for speech-to-text */}
        <select
          className="filter-dropdown"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">Filter</option>
          <option value="Mobile">Mobile</option>
          <option value="Laptop">Laptop</option>
          <option value="Electronics">Electronics</option>
          <option value="Apparel">Apparel</option>
          <option value="Books">Books</option>
          {/* Add more filter options based on your actual backend categories */}
        </select>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Products</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.sku}>
                  <td>{product.name}</td>
                  <td>{product.brand || "-"}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  {(() => {
                    const qty = Number(product.quantity || 0);
                    const rl = Number(product.reorder_level || 0);
                    const status =
                      qty <= rl
                        ? "Critical"
                        : qty <= rl + 5
                        ? "Low Stock"
                        : "In Stock";
                    return (
                      <td className={getStatusClassName(status)}>{status}</td>
                    );
                  })()}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No products found.
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
