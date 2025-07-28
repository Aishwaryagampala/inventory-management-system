import React, { useState, useEffect, useCallback } from 'react';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: 0 });
  const [editingProduct, setEditingProduct] = useState(null);

  // ✅ Generic API fetch with cookies
  const fetchData = useCallback(async (path, method = 'GET', body = null) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    const endpoint = `${baseUrl}${path}`;

    const options = {
      method,
      credentials: 'include', // ✅ Cookie-based auth
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(endpoint, options);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        alert('Session expired or unauthorized. Please log in again.');
        window.location.href = '/';
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API failed: ${response.status}`);
    }

    if (response.status === 204) return null;
    return await response.json();
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchData('/products');
      if (data) setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ✅ Create Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await fetchData('/products', 'POST', newProduct);
      setNewProduct({ name: '', quantity: 0 });
      loadProducts();
    } catch (err) {
      alert(`Add failed: ${err.message}`);
    }
  };

  // ✅ Edit Product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await fetchData(`/products/${editingProduct.id}`, 'PUT', editingProduct);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // ✅ Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await fetchData(`/products/${id}`, 'DELETE');
      loadProducts();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <h2>Products</h2>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Product name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value, 10) })}
          required
        />
        <button type="submit">Add Product</button>
      </form>

      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {editingProduct && editingProduct.id === p.id ? (
                <form onSubmit={handleUpdateProduct}>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value, 10) })
                    }
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingProduct(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <strong>{p.name}</strong> — {p.quantity} in stock
                  <button onClick={() => handleEditProduct(p)} style={{ marginLeft: '10px' }}>Edit</button>
                  <button onClick={() => handleDeleteProduct(p.id)} style={{ marginLeft: '5px' }}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductsPage;
