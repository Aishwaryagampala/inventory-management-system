import React, { useState, useEffect, useCallback } from 'react';
import { fetchData } from '../api';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products list from backend (uses existing /api/products route)
  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchData('/products', 'GET');
      if (data) setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="products-page">
      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.sku}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category || '-'}</td>
                <td>{p.quantity}</td>
                <td>{p.reorder_level}</td>
                <td>{p.expiry ? new Date(p.expiry).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductsPage;
