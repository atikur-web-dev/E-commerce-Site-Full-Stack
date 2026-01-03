// Frontend/src/pages/Admin/Analytics/AdminAnalytics.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminAnalytics.css";

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
      return;
    }
    
    fetchAnalyticsData();
  }, [user, navigate, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Generate demo data
      setTimeout(() => {
        const data = generateDemoAnalyticsData();
        setAnalyticsData(data);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
      setLoading(false);
    }
  };

  const generateDemoAnalyticsData = () => {
    const getSalesData = () => {
      if (timeRange === "daily") {
        return Array.from({ length: 7 }, (_, i) => ({
          name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          sales: Math.floor(Math.random() * 200) + 100,
          revenue: Math.floor(Math.random() * 50000) + 20000,
          visitors: Math.floor(Math.random() * 1000) + 500
        }));
      } else if (timeRange === "weekly") {
        return Array.from({ length: 4 }, (_, i) => ({
          name: `Week ${i + 1}`,
          sales: Math.floor(Math.random() * 500) + 300,
          revenue: Math.floor(Math.random() * 120000) + 80000,
          visitors: Math.floor(Math.random() * 3000) + 1500
        }));
      } else {
        return Array.from({ length: 12 }, (_, i) => ({
          name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
          sales: Math.floor(Math.random() * 1000) + 500,
          revenue: Math.floor(Math.random() * 300000) + 150000,
          visitors: Math.floor(Math.random() * 5000) + 2500
        }));
      }
    };

    const products = [
      "iPhone 15 Pro", "MacBook Air", "AirPods Pro", "iPad Pro",
      "Apple Watch", "Samsung S24", "Sony Headphones", "Gaming Laptop"
    ];
    
    const topProducts = products.map((product, i) => ({
      name: product,
      sales: Math.floor(Math.random() * 1000) + 200,
      revenue: Math.floor(Math.random() * 500000) + 100000,
      stock: Math.floor(Math.random() * 100) + 20
    })).slice(0, 8);

    const salesData = getSalesData();
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
    const totalVisitors = salesData.reduce((sum, item) => sum + item.visitors, 0);
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const previousRevenue = totalRevenue * 0.92;
    const growthRate = ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      salesData,
      topProducts,
      stats: {
        totalRevenue,
        totalSales,
        totalVisitors,
        avgOrderValue,
        growthRate: growthRate.toFixed(1)
      },
      customerData: [
        { name: 'New', value: 35, color: '#3b82f6' },
        { name: 'Returning', value: 45, color: '#10b981' },
        { name: 'Inactive', value: 15, color: '#f59e0b' },
        { name: 'Lost', value: 5, color: '#ef4444' }
      ],
      trafficData: [
        { source: 'Direct', visitors: 1250, percent: 35, color: '#3b82f6' },
        { source: 'Organic', visitors: 980, percent: 28, color: '#10b981' },
        { source: 'Social', visitors: 750, percent: 22, color: '#8b5cf6' },
        { source: 'Email', visitors: 420, percent: 12, color: '#f59e0b' },
        { source: 'Referral', visitors: 180, percent: 5, color: '#ef4444' }
      ]
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    alert("Export feature will be implemented soon!");
  };

  if (loading) {
    return (
      <div className="admin-analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-analytics-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Analytics</h3>
        <p>{error}</p>
        <button onClick={fetchAnalyticsData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="admin-analytics-error">
        <div className="error-icon">⚠️</div>
        <h3>No Data Available</h3>
        <p>Analytics data could not be loaded.</p>
        <button onClick={fetchAnalyticsData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const { salesData, topProducts, stats, customerData, trafficData } = analyticsData;

  return (
    <div className="admin-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Track your store performance and insights</p>
        </div>
        <div className="time-range-selector">
          <button 
            className={`time-btn ${timeRange === 'daily' ? 'active' : ''}`}
            onClick={() => setTimeRange('daily')}
          >
            Daily
          </button>
          <button 
            className={`time-btn ${timeRange === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeRange('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`time-btn ${timeRange === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeRange('monthly')}
          >
            Monthly
          </button>
          <button className="export-btn" onClick={handleExport}>
            <span className="btn-icon">📥</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          💰 Sales
        </button>
        <button 
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          👥 Customers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🛍️ Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'traffic' ? 'active' : ''}`}
          onClick={() => setActiveTab('traffic')}
        >
          📈 Traffic
        </button>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon revenue">💰</div>
            <span className={`metric-change ${stats.growthRate >= 0 ? 'positive' : 'negative'}`}>
              {stats.growthRate >= 0 ? '↗' : '↘'} {Math.abs(parseFloat(stats.growthRate)).toFixed(1)}%
            </span>
          </div>
          <div className="metric-body">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
          <div className="metric-footer">
            <span>Previous: {formatCurrency(stats.totalRevenue * 0.92)}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon sales">🛒</div>
            <span className="metric-change positive">↗ 8.2%</span>
          </div>
          <div className="metric-body">
            <h3>{stats.totalSales.toLocaleString()}</h3>
            <p>Total Orders</p>
          </div>
          <div className="metric-footer">
            <span>Avg: {Math.round(stats.totalSales / salesData.length)}/day</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon customers">👥</div>
            <span className="metric-change positive">↗ 12.5%</span>
          </div>
          <div className="metric-body">
            <h3>{stats.totalVisitors.toLocaleString()}</h3>
            <p>Total Visitors</p>
          </div>
          <div className="metric-footer">
            <span>Conversion: {((stats.totalSales / stats.totalVisitors) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon avg-order">📦</div>
            <span className="metric-change positive">↗ 5.3%</span>
          </div>
          <div className="metric-body">
            <h3>{formatCurrency(stats.avgOrderValue)}</h3>
            <p>Avg. Order Value</p>
          </div>
          <div className="metric-footer">
            <span>Highest: {formatCurrency(stats.avgOrderValue * 1.5)}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Sales Trend */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Sales & Revenue Trend</h3>
            <div className="chart-legend">
              <span className="legend-item sales">● Sales</span>
              <span className="legend-item revenue">● Revenue</span>
            </div>
          </div>
          <div className="simple-chart">
            <div className="chart-bars">
              {salesData.map((item, index) => (
                <div key={index} className="bar-container">
                  <div className="bar-group">
                    <div 
                      className="bar sales-bar"
                      style={{ height: `${(item.sales / 1200) * 100}%` }}
                      title={`Sales: ${item.sales}`}
                    ></div>
                    <div 
                      className="bar revenue-bar"
                      style={{ height: `${(item.revenue / 300000) * 100}%` }}
                      title={`Revenue: ${formatCurrency(item.revenue)}`}
                    ></div>
                  </div>
                  <div className="bar-label">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Top Performing Products</h3>
          </div>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Stock</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="rank-cell">{index + 1}</td>
                    <td>
                      <div className="product-info">
                        <span className="product-name">{product.name}</span>
                      </div>
                    </td>
                    <td className="sales-cell">{product.sales}</td>
                    <td className="revenue-cell">{formatCurrency(product.revenue)}</td>
                    <td>
                      <div className="stock-indicator">
                        <div className="stock-bar">
                          <div 
                            className="stock-fill"
                            style={{
                              width: `${(product.stock / 150) * 100}%`,
                              backgroundColor: product.stock < 30 ? '#ef4444' : product.stock < 50 ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                        <span className="stock-value">{product.stock}</span>
                      </div>
                    </td>
                    <td>
                      <div className="performance-indicator">
                        <div className="performance-bar">
                          <div 
                            className="performance-fill"
                            style={{
                              width: `${(product.sales / 1200) * 100}%`,
                              backgroundColor: product.sales > 800 ? '#10b981' : product.sales > 500 ? '#3b82f6' : '#f59e0b'
                            }}
                          ></div>
                        </div>
                        <span className="performance-value">
                          {((product.sales / 1200) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Customer Distribution</h3>
          </div>
          <div className="pie-chart-simple">
            <div className="pie-container">
              {customerData.map((item, index, array) => {
                const total = array.reduce((sum, i) => sum + i.value, 0);
                const percentage = (item.value / total) * 100;
                const angle = array.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 360, 0);
                
                return (
                  <div 
                    key={index}
                    className="pie-slice"
                    style={{
                      backgroundColor: item.color,
                      transform: `rotate(${angle}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${
                        50 + 50 * Math.cos(((percentage * 3.6) * Math.PI) / 180)
                      }% ${
                        50 - 50 * Math.sin(((percentage * 3.6) * Math.PI) / 180)
                      }%)`,
                    }}
                  ></div>
                );
              })}
            </div>
            <div className="pie-legend">
              {customerData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-label">{item.name}</span>
                  <span className="legend-value">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Traffic Sources</h3>
          </div>
          <div className="traffic-chart">
            {trafficData.map((item, index) => (
              <div key={index} className="traffic-item">
                <div className="traffic-source">
                  <span className="traffic-icon">🌐</span>
                  <span className="traffic-name">{item.source}</span>
                </div>
                <div className="traffic-bar">
                  <div 
                    className="traffic-fill"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                  <span className="traffic-percent">{item.percent}%</span>
                </div>
                <div className="traffic-visitors">{item.visitors.toLocaleString()} visitors</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="summary-card">
          <h3>Performance Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="label">Best Selling Product</span>
              <span className="value">{topProducts[0]?.name || 'iPhone 15 Pro'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Peak Sales Day</span>
              <span className="value">Friday</span>
            </div>
            <div className="summary-item">
              <span className="label">Customer Satisfaction</span>
              <span className="value positive">94.2%</span>
            </div>
            <div className="summary-item">
              <span className="label">Return Rate</span>
              <span className="value warning">3.8%</span>
            </div>
            <div className="summary-item">
              <span className="label">Cart Abandonment</span>
              <span className="value negative">18.5%</span>
            </div>
            <div className="summary-item">
              <span className="label">Avg. Response Time</span>
              <span className="value">2.4 hours</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Recent Activities</h3>
          <div className="activity-list">
            {[
              { icon: '✅', type: 'success', text: 'Order #ORD-1234 was delivered successfully', time: '2 hours ago' },
              { icon: '⚠️', type: 'warning', text: 'Low stock alert for AirPods Pro', time: '5 hours ago' },
              { icon: '📈', type: 'info', text: 'Sales increased by 15% this week', time: '1 day ago' },
              { icon: '👤', type: 'success', text: '25 new users registered today', time: '2 days ago' },
              { icon: '💰', type: 'warning', text: 'Payment failed for Order #ORD-1230', time: '3 days ago' }
            ].map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>{activity.icon}</div>
                <div className="activity-content">
                  <p>{activity.text}</p>
                  <small>{activity.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="insights-section">
        <h3>💡 Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🚀</div>
            <h4>Boost Sales</h4>
            <p>Consider running a weekend flash sale to increase revenue by 20%</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📦</div>
            <h4>Restock Alert</h4>
            <p>iPhone 15 Pro stock is below 30%. Consider restocking soon.</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">👥</div>
            <h4>Customer Retention</h4>
            <p>Implement a loyalty program to increase returning customers.</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📱</div>
            <h4>Mobile Optimization</h4>
            <p>45% of traffic is mobile. Optimize mobile experience for better conversion.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;