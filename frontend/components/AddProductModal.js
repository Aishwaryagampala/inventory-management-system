// src/components/Modals/AddProductModal.js
import React, { useState } from 'react';

const AddProductModal = ({ onClose, onSuccess }) => {
  const [productName, setProductName] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [quantity, setQuantity] = useState('');
  const [brand, setBrand] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('/api/products/add', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          productName,
          imageURL,
          category,
          quantity: parseInt(quantity),
          brand
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Product added successfully:', result);
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to add product.');
      }
    } catch (error) {
      setErrorMessage('Network error. Could not add product.');
      console.error('Error adding product:', error);
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
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="modal-select">
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
            <button type="submit" className="modal-button primary">Add Product</button>
            <button type="button" className="modal-button secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
