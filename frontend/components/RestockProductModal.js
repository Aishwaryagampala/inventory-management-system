// src/components/RestockProductModal.js
import React, { useState } from "react";
import "../styles/Modal.css";
import { fetchData } from "../api";

const RestockProductModal = ({ isOpen, onClose, onRestockSuccess }) => {
  const [productName, setProductName] = useState("");
  const [skuId, setSkuId] = useState(""); // SKU ID is essential for backend API
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [quantity, setQuantity] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!skuId) {
      alert("SKU ID is required to restock a product.");
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      alert("Quantity to restock must be a positive number.");
      return;
    }

    const restockAmount = parseInt(quantity);

    try {
      // Using PATCH /api/products/:sku/quantity for restock, sending positive amount to add
      await fetchData(`/products/${skuId}/quantity`, "PATCH", {
        action: "restock",
        amount: restockAmount,
      });

      console.log("Restock successful for SKU:", skuId);
      alert(
        `Restocked ${restockAmount} units of ${productName} (SKU: ${skuId}) successfully!`
      );
      onRestockSuccess(); // Callback to refresh data in parent
      onClose();
      // Clear form fields after submission
      setProductName("");
      setSkuId("");
      setBrand("");
      setCategory("Electronics");
      setQuantity("");
    } catch (error) {
      console.error("Network error during restock:", error);
      alert("Network error during restock. Please check your connection.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">Restock Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label htmlFor="restockProductName">Products Name</label>
            <input
              type="text"
              id="restockProductName"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="modal-form-group">
            <label htmlFor="restockSkuId">SKU ID</label>
            <input
              type="text"
              id="restockSkuId"
              placeholder="SKU ID"
              value={skuId}
              onChange={(e) => setSkuId(e.target.value)}
              required
            />
          </div>
          <div className="modal-form-group">
            <label htmlFor="restockBrand">Brand</label>
            <input
              type="text"
              id="restockBrand"
              placeholder="Brand Name"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>
          <div className="modal-form-row">
            <div className="modal-form-group">
              <label htmlFor="restockCategory">Category</label>
              <select
                id="restockCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="Electronics">Electronics</option>
                <option value="Mobile">Mobile</option>
                <option value="Laptop">Laptop</option>
                <option value="Apparel">Apparel</option>
                <option value="Books">Books</option>
                {/* Add more categories as needed from your backend */}
              </select>
            </div>
            <div className="modal-form-group">
              <label htmlFor="restockQuantity">Quantity</label>
              <input
                type="number"
                id="restockQuantity"
                placeholder="Quantity to Restock"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="modal-button primary">
              Restock
            </button>
            <button
              type="button"
              onClick={onClose}
              className="modal-button secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockProductModal;
