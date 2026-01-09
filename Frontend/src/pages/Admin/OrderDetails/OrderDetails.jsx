// Frontend/src/pages/Admin/OrderDetails/OrderDetails.jsx 
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchOrderDetails();
  }, [id, currentUser, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      
      // Try admin endpoint first
      const response = await fetch(`http://localhost:5000/api/orders/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If admin endpoint fails, try regular endpoint
      if (response.status === 404 || response.status === 403) {
        console.log("Trying regular order endpoint...");
        const regularResponse = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!regularResponse.ok) {
          const errorData = await regularResponse.json();
          throw new Error(errorData.message || `Failed to fetch order: HTTP ${regularResponse.status}`);
        }

        const regularData = await regularResponse.json();
        
        if (regularData.success) {
          setOrder(regularData.data);
        } else {
          throw new Error(regularData.message);
        }
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch order: HTTP ${response.status}`);
      } else {
        const data = await response.json();
        
        if (data.success) {
          setOrder(data.data);
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(error.message);
      
      // Load demo data for development
      if (process.env.NODE_ENV === 'development') {
        console.log("Loading demo data...");
        setOrder({
          _id: id,
          orderItems: [
            {
              product: "demo_product_1",
              name: "iPhone 14 Pro",
              quantity: 1,
              price: 52498.95,
              image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=150&h=150&fit=crop"
            }
          ],
          user: {
            _id: "demo_user_1",
            name: "John Doe",
            email: "john@example.com",
            phone: "+880 1234567890"
          },
          shippingAddress: {
            street: "123 Main Street",
            city: "Dhaka",
            state: "Dhaka",
            zipCode: "1205",
            country: "Bangladesh",
            phone: "+880 1234567890"
          },
          payment: {
            method: "cod",
            status: "pending"
          },
          itemsPrice: 52498.95,
          shippingPrice: 0,
          taxPrice: 2624.95,
          totalPrice: 55123.90,
          orderStatus: "confirmed",
          isPaid: false,
          isDelivered: false,
          createdAt: new Date().toISOString(),
          notes: "Test order for demonstration"
        });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "৳0";
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'processing': return '#8b5cf6';
      case 'shipped': return '#10b981';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleBack = () => {
    navigate("/admin/orders");
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      let endpoint = "";
      let method = "PUT";
      
      if (newStatus === 'paid') {
        endpoint = 'pay';
      } else if (newStatus === 'delivered') {
        endpoint = 'deliver';
      } else if (newStatus === 'cancelled') {
        endpoint = 'cancel';
      } else {
        // For other statuses
        endpoint = '';
        method = "PATCH";
      }
      
      const url = endpoint 
        ? `http://localhost:5000/api/orders/${id}/${endpoint}`
        : `http://localhost:5000/api/orders/${id}`;
      
      const body = endpoint ? {} : { orderStatus: newStatus };
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...(Object.keys(body).length > 0 && { body: JSON.stringify(body) })
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      await fetchOrderDetails();
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. You might not have permission.");
    }
  };

  if (loading) {
    return (
      <div className="order-details-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="order-details-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Order</h3>
        <p>{error}</p>
        <p className="error-subtext">
          Note: Make sure you're logged in as admin and the order exists.
        </p>
        <button onClick={handleBack} className="back-btn">
          ← Back to Orders
        </button>
        <button onClick={fetchOrderDetails} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  const orderTotal = order?.itemsPrice + order?.shippingPrice + order?.taxPrice;

  return (
    <div className="order-details-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <span className="back-icon">←</span> Back to Orders
          </button>
          <h1>Order Details</h1>
          <div className="order-id-display">
            {`ORD-${order?._id?.toString().slice(-8).toUpperCase() || 'N/A'}`}
          </div>
          {error && (
            <div className="warning-banner">
              ⚠️ Using demo data: {error}
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchOrderDetails}>
            <i className="refresh-icon">↻</i> Refresh
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <div className="summary-header">
          <div className="order-status-badge">
            <span 
              className="status-dot"
              style={{ backgroundColor: getStatusColor(order?.orderStatus) }}
            ></span>
            <span className="status-text">{order?.orderStatus || 'Unknown'}</span>
          </div>
          <div className="order-date">
            Placed on {formatDate(order?.createdAt)}
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <div className="card-label">Total Amount</div>
              <div className="card-value">{formatCurrency(orderTotal)}</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">📦</div>
            <div className="card-content">
              <div className="card-label">Items</div>
              <div className="card-value">{order?.orderItems?.length || 0}</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">💳</div>
            <div className="card-content">
              <div className="card-label">Payment</div>
              <div className="card-value">
                <span className="payment-method">
                  {order?.payment?.method?.toUpperCase() || 'COD'}
                </span>
                <span className={`payment-status ${order?.isPaid ? 'paid' : 'pending'}`}>
                  {order?.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">🚚</div>
            <div className="card-content">
              <div className="card-label">Delivery</div>
              <div className="card-value">
                {order?.isDelivered ? 'Delivered' : 'In Progress'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-grid">
        {/* Order Items */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon">🛍️</span>
              Order Items
            </h3>
          </div>
          <div className="card-body">
            <div className="items-list">
              {order?.orderItems?.map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="image-placeholder">🛍️</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4 className="item-name">{item.name}</h4>
                    <div className="item-meta">
                      <span className="item-price">{formatCurrency(item.price)}</span>
                      <span className="item-quantity">× {item.quantity}</span>
                      <span className="item-total">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                    {item.product && item.product !== 'demo_product_1' && (
                      <div className="item-actions">
                        <Link to={`/product/${item.product}`} className="view-product">
                          View Product
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon">👤</span>
              Customer Information
            </h3>
          </div>
          <div className="card-body">
            {order?.user ? (
              <div className="customer-info">
                <div className="customer-avatar">
                  {order.user.name?.charAt(0).toUpperCase() || "C"}
                </div>
                <div className="customer-details">
                  <h4 className="customer-name">{order.user.name}</h4>
                  <p className="customer-email">{order.user.email}</p>
                  {order.user.phone && (
                    <p className="customer-phone">📱 {order.user.phone}</p>
                  )}
                  {order.user._id && order.user._id !== 'demo_user_1' && (
                    <Link 
                      to={`/admin/users/${order.user._id}`}
                      className="view-profile"
                    >
                      View Profile →
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <p className="no-customer">Customer information not available</p>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon">📝</span>
              Order Details
            </h3>
          </div>
          <div className="card-body">
            <div className="details-list">
              <div className="detail-item">
                <label>Order ID</label>
                <p className="order-id-value">{order?._id || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Order Date</label>
                <p>{formatDate(order?.createdAt)}</p>
              </div>
              <div className="detail-item">
                <label>Payment Method</label>
                <p>{order?.payment?.method?.toUpperCase() || 'COD'}</p>
              </div>
              <div className="detail-item">
                <label>Payment Status</label>
                <p className={`payment-status ${order?.isPaid ? 'paid' : 'pending'}`}>
                  {order?.isPaid ? 'Paid' : 'Pending'}
                </p>
              </div>
              <div className="detail-item">
                <label>Delivery Status</label>
                <p className={`delivery-status ${order?.isDelivered ? 'delivered' : 'pending'}`}>
                  {order?.isDelivered ? 'Delivered' : 'Pending'}
                </p>
              </div>
              {order?.notes && (
                <div className="detail-item">
                  <label>Order Notes</label>
                  <p className="order-notes">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon">🏠</span>
              Shipping Address
            </h3>
          </div>
          <div className="card-body">
            {order?.shippingAddress ? (
              <div className="address-card">
                <div className="address-line">
                  <strong>{order.shippingAddress.street}</strong>
                </div>
                <div className="address-line">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </div>
                <div className="address-line">
                  {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                </div>
                {order.shippingAddress.phone && (
                  <div className="address-line">
                    📱 {order.shippingAddress.phone}
                  </div>
                )}
              </div>
            ) : (
              <p className="no-address">Shipping address not provided</p>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="card-icon">💰</span>
              Price Breakdown
            </h3>
          </div>
          <div className="card-body">
            <div className="price-list">
              <div className="price-item">
                <span>Items Total</span>
                <span>{formatCurrency(order?.itemsPrice || 0)}</span>
              </div>
              <div className="price-item">
                <span>Shipping</span>
                <span>{formatCurrency(order?.shippingPrice || 0)}</span>
              </div>
              <div className="price-item">
                <span>Tax</span>
                <span>{formatCurrency(order?.taxPrice || 0)}</span>
              </div>
              <div className="price-item total">
                <strong>Total Amount</strong>
                <strong>{formatCurrency(orderTotal || 0)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        {order && order._id && order._id !== 'demo_order' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon">⚡</span>
                Order Actions
              </h3>
            </div>
            <div className="card-body">
              <div className="action-buttons">
                {!order.isPaid && order.orderStatus !== 'cancelled' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => updateOrderStatus('paid')}
                  >
                    Mark as Paid
                  </button>
                )}
                
                {!order.isDelivered && order.orderStatus !== 'cancelled' && (
                  <button 
                    className="btn btn-warning"
                    onClick={() => updateOrderStatus('shipped')}
                  >
                    Mark as Shipped
                  </button>
                )}
                
                {!order.isDelivered && order.orderStatus !== 'cancelled' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => updateOrderStatus('delivered')}
                  >
                    Mark as Delivered
                  </button>
                )}
                
                {order.orderStatus !== 'cancelled' && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this order?')) {
                        updateOrderStatus('cancelled');
                      }
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;