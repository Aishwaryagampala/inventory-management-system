// src/BarcodeInteraction.js
import React, { useState, useCallback } from "react";
import { fetchData } from "../utils/api";
import "./BarcodeInteraction.css";

const BarcodeInteraction = () => {
  const [barcode, setBarcode] = useState("");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [updateAction, setUpdateAction] = useState("sale"); // 'sale', 'restock', 'return'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW: handleGetProductByBarcode ---
  const handleGetProductByBarcode = async () => {
    setLoading(true);
    setError(null);
    setScannedProduct(null);
    if (!barcode) {
      setError("Please enter a barcode.");
      setLoading(false);
      return;
    }
    try {
      const product = await fetchData(`/products/scan/${barcode}`, "GET");
      setScannedProduct(product);
      alert(
        `Product found: ${product.name} (Current Stock: ${product.quantity})`
      );
    } catch (err) {
      setError(err.message);
      setScannedProduct(null);
    } finally {
      setLoading(false);
    }
  };
  // --- END NEW ---

  // --- NEW: handleUpdateProductByBarcode ---
  const handleUpdateProductByBarcode = async () => {
    setLoading(true);
    setError(null);
    if (!barcode || !updateAmount || !updateAction) {
      setError("Please enter barcode, amount, and action.");
      setLoading(false);
      return;
    }
    try {
      // Note: Backend /api/products/scan/:barcode (PUT) expects { amount, action }
      // Make sure your backend controller for updateProductbyBarcode can handle these
      await fetchData(`/products/scan/${barcode}`, "PUT", {
        amount: parseInt(updateAmount),
        action: updateAction,
      });
      alert("Product quantity updated by barcode successfully!");
      // Clear fields and re-fetch product details if needed
      setUpdateAmount("");
      setScannedProduct(null); // Clear scanned product to prompt re-scan/refresh
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // --- END NEW ---

  return (
    <div className="barcode-interaction-section">
      <h3>Scan/Lookup & Update Product by Barcode</h3>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter or scan Barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleGetProductByBarcode} disabled={loading}>
          Lookup Product
        </button>
      </div>

      {scannedProduct && (
        <div className="product-details">
          <h4>{scannedProduct.name}</h4>
          <p>SKU: {scannedProduct.sku}</p>
          <p>Current Quantity: {scannedProduct.quantity}</p>
          <div className="input-group">
            <input
              type="number"
              placeholder="Amount"
              value={updateAmount}
              onChange={(e) => setUpdateAmount(e.target.value)}
              disabled={loading}
            />
            <select
              value={updateAction}
              onChange={(e) => setUpdateAction(e.target.value)}
              disabled={loading}
            >
              <option value="sale">Sale</option>
              <option value="restock">Restock</option>
              <option value="return">Return</option>
            </select>
            <button onClick={handleUpdateProductByBarcode} disabled={loading}>
              Update Quantity
            </button>
          </div>
        </div>
      )}

      {loading && <p>Processing...</p>}
      {error && <p className="error-message">Error: {error}</p>}
    </div>
  );
};

export default BarcodeInteraction;
