// ./Frontend/src/components/products/ProductList/ProductList.jsx
import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import "./ProductList.css";

const ProductList = ({
  products,
  loading = false,
  emptyMessage = "No products found",
  columns = 4,
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-product-list">
        <div className="empty-icon">📦</div>
        <h3>{emptyMessage}</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={`product-list product-list-${columns}`}>
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
