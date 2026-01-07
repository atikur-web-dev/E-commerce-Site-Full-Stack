// Frontend/src/pages/Admin/ProductAddEdit/ProductAddEdit.jsx - COMPLETE FIXED
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductAddEdit.css";

const ProductAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: [],
    brand: "",
    sku: "",
    status: "published",
    featured: false,
    specifications: {
      weight: "",
      dimensions: "",
      color: "",
      material: ""
    },
    tags: []
  });

  const categories = [
    "Smartphones", "Laptops", "Tablets", "Gaming", 
    "Accessories", "Wearables", "Home Appliances", "Cameras"
  ];

  const statusOptions = [
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" }
  ];

  useEffect(() => {
    console.log("🔄 ProductAddEdit useEffect running, ID:", id);
    
    // Check authentication
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      
      if (!userStr) {
        navigate("/login");
        return false;
      }
      
      const userData = JSON.parse(userStr);
      if (userData.role !== "admin") {
        alert("Access denied! Admin only.");
        navigate("/");
        return false;
      }
      
      return true;
    };

    if (!checkAuth()) {
      return;
    }

    // If edit mode, fetch product
    if (id) {
      console.log("📝 Edit mode, fetching product ID:", id);
      fetchProduct();
    } else {
      // Add mode
      console.log("➕ Add new product mode");
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchProduct = async () => {
    try {
      console.log("🔍 Fetching product data for ID:", id);
      
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const productData = await response.json();
      console.log("✅ Fetched product data:", productData);
      
      // Transform backend data to form format
      setProduct({
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price?.toString() || "0",
        category: productData.category || "",
        stock: productData.stock?.toString() || "0",
        images: productData.images || [],
        brand: productData.brand || "",
        sku: productData.sku || "",
        status: "published",
        featured: productData.isFeatured || false,
        specifications: productData.specifications || {
          weight: "",
          dimensions: "",
          color: "",
          material: ""
        },
        tags: productData.tags || []
      });
      
      setLoading(false);
      console.log("✅ Form data set successfully");
      
    } catch (err) {
      console.error("❌ Error fetching product:", err);
      setError(`Failed to load product data: ${err.message}`);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProduct(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setProduct(prev => ({ ...prev, tags }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setProduct(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5)
    }));
  };

  const removeImage = (index) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      console.log("📤 Submitting product data:", product);

      // Validate required fields
      if (!product.name || !product.price || !product.category) {
        throw new Error("Please fill in all required fields");
      }

      // Get token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      // Prepare data
      const productData = {
        name: product.name,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        brand: product.brand || "",
        stock: Number(product.stock) || 0,
        images: product.images.length > 0 ? product.images : ["/default-product.jpg"],
        specifications: product.specifications,
        tags: product.tags,
        isFeatured: product.featured
      };

      console.log("📦 Sending to backend:", productData);

      let response;
      if (id) {
        // Update existing product
        console.log(`🔄 Updating product: ${id}`);
        response = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Create new product
        console.log("🆕 Creating new product");
        response = await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
      }

      const data = await response.json();
      console.log("Backend response:", data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      if (id) {
        setSuccess("✅ Product updated successfully!");
      } else {
        setSuccess("✅ Product created successfully!");
      }
      
      setSaving(false);

      // Redirect after success
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
      
    } catch (err) {
      console.error("❌ Error saving product:", err);
      setError(err.message || "Failed to save product. Please try again.");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      navigate("/admin/products");
    }
  };

  if (loading) {
    return (
      <div className="product-add-edit-loading">
        <div className="spinner"></div>
        <p>{id ? "Loading product..." : "Preparing form..."}</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Product ID: {id || 'N/A'}
        </p>
      </div>
    );
  }

  return (
    <div className="product-add-edit">
      <div className="page-header">
        <h1>{id ? "Edit Product" : "Add New Product"}</h1>
        <p>
          {id ? "Update existing product details" : "Create a new product for your store"}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <strong>Success!</strong> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Left Column - Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={product.sku}
                onChange={handleChange}
                placeholder="e.g., PROD-001"
                disabled={saving}
              />
              <small className="form-help">Unique identifier for inventory</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (৳) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock Quantity *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={product.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  required
                  disabled={saving}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                  placeholder="Brand name"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                value={product.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="iphone, smartphone, apple (comma separated)"
                disabled={saving}
              />
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="form-section">
            <h3>Additional Information</h3>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Detailed product description..."
                rows="6"
                required
                disabled={saving}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={product.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={product.featured}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <span>Featured Product</span>
                </label>
              </div>
            </div>

            {/* Specifications */}
            <div className="specifications">
              <h4>Specifications</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight">Weight</label>
                  <input
                    type="text"
                    id="weight"
                    name="specifications.weight"
                    value={product.specifications.weight}
                    onChange={handleChange}
                    placeholder="e.g., 187g"
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dimensions">Dimensions</label>
                  <input
                    type="text"
                    id="dimensions"
                    name="specifications.dimensions"
                    value={product.specifications.dimensions}
                    onChange={handleChange}
                    placeholder="e.g., 146.6 x 70.6 x 8.25 mm"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <input
                    type="text"
                    id="color"
                    name="specifications.color"
                    value={product.specifications.color}
                    onChange={handleChange}
                    placeholder="e.g., Natural Titanium"
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="material">Material</label>
                  <input
                    type="text"
                    id="material"
                    name="specifications.material"
                    value={product.specifications.material}
                    onChange={handleChange}
                    placeholder="e.g., Titanium"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-section full-width">
            <h3>Product Images</h3>
            <p className="form-help">
              Upload up to 5 images. First image will be the main display image.
            </p>
            
            <div className="image-upload-section">
              <div className="image-upload-box">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="image-input"
                  disabled={saving}
                />
                <label htmlFor="image-upload" className="upload-label">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Click to upload images</span>
                  <span className="upload-hint">PNG, JPG, WEBP up to 5MB</span>
                </label>
              </div>

              {product.images.length > 0 && (
                <div className="image-preview-grid">
                  {product.images.map((img, index) => (
                    <div key={index} className="image-preview">
                      <img src={img} alt={`Product ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        title="Remove image"
                        disabled={saving}
                      >
                        ×
                      </button>
                      {index === 0 && <span className="main-badge">Main</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-small"></span>
                {id ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <span className="btn-icon">{id ? "💾" : "➕"}</span>
                {id ? "Update Product" : "Create Product"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAddEdit;