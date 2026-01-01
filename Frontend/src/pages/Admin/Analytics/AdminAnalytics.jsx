// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../../context/AuthContext";
// import "./AdminAnalytics.css";

// // Get Recharts from window object (loaded via CDN in index.html)
// const {
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   AreaChart, Area
// } = window.Recharts || {};

// const AdminAnalytics = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [timeRange, setTimeRange] = useState("monthly");
//   const [activeTab, setActiveTab] = useState("overview");
//   const [rechartsLoaded, setRechartsLoaded] = useState(false);

//   // Check if Recharts is loaded from CDN
//   useEffect(() => {
//     const checkRecharts = () => {
//       if (window.Recharts) {
//         setRechartsLoaded(true);
//       }
//     };

//     // Initial check
//     checkRecharts();

//     // Set interval to check if Recharts loads
//     const interval = setInterval(checkRecharts, 500);

//     // Timeout after 5 seconds
//     const timeout = setTimeout(() => {
//       clearInterval(interval);
//       if (!window.Recharts) {
//         console.warn("Recharts library not loaded. Using simplified view.");
//         setRechartsLoaded(false);
//       }
//     }, 5000);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(timeout);
//     };
//   }, []);

//   // Sales Data
//   const [salesData, setSalesData] = useState([]);
//   const [revenueData, setRevenueData] = useState([]);
//   const [topProducts, setTopProducts] = useState([]);
//   const [customerData, setCustomerData] = useState([]);
//   const [trafficData, setTrafficData] = useState([]);

//   useEffect(() => {
//     if (user?.role !== "admin") {
//       navigate("/login");
//       return;
//     }
    
//     // Generate demo analytics data
//     setTimeout(() => {
//       generateAnalyticsData();
//       setLoading(false);
//     }, 1000);
//   }, [user, navigate, timeRange]);

//   const generateAnalyticsData = () => {
//     // Sales Over Time Data
//     const generateSalesData = () => {
//       if (timeRange === "daily") {
//         return Array.from({ length: 7 }, (_, i) => ({
//           name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
//           sales: Math.floor(Math.random() * 200) + 100,
//           revenue: Math.floor(Math.random() * 50000) + 20000,
//           visitors: Math.floor(Math.random() * 1000) + 500
//         }));
//       } else if (timeRange === "weekly") {
//         return Array.from({ length: 4 }, (_, i) => ({
//           name: `Week ${i + 1}`,
//           sales: Math.floor(Math.random() * 500) + 300,
//           revenue: Math.floor(Math.random() * 120000) + 80000,
//           visitors: Math.floor(Math.random() * 3000) + 1500
//         }));
//       } else {
//         return Array.from({ length: 12 }, (_, i) => ({
//           name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
//           sales: Math.floor(Math.random() * 1000) + 500,
//           revenue: Math.floor(Math.random() * 300000) + 150000,
//           visitors: Math.floor(Math.random() * 5000) + 2500
//         }));
//       }
//     };

//     // Revenue Data
//     const generateRevenueData = () => {
//       const categories = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"];
//       return categories.map((category, i) => ({
//         name: category,
//         revenue: Math.floor(Math.random() * 500000) + 100000,
//         growth: (Math.random() * 30 + 5).toFixed(1)
//       }));
//     };

//     // Top Products Data
//     const generateTopProducts = () => {
//       const products = [
//         "iPhone 15 Pro", "MacBook Air", "AirPods Pro", "iPad Pro",
//         "Apple Watch", "Samsung S24", "Sony Headphones", "Gaming Laptop"
//       ];
//       return products.map((product, i) => ({
//         name: product,
//         sales: Math.floor(Math.random() * 1000) + 200,
//         revenue: Math.floor(Math.random() * 500000) + 100000,
//         stock: Math.floor(Math.random() * 100) + 20
//       })).slice(0, 8);
//     };

//     // Customer Data
//     const generateCustomerData = () => {
//       return [
//         { name: 'New', value: 35, color: '#3b82f6' },
//         { name: 'Returning', value: 45, color: '#10b981' },
//         { name: 'Inactive', value: 15, color: '#f59e0b' },
//         { name: 'Lost', value: 5, color: '#ef4444' }
//       ];
//     };

//     // Traffic Data
//     const generateTrafficData = () => {
//       return [
//         { source: 'Direct', visitors: 1250, percent: 35, color: '#3b82f6' },
//         { source: 'Organic', visitors: 980, percent: 28, color: '#10b981' },
//         { source: 'Social', visitors: 750, percent: 22, color: '#8b5cf6' },
//         { source: 'Email', visitors: 420, percent: 12, color: '#f59e0b' },
//         { source: 'Referral', visitors: 180, percent: 5, color: '#ef4444' }
//       ];
//     };

//     setSalesData(generateSalesData());
//     setRevenueData(generateRevenueData());
//     setTopProducts(generateTopProducts());
//     setCustomerData(generateCustomerData());
//     setTrafficData(generateTrafficData());
//   };

//   // Calculate statistics
//   const calculateStats = () => {
//     const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
//     const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
//     const totalVisitors = salesData.reduce((sum, item) => sum + item.visitors, 0);
//     const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
//     const currentPeriod = salesData[salesData.length - 1]?.revenue || 0;
//     const previousPeriod = salesData[salesData.length - 2]?.revenue || currentPeriod;
//     const growthRate = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;

//     return {
//       totalRevenue,
//       totalSales,
//       totalVisitors,
//       avgOrderValue,
//       growthRate
//     };
//   };

//   const stats = calculateStats();

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-BD', {
//       style: 'currency',
//       currency: 'BDT',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   // Simple chart components as fallback
//   const SimpleBarChart = ({ data, height = 200, color = "#3b82f6", title = "" }) => {
//     const maxValue = Math.max(...data.map(item => item.value));
    
//     return (
//       <div className="simple-chart-container" style={{ height: `${height}px` }}>
//         {title && <h4 className="simple-chart-title">{title}</h4>}
//         <div className="simple-bars">
//           {data.map((item, index) => (
//             <div key={index} className="simple-bar-wrapper">
//               <div 
//                 className="simple-bar"
//                 style={{
//                   height: `${(item.value / maxValue) * 80}%`,
//                   backgroundColor: color,
//                   width: '40px'
//                 }}
//                 title={`${item.name || item.label}: ${item.value}`}
//               >
//                 <span className="simple-bar-value">{item.value}</span>
//               </div>
//               <div className="simple-bar-label">{item.name || item.label}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   const SimplePieChart = ({ data, size = 200, title = "" }) => {
//     const total = data.reduce((sum, item) => sum + item.value, 0);
    
//     return (
//       <div className="simple-chart-container" style={{ width: `${size}px`, height: `${size}px` }}>
//         {title && <h4 className="simple-chart-title">{title}</h4>}
//         <div className="simple-pie">
//           {data.map((item, index, arr) => {
//             const percentage = (item.value / total) * 100;
//             const startAngle = arr.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 360, 0);
//             const endAngle = startAngle + (item.value / total) * 360;
            
//             return (
//               <div
//                 key={index}
//                 className="simple-pie-slice"
//                 style={{
//                   backgroundColor: item.color,
//                   transform: `rotate(${startAngle}deg)`,
//                   clipPath: `conic-gradient(transparent 0deg, ${item.color} ${startAngle}deg, ${item.color} ${endAngle}deg, transparent ${endAngle}deg)`
//                 }}
//               />
//             );
//           })}
//         </div>
//         <div className="simple-legend">
//           {data.map((item, index) => (
//             <div key={index} className="simple-legend-item">
//               <span 
//                 className="simple-legend-color" 
//                 style={{ backgroundColor: item.color }}
//               />
//               <span className="simple-legend-label">
//                 {item.name}: {Math.round((item.value / total) * 100)}%
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="admin-analytics-loading">
//         <div className="spinner"></div>
//         <p>Loading analytics...</p>
//       </div>
//     );
//   }

//   // Render fallback if Recharts is not loaded
//   if (!rechartsLoaded) {
//     return (
//       <div className="admin-analytics">
//         <div className="analytics-header">
//           <div>
//             <h1>Analytics Dashboard</h1>
//             <p>Track your store performance and insights</p>
//           </div>
//           <div className="time-range-selector">
//             <button 
//               className={`time-btn ${timeRange === 'daily' ? 'active' : ''}`}
//               onClick={() => setTimeRange('daily')}
//             >
//               Daily
//             </button>
//             <button 
//               className={`time-btn ${timeRange === 'weekly' ? 'active' : ''}`}
//               onClick={() => setTimeRange('weekly')}
//             >
//               Weekly
//             </button>
//             <button 
//               className={`time-btn ${timeRange === 'monthly' ? 'active' : ''}`}
//               onClick={() => setTimeRange('monthly')}
//             >
//               Monthly
//             </button>
//             <button className="export-btn">
//               <span className="btn-icon">📥</span>
//               Export Report
//             </button>
//           </div>
//         </div>

