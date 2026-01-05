import React, { useState, useEffect } from "react";
import { fetchData } from "../../utils/api";

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
          const response = await fetchData(`/scan/${skuId}`, { method: "GET" });
          if (response.ok) {
            const data = await response.json();
            setCurrentStock(data.currentStock || "");
            setProductName(data.productName || "");
            setBrandName(data.brandName || "");
            setCategory(data.category || "Electronics");
          } else {
            console.error("Failed to fetch product details for SKU:", skuId);
            setCurrentStock("");
            setProductName("");
            setBrandName("");
            setCategory("Electronics");
          }
        } catch (error) {
          console.error("Network error fetching product details:", error);
          setCurrentStock("");
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
      const response = await fetchData(`/scan/${skuId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productName,
          brandName,
          updateQuantity: parseInt(updateQuantity),
          updateAmount: parseInt(updateAmount),
          action,
          category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Product updated successfully:", data);
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to update quantity.");
      }
    } catch (error) {
      setErrorMessage("Network error. Could not update quantity.");
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
