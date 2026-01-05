// src/components/InventoryLogsPage.js
import React, { useState, useEffect, useCallback } from "react";
import UpdateProductModal from "./UpdateProductModal";
import RestockProductModal from "./RestockProductModal";
import AdminInventoryLogsView from "./AdminInventoryLogsView";
import StaffBarcodeScannerView from "./StaffBarcodeScannerView"; // New component

const InventoryLogsPage = ({ userRole }) => {
  const [products, setProducts] = useState([]); // State for admin view
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // For modals to pre-fill info

  // Function to fetch product data from backend for Admin view
  const fetchProducts = useCallback(async () => {
    // Ensure userRole exists before calling toLowerCase()
    if (!userRole || userRole.toLowerCase() !== "admin") return; // Only fetch for admin
    console.log("Fetching products for Admin view...");
    try {
      // Using /all-logs (GET) from your routes. Filters can be sent in body for this route.
      const response = await fetch(
        "/api/logs/all-logs",
        { credentials: "include" },
        {
          method: "GET",
          credentials: "include", // Or 'POST' if filters are sent in body as per your note for /all-logs
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Include auth token if required
          },
          // If /all-logs GET requires filters in body, it's non-standard.
          // For standard GET, you'd use URL query parameters: `/all-logs?search=...&category=...`
          // For now, assuming it returns all logs, and client-side filtering happens.
          // If backend filtering is expected to receive body for GET, you might need to adjust fetch options.
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Products fetched:", data);
        setProducts(data);
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to fetch products:",
          errorData.message || "Unknown error"
        );
        setProducts([]); // Clear products on error
      }
    } catch (error) {
      console.error("Network error fetching products:", error);
      setProducts([]);
    }
  }, [userRole]); // Dependency on userRole to re-evaluate

  useEffect(() => {
    // Fetch products only if the user is an admin
    // Ensure userRole exists before calling toLowerCase()
    if (userRole && userRole.toLowerCase() === "admin") {
      // Case-insensitive check for admin
      fetchProducts();
    }
  }, [fetchProducts, userRole]);

  const handleUpdateProductClick = (product = null) => {
    setSelectedProduct(product); // Allow passing product for specific updates
    setShowUpdateModal(true);
  };

  const handleRestockClick = () => {
    setShowRestockModal(true);
  };

  const handleModalClose = () => {
    setShowUpdateModal(false);
    setShowRestockModal(false);
    setSelectedProduct(null);
    // If an admin, refresh product list after modal actions
    // Ensure userRole exists before calling toLowerCase()
    if (userRole && userRole.toLowerCase() === "admin") {
      // Case-insensitive check for admin
      fetchProducts();
    }
  };

  const handleProductQuantityUpdateForStaff = () => {
    // This callback is for StaffBarcodeScannerView to trigger a refresh
    // For staff, refreshing implies re-fetching the scanned product's details if still displayed
    // or just acknowledging the update. The Staff view manages its own product state.
    console.log(
      "Staff product quantity updated. Consider re-fetching specific product or informing user."
    );
    // If there was a global inventory list for staff, we'd fetch it here.
    // Since staff view is focused on scanner, this is more for cross-component awareness.
  };

  const handleViewProductDetails = (product) => {
    // This could open another modal or navigate to a product detail page
    alert(
      `Product Details for ${product.name}:\nBrand: ${
        product.brand
      }\nCategory: ${product.category}\nQuantity: ${
        product.quantity
      }\nSKU ID: ${product.SKU_ID || "N/A"}`
    );
  };

  // Case-insensitive userRole checks
  const isAdmin = userRole && userRole.toLowerCase() === "admin";
  const isStaff = userRole && userRole.toLowerCase() === "staff";

  return (
    <div className="page-content-container">
      {isAdmin && (
        <>
          <AdminInventoryLogsView
            products={products}
            fetchProducts={fetchProducts} // Pass fetchProducts to AdminView if it needs to trigger it
            handleUpdateProductClick={handleUpdateProductClick}
            handleRestockClick={handleRestockClick}
            isAdmin={isAdmin}
          />
          <UpdateProductModal
            isOpen={showUpdateModal}
            onClose={handleModalClose}
            product={selectedProduct}
            onUpdateSuccess={fetchProducts} // Refresh admin list after update
          />
          <RestockProductModal
            isOpen={showRestockModal}
            onClose={handleModalClose}
            onRestockSuccess={fetchProducts} // Refresh admin list after restock
          />
        </>
      )}

      {isStaff && (
        <StaffBarcodeScannerView
          onUpdateProductQuantity={handleProductQuantityUpdateForStaff}
          onViewProductDetails={handleViewProductDetails}
        />
      )}

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
