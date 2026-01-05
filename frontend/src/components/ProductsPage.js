import React, { useState, useEffect, useCallback } from "react";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Generic fetch function using cookies
  const fetchData = useCallback(async (path, method = "GET", body = null) => {
    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
    const endpoint = `${baseUrl}${path}`;

    const options = {
      method,
      credentials: "include", // ✅ Essential for cookie-based auth
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert("Session expired or unauthorized. Please log in again.");
          window.location.href = "/login";
          return null;
        }

        const errorData = await response.json();
        throw new Error(
          errorData.message || `API call failed with status: ${response.status}`
        );
      }

      // No content case
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error("API call error:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchData("/products");
        if (data) setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchData]);

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <h2>Products</h2>
      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong> — {product.quantity} in stock
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductsPage;
