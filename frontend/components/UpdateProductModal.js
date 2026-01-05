// src/components/UpdateProductModal.js
import React, { useState, useEffect } from 'react';
import { fetchData } from '../utils/api';  
import './Modal.css';

const UpdateProductModal = ({ isOpen, onClose, product, onUpdateSuccess }) => {
    const [productName, setProductName] = useState('');
    const [skuId, setSkuId] = useState('');
    const [currentStock, setCurrentStock] = useState('');
    const [updateQuantity, setUpdateQuantity] = useState('');
    const [updateAmount, setUpdateAmount] = useState('');
    const [action, setAction] = useState('sale');
    const [category, setCategory] = useState('Electronics');

    
    useEffect(() => {
        if (product) {
            setProductName(product.name || '');
            setSkuId(product.sku || '');
            setCurrentStock(product.quantity || '');
            setCategory(product.category || 'Electronics');
        } else {
            setProductName('');
            setSkuId('');
            setCurrentStock('');
            setCategory('Electronics');
        }
        setUpdateQuantity('');
        setUpdateAmount('');
        setAction('sale');
    }, [product]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!skuId) {
            alert('SKU ID is required.');
            return;
        }
        if (!updateQuantity || parseInt(updateQuantity) <= 0) {
            alert('Update Quantity must be a positive number.');
            return;
        }

        const quantityChange = parseInt(updateQuantity);
        const finalQuantityChange = action === 'sale' ? -quantityChange : quantityChange;

        try {
            
            await fetchData(`/products/${skuId}/quantity`, 'PATCH', {
                quantity: finalQuantityChange,
                action: action,
                updateAmount: updateAmount ? parseFloat(updateAmount) : 0
            });

            alert(`Product ${productName} quantity updated successfully!`);
            onUpdateSuccess();
            onClose();
        } catch (error) {
            alert('Error updating product: ' + error.message);
            console.error(error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-header">Update Quantity</h2>
                <form onSubmit={handleSubmit}>
                    <div className="modal-form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            value={productName}
                            readOnly
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>SKU</label>
                        <input
                            type="text"
                            value={skuId}
                            readOnly
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Current Stock</label>
                        <input
                            type="number"
                            value={currentStock}
                            readOnly
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Update Quantity</label>
                        <input
                            type="number"
                            value={updateQuantity}
                            onChange={(e) => setUpdateQuantity(e.target.value)}
                            required
                            min="1"
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Update Amount (Optional)</label>
                        <input
                            type="number"
                            value={updateAmount}
                            onChange={(e) => setUpdateAmount(e.target.value)}
                        />
                    </div>
                    <div className="modal-form-row">
                        <div className="modal-form-group">
                            <label>Action</label>
                            <select value={action} onChange={(e) => setAction(e.target.value)} required>
                                <option value="sale">Sale</option>
                                <option value="restock">Restock</option>
                                <option value="return">Return</option>
                            </select>
                        </div>
                        <div className="modal-form-group">
                            <label>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled
                            >
                                <option value="Electronics">Electronics</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Apparel">Apparel</option>
                                <option value="Books">Books</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-buttons">
                        <button type="submit" className="modal-button primary">Update Product</button>
                        <button type="button" onClick={onClose} className="modal-button secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProductModal;
