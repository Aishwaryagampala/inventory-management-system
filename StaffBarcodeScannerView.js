import React, { useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import './StaffBarcodeScannerView.css';
import { fetchData } from '../utils/api';

const StaffBarcodeScannerView = ({ onUpdateProductQuantity, onViewProductDetails }) => {
  const [statusMessage, setStatusMessage] = useState('Ready to Scan');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [barcode, setBarcode] = useState('');

  // ✅ Start camera on mount
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let active = true;
    let controls = null; // store camera controls to stop later

    setStatusMessage('Camera active. Point at a barcode.');

    // ✅ Use default camera and attach to <video id="video">
    codeReader.decodeFromVideoDevice(null, 'video', (result, err, ctrl) => {
      if (ctrl && !controls) {
        controls = ctrl; // Save the camera controls for cleanup
      }
      if (result && active) {
        const scannedCode = result.getText();
        setBarcode(scannedCode);
      }
    });

    return () => {
      active = false;
      if (controls) {
        controls.stop(); // ✅ Properly release the camera
      }
    };
  }, []);

  // ✅ Call API when a barcode is detected
  useEffect(() => {
    if (barcode) {
      handleScanBarcode(barcode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode]);

  const handleScanBarcode = async (barcodeValue) => {
    setStatusMessage(`Scanning barcode: ${barcodeValue} ...`);
    setScannedProduct(null);

    try {
      const response = await fetchData(`/scan/${barcodeValue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const product = await response.json();
        setScannedProduct(product);
        setStatusMessage(`Product found: ${product.name}`);

        // ✅ Add to recent scans
        setRecentScans(prev => [{
          action: 'Scanned',
          product: product.name,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }, ...prev].slice(0, 5));
      } else {
        const errorData = await response.json();
        setStatusMessage(`Product not found: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      setStatusMessage('Network error during barcode scan.');
    }
  };

  const handleQuantityChange = async (type) => {
    if (!scannedProduct || !scannedProduct.barcode) {
      setStatusMessage('No product scanned to update quantity.');
      return;
    }

    const quantityChangeStr = prompt(`Enter quantity to ${type} for ${scannedProduct.name}:`, 1);
    const quantityChange = parseInt(quantityChangeStr, 10);

    if (isNaN(quantityChange) || quantityChange <= 0) {
      setStatusMessage('Invalid quantity. Enter a positive number.');
      return;
    }

    const finalQuantityChange = type === 'add' ? quantityChange : -quantityChange;

    try {
      const response = await fetchData(`/scan/${scannedProduct.barcode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          quantity: finalQuantityChange,
          actionType: type
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setScannedProduct(data);
        setStatusMessage(`${type === 'add' ? 'Added' : 'Removed'} ${quantityChange} units of ${scannedProduct.name}.`);

        setRecentScans(prev => [{
          action: `${type === 'add' ? '+' : '-'}${quantityChange}`,
          product: scannedProduct.name,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }, ...prev].slice(0, 5));

        if (onUpdateProductQuantity) onUpdateProductQuantity();
      } else {
        const errorData = await response.json();
        setStatusMessage(`Failed to update: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setStatusMessage('Network error during quantity update.');
    }
  };

  return (
    <div className="barcode-scanner-container">
      <h1 className="barcode-scanner-header">Barcode Scanner</h1>

      {/* ✅ Live camera feed */}
      <video id="video" width="400" height="300" style={{ border: '1px solid black' }} />

      <div className="status-message">Status: {statusMessage}</div>

      {scannedProduct && (
        <div className="product-info-section">
          <h3 className="section-title">Product Information</h3>
          <div className="product-details">
            <p><strong>Product Name:</strong> {scannedProduct.name}</p>
            <p><strong>Category:</strong> {scannedProduct.category}</p>
            <p><strong>Current Quantity:</strong> {scannedProduct.quantity}</p>
          </div>
          <div className="product-action-buttons">
            <button className="product-action-button blue" onClick={() => handleQuantityChange('add')}>
              Add Quantity
            </button>
            <button className="product-action-button black" onClick={() => handleQuantityChange('remove')}>
              Remove Quantity
            </button>
            <button className="product-action-button link" onClick={() => onViewProductDetails(scannedProduct)}>
              View Product Details
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
                  <span>{scan.product} ({scan.action})</span>
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
