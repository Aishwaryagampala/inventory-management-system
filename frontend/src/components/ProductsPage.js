import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "./ProductsPage.css";
import AddProductModal from "./Modals/AddProductModal";
import AddUserModal from "./Modals/AddUserModal";

function ProductsPage({ userRole }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const isAdmin = userRole && userRole.toLowerCase() === "admin";
  const isStaff = userRole && userRole.toLowerCase() === "staff";

  const fetchData = useCallback(async (path, method = "GET", body = null) => {
    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
    const endpoint = `${baseUrl}${path}`;

    const options = {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    };

    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/";
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return null;
      }
      return await response.json();
    } catch (err) {
      console.error("API error:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchData("/products");
        if (data) {
          setProducts(data);
          const uniqueCategories = [
            ...new Set(data.map((p) => p.category).filter(Boolean)),
          ];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Failed to load products:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [fetchData]);

  const handleUpdateQuantity = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleQuantityUpdate = async (action, amount) => {
    if (!selectedProduct) return;

    try {
      await fetchData(`/products/${selectedProduct.sku}/quantity`, "PATCH", {
        action,
        amount: parseInt(amount),
      });

      // Reload products
      const data = await fetchData("/products");
      if (data) {
        setProducts(data);

        // Check if the updated product is now low on stock
        const updatedProduct = data.find((p) => p.sku === selectedProduct.sku);
        if (
          updatedProduct &&
          updatedProduct.quantity <= updatedProduct.reorder_level
        ) {
          toast.warning(
            `⚠️ Low Stock Alert: ${updatedProduct.name} (${updatedProduct.sku}) is at ${updatedProduct.quantity} units (Reorder level: ${updatedProduct.reorder_level})`,
            { autoClose: 5000 }
          );
        }
      }

      setShowUpdateModal(false);
      setSelectedProduct(null);
    } catch (err) {
      toast.error(`Failed to update quantity: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (sku) => {
    if (!window.confirm(`Are you sure you want to delete product ${sku}?`)) {
      return;
    }

    try {
      await fetchData(`/products/${sku}`, "DELETE");

      // Reload products
      const data = await fetchData("/products");
      if (data) setProducts(data);
    } catch (err) {
      toast.error(`Failed to delete product: ${err.message}`);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleProductUpdate = async (updatedData) => {
    if (!selectedProduct) return;

    try {
      // Add action: "update" to indicate this is a product details update, not a quantity change
      const payload = {
        ...updatedData,
        action: "update",
      };

      await fetchData(`/products/${selectedProduct.sku}`, "PUT", payload);

      // Reload products
      const data = await fetchData("/products");
      if (data) setProducts(data);

      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (err) {
      toast.error(`Failed to update product: ${err.message}`);
    }
  };

  const handleAddProductSuccess = async () => {
    // Reload products after adding a new one
    const data = await fetchData("/products");
    if (data) {
      setProducts(data);
      const uniqueCategories = [
        ...new Set(data.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    }
    setShowAddProductModal(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="products-page-container">
        <div className="loading-spinner">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="products-page-container">
      <div className="products-header-section">
        <h1 className="products-title">Products</h1>
        {isAdmin && (
          <div className="products-actions">
            <button
              className="action-button"
              onClick={() => {
                console.log("Add Product button clicked");
                setShowAddProductModal(true);
              }}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              + Add Product
            </button>
            <button
              className="action-button"
              onClick={() => {
                console.log("Add User button clicked");
                setShowAddUserModal(true);
              }}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              + Add User
            </button>
          </div>
        )}
      </div>

      <div className="products-filter-row">
        <div className="search-input-group">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown-group">
          <select
            className="filter-dropdown"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products-message">
          <p>No products found.</p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  <td>
                    {isStaff && (
                      <button
                        className="action-button small-button"
                        onClick={() => handleUpdateQuantity(product)}
                      >
                        Update Qty
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          className="action-button small-button"
                          onClick={() => handleUpdateQuantity(product)}
                        >
                          Update Qty
                        </button>
                        <button
                          className="action-button small-button"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-button small-button delete-button"
                          onClick={() => handleDeleteProduct(product.sku)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Quantity Modal */}
      {showUpdateModal && selectedProduct && (
        <UpdateQuantityModal
          product={selectedProduct}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleQuantityUpdate}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleProductUpdate}
        />
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onSuccess={handleAddProductSuccess}
        />
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal onClose={() => setShowAddUserModal(false)} />
      )}
    </div>
  );
}

// Update Quantity Modal Component
function UpdateQuantityModal({ product, onClose, onUpdate }) {
  const [action, setAction] = useState("restock");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    onUpdate(action, amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header">Update Quantity</h2>
        <div className="product-info">
          <p>
            <strong>Product:</strong> {product.name}
          </p>
          <p>
            <strong>SKU:</strong> {product.sku}
          </p>
          <p>
            <strong>Current Quantity:</strong> {product.quantity}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label>Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
            >
              <option value="restock">Add Stock (Restock)</option>
              <option value="sale">Remove Stock (Sale)</option>
            </select>
          </div>
          <div className="modal-form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="modal-button primary">
              Update
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
}

// Edit Product Modal Component
function EditProductModal({ product, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: product.name || "",
    brand: product.brand || "",
    category: product.category || "",
    quantity: product.quantity || 0,
    reorder_level: product.reorder_level || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "reorder_level"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }
    onUpdate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header">Edit Product</h2>
        <div className="product-info">
          <p>
            <strong>SKU:</strong> {product.sku} (cannot be changed)
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="modal-form-group">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Enter brand name"
            />
          </div>
          <div className="modal-form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter category"
            />
          </div>
          <div className="modal-form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
            />
          </div>
          <div className="modal-form-group">
            <label>Reorder Level</label>
            <input
              type="number"
              name="reorder_level"
              min="0"
              value={formData.reorder_level}
              onChange={handleChange}
              placeholder="Enter reorder level"
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="modal-button primary">
              Save Changes
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
}

export default ProductsPage;