//         {/* Analytics Tabs */}
//         <div className="analytics-tabs">
//           <button 
//             className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
//             onClick={() => setActiveTab('overview')}
//           >
//             📊 Overview
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
//             onClick={() => setActiveTab('sales')}
//           >
//             💰 Sales
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
//             onClick={() => setActiveTab('customers')}
//           >
//             👥 Customers
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
//             onClick={() => setActiveTab('products')}
//           >
//             🛍️ Products
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'traffic' ? 'active' : ''}`}
//             onClick={() => setActiveTab('traffic')}
//           >
//             📈 Traffic
//           </button>
//         </div>

//         {/* Key Metrics */}
//         <div className="key-metrics">
//           <div className="metric-card">
//             <div className="metric-header">
//               <div className="metric-icon revenue">💰</div>
//               <span className={`metric-change ${stats.growthRate >= 0 ? 'positive' : 'negative'}`}>
//                 {stats.growthRate >= 0 ? '↗' : '↘'} {Math.abs(stats.growthRate).toFixed(1)}%
//               </span>
//             </div>
//             <div className="metric-body">
//               <h3>{formatCurrency(stats.totalRevenue)}</h3>
//               <p>Total Revenue</p>
//             </div>
//             <div className="metric-footer">
//               <span>Previous: {formatCurrency(stats.totalRevenue * 0.92)}</span>
//             </div>
//           </div>

//           <div className="metric-card">
//             <div className="metric-header">
//               <div className="metric-icon sales">🛒</div>
//               <span className="metric-change positive">↗ 8.2%</span>
//             </div>
//             <div className="metric-body">
//               <h3>{stats.totalSales.toLocaleString()}</h3>
//               <p>Total Orders</p>
//             </div>
//             <div className="metric-footer">
//               <span>Avg: {Math.round(stats.totalSales / salesData.length)}/day</span>
//             </div>
//           </div>

//           <div className="metric-card">
//             <div className="metric-header">
//               <div className="metric-icon customers">👥</div>
//               <span className="metric-change positive">↗ 12.5%</span>
//             </div>
//             <div className="metric-body">
//               <h3>{stats.totalVisitors.toLocaleString()}</h3>
//               <p>Total Visitors</p>
//             </div>
//             <div className="metric-footer">
//               <span>Conversion: {((stats.totalSales / stats.totalVisitors) * 100).toFixed(1)}%</span>
//             </div>
//           </div>

//           <div className="metric-card">
//             <div className="metric-header">
//               <div className="metric-icon avg-order">📦</div>
//               <span className="metric-change positive">↗ 5.3%</span>
//             </div>
//             <div className="metric-body">
//               <h3>{formatCurrency(stats.avgOrderValue)}</h3>
//               <p>Avg. Order Value</p>
//             </div>
//             <div className="metric-footer">
//               <span>Highest: {formatCurrency(stats.avgOrderValue * 1.5)}</span>
//             </div>
//           </div>
//         </div>

//         {/* Simple Charts Fallback */}
//         <div className="charts-grid">
//           {/* Sales Trend Chart */}
//           <div className="chart-card full-width">
//             <div className="chart-header">
//               <h3>Sales Trend (Simple View)</h3>
//             </div>
//             <div className="chart-container">
//               <SimpleBarChart 
//                 data={salesData.map(item => ({
//                   name: item.name,
//                   value: item.sales
//                 }))}
//                 height={250}
//                 color="#3b82f6"
//               />
//             </div>
//           </div>

//           {/* Revenue by Category */}
//           <div className="chart-card">
//             <div className="chart-header">
//               <h3>Revenue by Category</h3>
//             </div>
//             <div className="chart-container">
//               <SimpleBarChart 
//                 data={revenueData.map(item => ({
//                   name: item.name,
//                   value: item.revenue / 1000
//                 }))}
//                 height={250}
//                 color="#8b5cf6"
//               />
//             </div>
//           </div>

//           {/* Customer Distribution */}
//           <div className="chart-card">
//             <div className="chart-header">
//               <h3>Customer Distribution</h3>
//             </div>
//             <div className="chart-container">
//               <SimplePieChart 
//                 data={customerData}
//                 size={250}
//               />
//             </div>
//           </div>

//           {/* Top Products */}
//           <div className="chart-card full-width">
//             <div className="chart-header">
//               <h3>Top Performing Products</h3>
//             </div>
//             <div className="products-table-container">
//               <table className="products-table">
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>Sales</th>
//                     <th>Revenue</th>
//                     <th>Stock</th>
//                     <th>Performance</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {topProducts.map((product, index) => (
//                     <tr key={index}>
//                       <td>
//                         <div className="product-info">
//                           <div className="product-rank">{index + 1}</div>
//                           <span className="product-name">{product.name}</span>
//                         </div>
//                       </td>
//                       <td className="sales-cell">{product.sales}</td>
//                       <td className="revenue-cell">{formatCurrency(product.revenue)}</td>
//                       <td>
//                         <div className="stock-indicator">
//                           <div className="stock-bar">
//                             <div 
//                               className="stock-fill"
//                               style={{
//                                 width: `${(product.stock / 150) * 100}%`,
//                                 backgroundColor: product.stock < 30 ? '#ef4444' : product.stock < 50 ? '#f59e0b' : '#10b981'
//                               }}
//                             ></div>
//                           </div>
//                           <span className="stock-value">{product.stock}</span>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="performance-indicator">
//                           <div className="performance-bar">
//                             <div 
//                               className="performance-fill"
//                               style={{
//                                 width: `${(product.sales / 1200) * 100}%`,
//                                 backgroundColor: product.sales > 800 ? '#10b981' : product.sales > 500 ? '#3b82f6' : '#f59e0b'
//                               }}
//                             ></div>
//                           </div>
//                           <span className="performance-value">
//                             {((product.sales / 1200) * 100).toFixed(1)}%
//                           </span>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Performance Summary */}
//         <div className="performance-summary">
//           <div className="summary-card">
//             <h3>Performance Summary</h3>
//             <div className="summary-stats">
//               <div className="summary-item">
//                 <span className="label">Best Selling Product</span>
//                 <span className="value">{topProducts[0]?.name || 'iPhone 15 Pro'}</span>
//               </div>
//               <div className="summary-item">
//                 <span className="label">Peak Sales Day</span>
//                 <span className="value">Friday</span>
//               </div>
//               <div className="summary-item">
//                 <span className="label">Customer Satisfaction</span>
//                 <span className="value positive">94.2%</span>
//               </div>
//               <div className="summary-item">
//                 <span className="label">Return Rate</span>
//                 <span className="value warning">3.8%</span>
//               </div>
//               <div className="summary-item">
//                 <span className="label">Cart Abandonment</span>
//                 <span className="value negative">18.5%</span>
//               </div>
//               <div className="summary-item">
//                 <span className="label">Avg. Response Time</span>
//                 <span className="value">2.4 hours</span>
//               </div>
//             </div>
//           </div>

//           <div className="summary-card">
//             <h3>Recent Activities</h3>
//             <div className="activity-list">
//               <div className="activity-item">
//                 <div className="activity-icon success">✅</div>
//                 <div className="activity-content">
//                   <p><strong>Order #ORD-1234</strong> was delivered successfully</p>
//                   <small>2 hours ago</small>
//                 </div>
//               </div>
//               <div className="activity-item">
//                 <div className="activity-icon warning">⚠️</div>
//                 <div className="activity-content">
//                   <p><strong>Low stock</strong> alert for AirPods Pro</p>
//                   <small>5 hours ago</small>
//                 </div>
//               </div>
//               <div className="activity-item">
//                 <div className="activity-icon info">📈</div>
//                 <div className="activity-content">
//                   <p>Sales increased by <strong>15%</strong> this week</p>
//                   <small>1 day ago</small>
//                 </div>
//               </div>
//               <div className="activity-item">
//                 <div className="activity-icon success">👤</div>
//                 <div className="activity-content">
//                   <p><strong>25 new users</strong> registered today</p>
//                   <small>2 days ago</small>
//                 </div>
//               </div>
//               <div className="activity-item">
//                 <div className="activity-icon warning">💰</div>
//                 <div className="activity-content">
//                   <p><strong>Payment failed</strong> for Order #ORD-1230</p>
//                   <small>3 days ago</small>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Insights & Recommendations */}
//         <div className="insights-section">
//           <h3>💡 Insights & Recommendations</h3>
//           <div className="insights-grid">
//             <div className="insight-card">
//               <div className="insight-icon">🚀</div>
//               <h4>Boost Sales</h4>
//               <p>Consider running a weekend flash sale to increase revenue by 20%</p>
//             </div>
//             <div className="insight-card">
//               <div className="insight-icon">📦</div>
//               <h4>Restock Alert</h4>
//               <p>iPhone 15 Pro stock is below 30%. Consider restocking soon.</p>
//             </div>
//             <div className="insight-card">
//               <div className="insight-icon">👥</div>
//               <h4>Customer Retention</h4>
//               <p>Implement a loyalty program to increase returning customers.</p>
//             </div>
//             <div className="insight-card">
//               <div className="insight-icon">📱</div>
//               <h4>Mobile Optimization</h4>
//               <p>45% of traffic is mobile. Optimize mobile experience for better conversion.</p>
//             </div>
//           </div>
//         </div>

//         <div className="cdn-notice">
//           <p>📊 <strong>Note:</strong> Using simple charts. For advanced charts, ensure Recharts CDN is loaded.</p>
//         </div>
//       </div>
//     );
//   }

//   // Render with Recharts if loaded
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="custom-tooltip">
//           <p className="label">{label}</p>
//           {payload.map((entry, index) => (
//             <p key={index} style={{ color: entry.color }}>
//               {entry.name}: {entry.name === 'revenue' ? formatCurrency(entry.value) : entry.value}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="admin-analytics">
//       <div className="analytics-header">
//         <div>
//           <h1>Analytics Dashboard</h1>
//           <p>Track your store performance and insights</p>
//         </div>
//         <div className="time-range-selector">
//           <button 
//             className={`time-btn ${timeRange === 'daily' ? 'active' : ''}`}
//             onClick={() => setTimeRange('daily')}
//           >
//             Daily
//           </button>
//           <button 
//             className={`time-btn ${timeRange === 'weekly' ? 'active' : ''}`}
//             onClick={() => setTimeRange('weekly')}
//           >
//             Weekly
//           </button>
//           <button 
//             className={`time-btn ${timeRange === 'monthly' ? 'active' : ''}`}
//             onClick={() => setTimeRange('monthly')}
//           >
//             Monthly
//           </button>
//           <button className="export-btn">
//             <span className="btn-icon">📥</span>
//             Export Report
//           </button>
//         </div>
//       </div>

//       {/* Analytics Tabs */}
//       <div className="analytics-tabs">
//         <button 
//           className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
//           onClick={() => setActiveTab('overview')}
//         >
//           📊 Overview
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
//           onClick={() => setActiveTab('sales')}
//         >
//           💰 Sales
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
//           onClick={() => setActiveTab('customers')}
//         >
//           👥 Customers
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
//           onClick={() => setActiveTab('products')}
//         >
//           🛍️ Products
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'traffic' ? 'active' : ''}`}
//           onClick={() => setActiveTab('traffic')}
//         >
//           📈 Traffic
//         </button>
//       </div>

