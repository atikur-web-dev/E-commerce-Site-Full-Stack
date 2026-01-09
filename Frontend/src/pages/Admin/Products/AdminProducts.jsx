// Frontend/src/pages/Admin/Products/AdminProducts.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminProducts.css";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
      return;
    }

    // REAL API CALL
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching products...");
        
        const response = await fetch("http://localhost:5000/api/products", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Products from API:", data);
        
        // Transform backend data to frontend format
        const formattedProducts = data.map(product => ({
          _id: product._id,
          id: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          status: "published",
          sales: product.numReviews || 0,
          createdAt: product.createdAt,
          image: product.images && product.images[0] ? product.images[0] : "/default-product.jpg"
        }));
        
        setProducts(formattedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to demo data if API fails
        setProducts(generateDemoProducts());
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  const generateDemoProducts = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      _id: `prod_${i + 1}`,
      id: `prod_${i + 1}`,
      name: `Product ${i + 1}`,
      category: ["Smartphones", "Laptops", "Tablets", "Gaming", "Accessories"][i % 5],
      price: Math.floor(Math.random() * 10000) + 500,
      stock: Math.floor(Math.random() * 100),
      status: ["published", "draft", "archived"][i % 3],
      sales: Math.floor(Math.random() * 500),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop&auto=format&q=60`,
    }));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleBulkAction = () => {
    if (!bulkAction || selectedProducts.length === 0) {
      alert("Please select products and choose an action");
      return;
    }

    if (bulkAction === "delete") {
      if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
        setProducts(products.filter(p => !selectedProducts.includes(p._id)));
        setSelectedProducts([]);
        setBulkAction("");
        alert("Products deleted successfully!");
      }
    } else if (bulkAction === "publish") {
      setProducts(products.map(p => 
        selectedProducts.includes(p._id) ? { ...p, status: "published" } : p
      ));
      setSelectedProducts([]);
      setBulkAction("");
      alert("Products published successfully!");
    } else if (bulkAction === "archive") {
      setProducts(products.map(p => 
        selectedProducts.includes(p._id) ? { ...p, status: "archived" } : p
      ));
      setSelectedProducts([]);
      setBulkAction("");
      alert("Products archived successfully!");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p._id !== productId));
          alert("Product deleted successfully!");
        } else {
          throw new Error("Failed to delete product");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="products-header">
        <div>
          <h1>Product Management</h1>
          <p>Manage your products inventory</p>
        </div>
        <Link to="/admin/products/add" className="btn btn-primary">
          <span className="btn-icon">➕</span>
          Add New Product
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="products-stats">
        <div className="stat-card">
          <div className="stat-icon total">🛍️</div>
          <h3>{products.length}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon published">✅</div>
          <h3>{products.filter(p => p.status === "published").length}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon low">⚠️</div>
          <h3>{products.filter(p => p.stock < 10).length}</h3>
          <p>Low Stock</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon sales">💰</div>
          <h3>{products.reduce((sum, p) => sum + p.sales, 0)}</h3>
          <p>Total Sales</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="products-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Laptops">Laptops</option>
            <option value="Tablets">Tablets</option>
            <option value="Gaming">Gaming</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <button
          className="filter-btn"
          onClick={() => {
            setSearchTerm("");
            setCategoryFilter("all");
            setStatusFilter("all");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <strong>{selectedProducts.length}</strong> products selected
          </div>
          <div className="bulk-controls">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-select"
            >
              <option value="">Choose Action</option>
              <option value="publish">Publish Selected</option>
              <option value="archive">Archive Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="apply-bulk-btn"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="clear-bulk-btn"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-container">
        <div className="table-responsive">
          <table className="products-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Sales</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table">
                    <div className="empty-icon">📦</div>
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className={product.stock < 10 ? "low-stock" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                      />
                    </td>
                    <td>
                      <div className="product-cell">
                        <div className="product-image">
                          <img src={product.image} alt={product.name} />
                        </div>
                        <div className="product-details">
                          <strong>{product.name}</strong>
                          <small>ID: {product._id.substring(0, 8)}...</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td className="price-cell">
                      <strong>{formatPrice(product.price)}</strong>
                    </td>
                    <td>
                      <div className="stock-indicator">
                        <div className="stock-bar">
                          <div
                            className="stock-fill"
                            style={{
                              width: `${Math.min(
                                (product.stock / 100) * 100,
                                100
                              )}%`,
                              backgroundColor:
                                product.stock < 10
                                  ? "#ef4444"
                                  : product.stock < 30
                                  ? "#f59e0b"
                                  : "#10b981",
                            }}
                          ></div>
                        </div>
                        <span className="stock-value">{product.stock}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="sales-cell">
                        <span className="sales-value">{product.sales}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() =>
                            navigate(`/admin/products/edit/${product._id}`)
                          }
                          title="Edit Product"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn view-btn"
                          onClick={() => navigate(`/product/${product._id}`)}
                          title="View Product"
                        >
                          👁️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteProduct(product._id)}
                          title="Delete Product"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn" disabled>
          ← Previous
        </button>
        <div className="pagination-numbers">
          <button className="pagination-number active">1</button>
          <button className="pagination-number">2</button>
          <button className="pagination-number">3</button>
          <span className="pagination-ellipsis">...</span>
          <button className="pagination-number">10</button>
        </div>
        <button className="pagination-btn">Next →</button>
      </div>
    </div>
  );
};

export default AdminProducts;