// src/components/StaffReportsView.js
import React, { useState, useEffect, useCallback } from "react";

const StaffReportsView = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // Changed to empty string for "All"
  const [filterStatus, setFilterStatus] = useState(""); // Changed to empty string for "All"
  const [sortOrder, setSortOrder] = useState(""); // e.g., 'name-asc', 'name-desc', 'quantity-asc'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Extract unique categories from products
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueCategories = [
        ...new Set(products.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    }
  }, [products]);

  const fetchStaffReportsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching staff stock reports...");
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm && searchTerm.trim())
        queryParams.append("name", searchTerm);
      if (filterCategory && filterCategory.trim())
        queryParams.append("category", filterCategory);

      // Backend's getAllProducts route is GET /api/products/
      const url = `/api/products${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        let data = await response.json();
        console.log("Staff reports data fetched:", data);

        // Frontend filtering for Status as backend's getAllProducts is more quantity based [cite: 542, 543, 593, 594]
        // Your backend's reportController.getlowQuantity [cite: 648] is better for 'low stock' status.
        // If you want status in getAllProducts, you'd need to modify backend product table or add logic.
        if (filterStatus) {
          data = data.filter((product) => {
            // Assuming you have reorder_level in your product data
            if (filterStatus === "In Stock") {
              return product.quantity > product.reorder_level + 5; // Example threshold
            } else if (filterStatus === "Low Stock") {
              return (
                product.quantity <= product.reorder_level + 5 &&
                product.quantity > product.reorder_level
              );
            } else if (filterStatus === "Critical") {
              return product.quantity <= product.reorder_level;
            }
            return true;
          });
        }

        // Client-side sorting as getAllProducts doesn't have explicit sort in backend
        if (sortOrder) {
          data.sort((a, b) => {
            if (sortOrder === "name-asc") return a.name.localeCompare(b.name);
            if (sortOrder === "name-desc") return b.name.localeCompare(a.name);
            if (sortOrder === "stock-asc") return a.quantity - b.quantity;
            if (sortOrder === "stock-desc") return b.quantity - a.quantity;
            return 0;
          });
        }

        setProducts(data);
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to fetch staff reports data:",
          errorData.message || "Unknown error"
        );
        setError(errorData.message || "Failed to fetch stock data.");
        setProducts([]);
      }
    } catch (err) {
      console.error("Network error fetching staff reports data:", err);
      setError("Network error. Could not load stock data.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory, filterStatus, sortOrder]);

  useEffect(() => {
    fetchStaffReportsData();
  }, [fetchStaffReportsData]);

  if (loading) return <p>Loading stock data...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="staff-reports-content">
      <div className="reports-filter-row">
        <div className="reports-filter-group">
          <input
            type="text"
            placeholder="Search Products by Name (press Enter)"
            className="reports-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setSearchTerm(searchInput);
              }
            }}
          />
        </div>
        <div className="reports-filter-group">
          <select
            className="reports-filter-dropdown"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="reports-filter-group">
          <select
            className="reports-filter-dropdown"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div className="reports-filter-group">
          <select
            className="reports-filter-dropdown"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="stock-asc">Current Stock (Low to High)</option>
            <option value="stock-desc">Current Stock (High to Low)</option>
          </select>
        </div>
      </div>

      <div className="staff-report-table-container">
        <table className="staff-report-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Status</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.sku}>
                  {" "}
                  {/* Using SKU as key assuming it's unique */}
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    {product.quantity <= product.reorder_level
                      ? "Critical"
                      : product.quantity <= product.reorder_level + 5 // Example threshold for low stock
                      ? "Low Stock"
                      : "In Stock"}
                  </td>
                  <td>{product.quantity}</td>
                  <td>{product.reorder_level}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No products found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffReportsView;
