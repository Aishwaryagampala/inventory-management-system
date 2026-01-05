// src/components/Modals/UpdateQuantityModal.js
import React, { useState, useEffect } from "react";
import { fetchData } from "../utils/api";

const UpdateQuantityModal = ({ onClose, onSuccess }) => {
  const [productName, setProductName] = useState("");
  const [skuId, setSkuId] = useState("");
  const [brandName, setBrandName] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [updateQuantity, setUpdateQuantity] = useState("");
  const [updateAmount, setUpdateAmount] = useState("");
  const [action, setAction] = useState("Sales");
  const [category, setCategory] = useState("Electronics");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (skuId) {
      const fetchCurrentStock = async () => {
        try {
          // Use products list endpoint with a sku filter to fetch product details
          const data = await fetchData(`/products?sku=${skuId}`, "GET");
          const product = Array.isArray(data) ? data[0] : data;
          if (product) {
            setCurrentStock(product.quantity || "");
            setProductName(product.name || "");
            setBrandName(product.brand || "");
            setCategory(product.category || "Electronics");
          } else {
            setCurrentStock("");
            setProductName("");
            setBrandName("");
            setCategory("Electronics");
          }
        } catch (error) {
          console.error("Network error fetching product details:", error);
          setCurrentStock("");
          setProductName("");
          setBrandName("");
          setCategory("Electronics");
        }
      };
      fetchCurrentStock();
    }
  }, [skuId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!skuId) {
      setErrorMessage("SKU ID is required to update a product.");
      return;
    }

    try {
      // Use the admin product update endpoint: PUT /api/products/:sku
      await fetchData(`/products/${skuId}`, "PUT", {
        name: productName,
        brand: brandName,
        category,
        amount: parseInt(updateQuantity), // backend expects 'amount' and uses 'action' to apply +/-
        action: action.toLowerCase(),
      });

      console.log("Product updated successfully");
      onSuccess();
    } catch (error) {
      setErrorMessage(error.message || "Failed to update quantity.");
      console.error("Error updating quantity:", error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="modal-title">Update Quantity</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="form-group">
            <input
              type="text"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="SKU ID"
              value={skuId}
              onChange={(e) => setSkuId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Brand Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Current Stock"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              readOnly
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Update Quantity"
              value={updateQuantity}
              onChange={(e) => setUpdateQuantity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Update Amount"
              value={updateAmount}
              onChange={(e) => setUpdateAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group flex-half">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="modal-select"
              >
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
                <option value="Return">Return</option>
              </select>
            </div>
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
          </div>
          <div className="modal-actions">
            <button type="submit" className="modal-button primary">
              Update Product
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

export default UpdateQuantityModal;
