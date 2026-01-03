// Frontend/src/pages/Admin/ProductAddEdit/ProductAddEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "../../../services/api";
import "./ProductAddEdit.css";

const ProductAddEdit = () => {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(!id);
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
    if (user?.role !== "admin") {
      navigate("/login");
      return;
    }

    if (id) {
      // Edit mode - fetch product data
      fetchProduct();
    }
  }, [id, user, navigate]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // For demo, generate product data
      setTimeout(() => {
        setProduct({
          name: "iPhone 15 Pro",
          description: "Latest iPhone with advanced camera system and A17 Pro chip.",
          price: "129999",
          category: "Smartphones",
          stock: "45",
          images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop"],
          brand: "Apple",
          sku: "APP-IP15PRO-256",
          status: "published",
          featured: true,
          specifications: {
            weight: "187g",
            dimensions: "146.6 x 70.6 x 8.25 mm",
            color: "Natural Titanium",
            material: "Titanium"
          },
          tags: ["iphone", "smartphone", "apple", "premium"]
        });
        setLoading(false);
      }, 1000);
      
      // Actual API call would be:
      // const response = await axios.get(`/api/admin/products/${id}`);
      // setProduct(response.data);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product data");
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
      images: [...prev.images, ...newImages].slice(0, 5) // Limit to 5 images
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

      // Validate required fields
      if (!product.name || !product.price || !product.category) {
        throw new Error("Please fill in all required fields");
      }

      // For demo, simulate API call
      setTimeout(() => {
        setSaving(false);
        setSuccess(id ? "Product updated successfully!" : "Product created successfully!");
        
        // Redirect after success
        setTimeout(() => {
          navigate("/admin/products");
        }, 1500);
      }, 1500);

      // Actual API call would be:
      // if (id) {
      //   await axios.put(`/api/admin/products/${id}`, product);
      // } else {
      //   await axios.post('/api/admin/products', product);
      // }
      
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.message || "Failed to save product");
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
      </div>
    );
  }

  return (
    <div className="product-add-edit">
      <div className="page-header">
        <h1>{id ? "Edit Product" : "Add New Product"}</h1>
        <p>{id ? "Update existing product details" : "Create a new product for your store"}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
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
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-section full-width">
            <h3>Product Images</h3>
            <p className="form-help">Upload up to 5 images. First image will be the main display image.</p>
            
            <div className="image-upload-section">
              <div className="image-upload-box">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="image-input"
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