//       {/* Key Metrics */}
//       <div className="key-metrics">
//         <div className="metric-card">
//           <div className="metric-header">
//             <div className="metric-icon revenue">💰</div>
//             <span className={`metric-change ${stats.growthRate >= 0 ? 'positive' : 'negative'}`}>
//               {stats.growthRate >= 0 ? '↗' : '↘'} {Math.abs(stats.growthRate).toFixed(1)}%
//             </span>
//           </div>
//           <div className="metric-body">
//             <h3>{formatCurrency(stats.totalRevenue)}</h3>
//             <p>Total Revenue</p>
//           </div>
//           <div className="metric-footer">
//             <span>Previous: {formatCurrency(stats.totalRevenue * 0.92)}</span>
//           </div>
//         </div>

//         <div className="metric-card">
//           <div className="metric-header">
//             <div className="metric-icon sales">🛒</div>
//             <span className="metric-change positive">↗ 8.2%</span>
//           </div>
//           <div className="metric-body">
//             <h3>{stats.totalSales.toLocaleString()}</h3>
//             <p>Total Orders</p>
//           </div>
//           <div className="metric-footer">
//             <span>Avg: {Math.round(stats.totalSales / salesData.length)}/day</span>
//           </div>
//         </div>

//         <div className="metric-card">
//           <div className="metric-header">
//             <div className="metric-icon customers">👥</div>
//             <span className="metric-change positive">↗ 12.5%</span>
//           </div>
//           <div className="metric-body">
//             <h3>{stats.totalVisitors.toLocaleString()}</h3>
//             <p>Total Visitors</p>
//           </div>
//           <div className="metric-footer">
//             <span>Conversion: {((stats.totalSales / stats.totalVisitors) * 100).toFixed(1)}%</span>
//           </div>
//         </div>

