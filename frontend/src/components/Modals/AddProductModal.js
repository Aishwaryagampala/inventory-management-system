// src/components/Modals/AddProductModal.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import "../Modal.css";

const AddProductModal = ({ onClose, onSuccess }) => {
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [reorderLevel, setReorderLevel] = useState("30");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("/api/products/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku,
          name: productName,
          imageURL,
          category: showCustomCategory ? customCategory : category,
          quantity: parseInt(quantity),
          brand,
          reorder_level: parseInt(reorderLevel),
          expiry: null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product added successfully:", result);
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to add product.");
      }
    } catch (error) {
      setErrorMessage("Network error. Could not add product.");
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">Add Product</h2>
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <p
              className="error-message"
              style={{ color: "#ff4444", marginBottom: "16px" }}
            >
              {errorMessage}
            </p>
          )}
          <div className="modal-form-group">
            <label>SKU (Product Code)</label>
            <input
              type="text"
              placeholder="e.g., AP-PH-IP16"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>
          <div className="modal-form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="modal-form-group">
            <label>Image URL</label>
            <input
              type="text"
              placeholder="Enter image URL (optional)"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
          </div>
          <div className="modal-form-row">
            <div className="modal-form-group" style={{ flex: 1 }}>
              <label>Category</label>
              <select
                value={showCustomCategory ? "Custom" : category}
                onChange={(e) => {
                  if (e.target.value === "Custom") {
                    setShowCustomCategory(true);
                    setCustomCategory("");
                  } else {
                    setShowCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
              >
                <option value="Electronics">Electronics</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Laptop">Laptop</option>
                <option value="Accessories">Accessories</option>
                <option value="Custom">+ Add New Category</option>
              </select>
            </div>
            <div className="modal-form-group" style={{ flex: 1 }}>
              <label>Quantity</label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>
          {showCustomCategory && (
            <div className="modal-form-group">
              <label>New Category Name</label>
              <input
                type="text"
                placeholder="Enter new category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </div>
          )}
          <div className="modal-form-group">
            <label>Brand Name</label>
            <input
              type="text"
              placeholder="Enter brand name"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="modal-button-primary">
              Add Product
            </button>
            <button
              type="button"
              className="modal-button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
