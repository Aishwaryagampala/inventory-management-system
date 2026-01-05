import React, { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { toast } from "react-toastify";
import "./StaffBarcodeScannerView.css";
import { fetchData } from "../utils/api";

const StaffBarcodeScannerView = ({
  onUpdateProductQuantity,
  onViewProductDetails,
}) => {
  const [statusMessage, setStatusMessage] = useState("Ready to Scan");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [barcode, setBarcode] = useState("");
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");

  console.log("StaffBarcodeScannerView rendered");

  useEffect(() => {
    console.log("Camera useEffect running, videoRef:", videoRef.current);
    if (!videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    let active = true;
    let controls = null;
    let lastScannedCode = "";
    let lastScanTime = 0;

    const startCamera = async () => {
      try {
        setStatusMessage("Starting camera...");

        await codeReader.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, err, ctrl) => {
            if (ctrl && !controls) {
              controls = ctrl;
              console.log("Camera controls established");
            }
            if (result && active) {
              const scannedCode = result.getText();
              const now = Date.now();

              // Prevent duplicate scans within 2 seconds
              if (
                scannedCode !== lastScannedCode ||
                now - lastScanTime > 2000
              ) {
                console.log("Barcode detected:", scannedCode);
                setBarcode(scannedCode);
                lastScannedCode = scannedCode;
                lastScanTime = now;
              }
            }
          }
        );

        setStatusMessage("Camera active. Point at a barcode.");
        setCameraError(null);
        console.log("Camera started successfully");
      } catch (error) {
        console.error("Camera initialization error:", error);
        setCameraError(error.message);
        setStatusMessage("Failed to start camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      active = false;
      if (controls) {
        controls.stop();
        console.log("Camera stopped");
      }
    };
  }, []);

  useEffect(() => {
    if (barcode) {
      handleScanBarcode(barcode);
    }
  }, [barcode]);

  const handleScanBarcode = async (barcodeValue) => {
    setStatusMessage(`Scanning barcode: ${barcodeValue} ...`);
    setScannedProduct(null);

    try {
      const product = await fetchData(`/products/scan/${barcodeValue}`, "GET");

      setScannedProduct(product);
      setStatusMessage(`Product found: ${product.name}`);

      setRecentScans((prev) =>
        [
          {
            action: "Scanned",
            product: product.name,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ].slice(0, 5)
      );
    } catch (error) {
      setStatusMessage(
        `Product not found: ${error.message || "Please try again."}`
      );
    }
  };

  const handleQuantityChange = async (type) => {
    if (!scannedProduct || !scannedProduct.barcode) {
      setStatusMessage("No product scanned to update quantity.");
      return;
    }

    const quantityChangeStr = prompt(
      `Enter quantity to ${type} for ${scannedProduct.name}:`,
      1
    );
    const quantityChange = parseInt(quantityChangeStr, 10);

    if (isNaN(quantityChange) || quantityChange <= 0) {
      setStatusMessage("Invalid quantity. Enter a positive number.");
      return;
    }

    try {
      const action = type === "add" ? "restock" : "sale";

      const updatedProduct = await fetchData(
        `/products/scan/${scannedProduct.barcode}`,
        "PUT",
        {
          action,
          amount: quantityChange,
        }
      );

      setScannedProduct(updatedProduct);

      setStatusMessage(
        `${type === "add" ? "Added" : "Removed"} ${quantityChange} units of ${
          scannedProduct.name
        }.`
      );

      if (updatedProduct.quantity <= updatedProduct.reorder_level) {
        toast.warning(
          `⚠️ Low Stock Alert: ${updatedProduct.name} is at ${updatedProduct.quantity} units (Reorder level: ${updatedProduct.reorder_level})`,
          { autoClose: 5000 }
        );
      }

      setRecentScans((prev) =>
        [
          {
            action: `${type === "add" ? "+" : "-"}${quantityChange}`,
            product: scannedProduct.name,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ].slice(0, 5)
      );

      if (onUpdateProductQuantity) onUpdateProductQuantity();
    } catch (error) {
      setStatusMessage(`Failed to update: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div
      className="barcode-scanner-container"
      style={{ minHeight: "100vh", padding: "20px" }}
    >
      <h1
        className="barcode-scanner-header"
        style={{ fontSize: "32px", marginBottom: "20px" }}
      >
        Barcode Scanner
      </h1>

      {cameraError && (
        <div
          style={{
            color: "red",
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#ffe6e6",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          Camera Error: {cameraError}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <video
          ref={videoRef}
          width="400"
          height="300"
          style={{
            border: "2px solid #000",
            borderRadius: "12px",
            maxWidth: "100%",
            backgroundColor: "#000",
          }}
        />
      </div>

      <div
        className="status-message"
        style={{
          fontSize: "16px",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        Status: {statusMessage}
      </div>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "2px solid #e0e0e0",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "15px", fontSize: "18px" }}>
          Manual Barcode Entry
        </h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && manualBarcode.trim()) {
                setBarcode(manualBarcode.trim());
                setManualBarcode("");
              }
            }}
            placeholder="Enter barcode (e.g., INV-SKU001)"
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <button
            onClick={() => {
              if (manualBarcode.trim()) {
                setBarcode(manualBarcode.trim());
                setManualBarcode("");
              }
            }}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#1a1a1a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Scan
          </button>
        </div>
        <p
          style={{
            margin: "10px 0 0 0",
            fontSize: "13px",
            color: "#666",
          }}
        >
          💡 Tip: If camera scanning isn't working, type the barcode manually
          above
        </p>
      </div>

      {scannedProduct && (
        <div className="product-info-section">
          <h3 className="section-title">Product Information</h3>
          <div className="product-details">
            <p>
              <strong>Product Name:</strong> {scannedProduct.name}
            </p>
            <p>
              <strong>SKU:</strong> {scannedProduct.sku}
            </p>
            <p>
              <strong>Brand:</strong> {scannedProduct.brand || "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {scannedProduct.category}
            </p>
            <p>
              <strong>Current Quantity:</strong> {scannedProduct.quantity}
            </p>
            <p>
              <strong>Reorder Level:</strong>{" "}
              {scannedProduct.reorder_level || "N/A"}
            </p>
            <p>
              <strong>Barcode:</strong> {scannedProduct.barcode}
            </p>
          </div>
          <div className="product-action-buttons">
            <button
              className="product-action-button blue"
              onClick={() => handleQuantityChange("add")}
            >
              Add Quantity
            </button>
            <button
              className="product-action-button black"
              onClick={() => handleQuantityChange("remove")}
            >
              Remove Quantity
            </button>
          </div>
        </div>
      )}

      <div className="recent-scans-section">
        <h3 className="section-title">Recent Scans</h3>
        <div className="recent-scans-list">
          {recentScans.length > 0 ? (
            <ul>
              {recentScans.map((scan, index) => (
                <li key={index}>
                  <span>
                    {scan.product} ({scan.action})
                  </span>
                  <span>{scan.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent scans.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffBarcodeScannerView;