//         <div className="metric-card">
//           <div className="metric-header">
//             <div className="metric-icon avg-order">📦</div>
//             <span className="metric-change positive">↗ 5.3%</span>
//           </div>
//           <div className="metric-body">
//             <h3>{formatCurrency(stats.avgOrderValue)}</h3>
//             <p>Avg. Order Value</p>
//           </div>
//           <div className="metric-footer">
//             <span>Highest: {formatCurrency(stats.avgOrderValue * 1.5)}</span>
//           </div>
//         </div>
//       </div>

//       {/* Main Charts - Using Recharts */}
//       <div className="charts-grid">
//         {/* Sales Trend Chart */}
//         <div className="chart-card full-width">
//           <div className="chart-header">
//             <h3>Sales & Revenue Trend</h3>
//             <div className="chart-legend">
//               <span className="legend-item sales">● Sales</span>
//               <span className="legend-item revenue">● Revenue</span>
//             </div>
//           </div>
//           <div className="chart-container">
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={salesData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                 <XAxis 
//                   dataKey="name" 
//                   stroke="#64748b" 
//                   fontSize={12}
//                 />
//                 <YAxis 
//                   stroke="#64748b" 
//                   fontSize={12}
//                   tickFormatter={(value) => value.toLocaleString()}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="sales" 
//                   stroke="#3b82f6" 
//                   strokeWidth={2}
//                   dot={{ r: 4 }}
//                   activeDot={{ r: 6 }}
//                   name="Sales"
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="revenue" 
//                   stroke="#10b981" 
//                   strokeWidth={2}
//                   dot={{ r: 4 }}
//                   activeDot={{ r: 6 }}
//                   name="Revenue"
//                   yAxisId="right"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Revenue by Category */}
//         <div className="chart-card">
//           <div className="chart-header">
//             <h3>Revenue by Category</h3>
//           </div>
//           <div className="chart-container">
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={revenueData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                 <XAxis 
//                   dataKey="name" 
//                   stroke="#64748b" 
//                   fontSize={11}
//                   angle={-45}
//                   textAnchor="end"
//                   height={60}
//                 />
//                 <YAxis 
//                   stroke="#64748b" 
//                   fontSize={12}
//                   tickFormatter={(value) => formatCurrency(value).replace('BDT', '')}
//                 />
//                 <Tooltip 
//                   formatter={(value) => [formatCurrency(value), 'Revenue']}
//                 />
//                 <Bar 
//                   dataKey="revenue" 
//                   fill="#8b5cf6" 
//                   radius={[4, 4, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Customer Distribution */}
//         <div className="chart-card">
//           <div className="chart-header">
//             <h3>Customer Distribution</h3>
//           </div>
//           <div className="chart-container">
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie
//                   data={customerData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {customerData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Top Products */}
//         <div className="chart-card full-width">
//           <div className="chart-header">
//             <h3>Top Performing Products</h3>
//           </div>
//           <div className="products-table-container">
//             <table className="products-table">
//               <thead>
//                 <tr>
//                   <th>Product</th>
//                   <th>Sales</th>
//                   <th>Revenue</th>
//                   <th>Stock</th>
//                   <th>Performance</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {topProducts.map((product, index) => (
//                   <tr key={index}>
//                     <td>
//                       <div className="product-info">
//                         <div className="product-rank">{index + 1}</div>
//                         <span className="product-name">{product.name}</span>
//                       </div>
//                     </td>
//                     <td className="sales-cell">{product.sales}</td>
//                     <td className="revenue-cell">{formatCurrency(product.revenue)}</td>
//                     <td>
//                       <div className="stock-indicator">
//                         <div className="stock-bar">
//                           <div 
//                             className="stock-fill"
//                             style={{
//                               width: `${(product.stock / 150) * 100}%`,
//                               backgroundColor: product.stock < 30 ? '#ef4444' : product.stock < 50 ? '#f59e0b' : '#10b981'
//                             }}
//                           ></div>
//                         </div>
//                         <span className="stock-value">{product.stock}</span>
//                       </div>
//                     </td>
//                     <td>
//                       <div className="performance-indicator">
//                         <div className="performance-bar">
//                           <div 
//                             className="performance-fill"
//                             style={{
//                               width: `${(product.sales / 1200) * 100}%`,
//                               backgroundColor: product.sales > 800 ? '#10b981' : product.sales > 500 ? '#3b82f6' : '#f59e0b'
//                             }}
//                           ></div>
//                         </div>
//                         <span className="performance-value">
//                           {((product.sales / 1200) * 100).toFixed(1)}%
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Traffic Sources */}
//         <div className="chart-card">
//           <div className="chart-header">
//             <h3>Traffic Sources</h3>
//           </div>
//           <div className="chart-container">
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie
//                   data={trafficData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ source, percent }) => `${source}: ${percent}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="percent"
//                 >
//                   {trafficData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value, name) => [`${value}%`, name]} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Visitor Growth */}
//         <div className="chart-card">
//           <div className="chart-header">
//             <h3>Visitor Growth</h3>
//           </div>
//           <div className="chart-container">
//             <ResponsiveContainer width="100%" height={250}>
//               <AreaChart data={salesData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                 <XAxis 
//                   data


                  import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminAnalytics.css";

// Get Recharts from window object (loaded from CDN)
const {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} = window.Recharts || {};

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");
  const [activeTab, setActiveTab] = useState("overview");
  const [rechartsLoaded, setRechartsLoaded] = useState(false);

  // Check if Recharts is loaded from CDN
  useEffect(() => {
    const checkRecharts = () => {
      if (window.Recharts) {
        setRechartsLoaded(true);
      }
    };

    // Check immediately
    checkRecharts();

    // If not loaded, check every 500ms for 5 seconds
    const interval = setInterval(() => {
      checkRecharts();
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.Recharts) {
        console.warn("Recharts not loaded. Using fallback UI.");
        setRechartsLoaded(false);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
      return;
    }
    
    // Generate demo analytics data
    setTimeout(() => {
      generateAnalyticsData();
      setLoading(false);
    }, 1000);
  }, [user, navigate, timeRange]);

  const generateAnalyticsData = () => {
    // Sales Over Time Data
    const generateSalesData = () => {
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

    // Revenue Data
    const generateRevenueData = () => {
      const categories = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"];
      return categories.map((category, i) => ({
        name: category,
        revenue: Math.floor(Math.random() * 500000) + 100000,
        growth: (Math.random() * 30 + 5).toFixed(1)
      }));
    };

    // Top Products Data
    const generateTopProducts = () => {
      const products = [
        "iPhone 15 Pro", "MacBook Air", "AirPods Pro", "iPad Pro",
        "Apple Watch", "Samsung S24", "Sony Headphones", "Gaming Laptop"
      ];
      return products.map((product, i) => ({
        name: product,
        sales: Math.floor(Math.random() * 1000) + 200,
        revenue: Math.floor(Math.random() * 500000) + 100000,
        stock: Math.floor(Math.random() * 100) + 20
      })).slice(0, 8);
    };

    // Customer Data
    const generateCustomerData = () => {
      return [
        { name: 'New', value: 35, color: '#3b82f6' },
        { name: 'Returning', value: 45, color: '#10b981' },
        { name: 'Inactive', value: 15, color: '#f59e0b' },
        { name: 'Lost', value: 5, color: '#ef4444' }
      ];
    };

    // Traffic Data
    const generateTrafficData = () => {
      return [
        { source: 'Direct', visitors: 1250, percent: 35, color: '#3b82f6' },
        { source: 'Organic', visitors: 980, percent: 28, color: '#10b981' },
        { source: 'Social', visitors: 750, percent: 22, color: '#8b5cf6' },
        { source: 'Email', visitors: 420, percent: 12, color: '#f59e0b' },
        { source: 'Referral', visitors: 180, percent: 5, color: '#ef4444' }
      ];
    };

    setSalesData(generateSalesData());
    setRevenueData(generateRevenueData());
    setTopProducts(generateTopProducts());
    setCustomerData(generateCustomerData());
    setTrafficData(generateTrafficData());
  };

  // Sales Data
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);

  // Calculate statistics
  const calculateStats = () => {
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
    const totalVisitors = salesData.reduce((sum, item) => sum + item.visitors, 0);
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    const currentPeriod = salesData[salesData.length - 1]?.revenue || 0;
    const previousPeriod = salesData[salesData.length - 2]?.revenue || currentPeriod;
    const growthRate = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;

    return {
      totalRevenue,
      totalSales,
      totalVisitors,
      avgOrderValue,
      growthRate
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'revenue' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Fallback UI if Recharts is not loaded
  const renderFallbackCharts = () => (
    <div className="charts-fallback">
      <h3>📊 Simple Analytics View</h3>
      <p>Charts library is loading. Here are your key metrics in table format:</p>
      
      <div className="simple-metrics-grid">
        <div className="simple-metric-card">
          <h4>Sales Trend</h4>
          <div className="simple-table">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Visitors</th>
                </tr>
              </thead>
              <tbody>
                {salesData.slice(0, 5).map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.sales}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                    <td>{item.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="simple-metric-card">
          <h4>Revenue by Category</h4>
          <div className="simple-bars">
            {revenueData.map((item, index) => (
              <div key={index} className="bar-item">
                <div className="bar-label">{item.name}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{
                      width: `${(item.revenue / 500000) * 100}%`,
                      backgroundColor: '#8b5cf6'
                    }}
                  ></div>
                </div>
                <div className="bar-value">{formatCurrency(item.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  // If Recharts is not loaded, show fallback
  if (!rechartsLoaded) {
    return (
      <div className="admin-analytics">
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
            <button className="export-btn">
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

        {/* Key Metrics - These still work without Recharts */}
        <div className="key-metrics">
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-icon revenue">💰</div>
              <span className={`metric-change ${stats.growthRate >= 0 ? 'positive' : 'negative'}`}>
                {stats.growthRate >= 0 ? '↗' : '↘'} {Math.abs(stats.growthRate).toFixed(1)}%
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

        {/* Show fallback charts */}
        {renderFallbackCharts()}

        {/* Top Products Table - This still works without Recharts */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Top Performing Products</h3>
          </div>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
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
                    <td>
                      <div className="product-info">
                        <div className="product-rank">{index + 1}</div>
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

        {/* Performance Summary - This still works without Recharts */}
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
              <div className="activity-item">
                <div className="activity-icon success">✅</div>
                <div className="activity-content">
                  <p><strong>Order #ORD-1234</strong> was delivered successfully</p>
                  <small>2 hours ago</small>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon warning">⚠️</div>
                <div className="activity-content">
                  <p><strong>Low stock</strong> alert for AirPods Pro</p>
                  <small>5 hours ago</small>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon info">📈</div>
                <div className="activity-content">
                  <p>Sales increased by <strong>15%</strong> this week</p>
                  <small>1 day ago</small>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon success">👤</div>
                <div className="activity-content">
                  <p><strong>25 new users</strong> registered today</p>
                  <small>2 days ago</small>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon warning">💰</div>
                <div className="activity-content">
                  <p><strong>Payment failed</strong> for Order #ORD-1230</p>
                  <small>3 days ago</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Recommendations - This still works without Recharts */}
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
  }

  // If Recharts is loaded, show the full charts
  return (
    <div className="admin-analytics">
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
          <button className="export-btn">
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
              {stats.growthRate >= 0 ? '↗' : '↘'} {Math.abs(stats.growthRate).toFixed(1)}%
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

      {/* Main Charts - Only shown if Recharts is loaded */}
      <div className="charts-grid">
        {/* Sales Trend Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Sales & Revenue Trend</h3>
            <div className="chart-legend">
              <span className="legend-item sales">● Sales</span>
              <span className="legend-item revenue">● Revenue</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Sales"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue by Category</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value).replace('BDT', '')}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Customer Distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={customerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Top Performing Products</h3>
          </div>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
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
                    <td>
                      <div className="product-info">
                        <div className="product-rank">{index + 1}</div>
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

        {/* Traffic Sources */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Traffic Sources</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ source, percent }) => `${source}: ${percent}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percent"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitor Growth */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Visitor Growth</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Visitors']} />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#f59e0b" 
                  fill="#fef3c7"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
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
            <div className="activity-item">
              <div className="activity-icon success">✅</div>
              <div className="activity-content">
                <p><strong>Order #ORD-1234</strong> was delivered successfully</p>
                <small>2 hours ago</small>
              </div>