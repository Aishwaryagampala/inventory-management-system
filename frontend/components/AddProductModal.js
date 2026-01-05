// src/components/Modals/AddProductModal.js
import React, { useState } from "react";
import { fetchData } from "../utils/api";

const AddProductModal = ({ onClose, onSuccess }) => {
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // Use centralized helper so cookies are included and errors handled consistently
      await fetchData("/products/add", "POST", {
        sku,
        name: productName,
        brand,
        category,
        quantity: parseInt(quantity) || 0,
      });

      console.log("Product added successfully");
      onSuccess();
    } catch (error) {
      setErrorMessage(error.message || "Failed to add product.");
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="modal-title">Add Product</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="form-group">
            <input
              type="text"
              placeholder="SKU (Unique ID)"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Image URL"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group flex-half">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="modal-select"
              >
                <option value="Electronics">Electronics</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Laptops">Laptops</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="form-group flex-half">
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Brand Name"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="modal-button primary">
              Add Product
            </button>
            <button
              type="button"
              className="modal-button secondary"
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
