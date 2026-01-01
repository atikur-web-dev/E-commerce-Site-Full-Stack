import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminSettings.css";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [notifications, setNotifications] = useState({});

  // Initialize settings
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
      return;
    }

    // Load demo settings
    setTimeout(() => {
      setSettings({
        storeName: "TechShop Pro",
        storeEmail: "support@techshop.com",
        storePhone: "+880 1234 567890",
        currency: "BDT",
        timezone: "Asia/Dhaka",
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
        shippingEnabled: true,
        freeShippingThreshold: 500,
        taxRate: 5,
        storeLogo: "",
        theme: "light",
        language: "en"
      });

      setNotifications({
        emailNotifications: true,
        newOrderNotification: true,
        lowStockNotification: true,
        customerRegistrationNotification: true,
        orderStatusNotification: true,
        marketingEmails: false,
        newsletter: true,
        pushNotifications: true
      });

      setLoading(false);
    }, 500);
  }, [user, navigate]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      alert("Settings saved successfully!");
      setSaving(false);
    }, 1000);
  };

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      // Reset to initial state
      setSettings({
        storeName: "TechShop Pro",
        storeEmail: "support@techshop.com",
        storePhone: "+880 1234 567890",
        currency: "BDT",
        timezone: "Asia/Dhaka",
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
        shippingEnabled: true,
        freeShippingThreshold: 500,
        taxRate: 5,
        storeLogo: "",
        theme: "light",
        language: "en"
      });
      
      setNotifications({
        emailNotifications: true,
        newOrderNotification: true,
        lowStockNotification: true,
        customerRegistrationNotification: true,
        orderStatusNotification: true,
        marketingEmails: false,
        newsletter: true,
        pushNotifications: true
      });

      alert("Settings reset to default!");
    }
  };

  const tabs = [
    { id: "general", label: "⚙️ General", icon: "⚙️" },
    { id: "notifications", label: "🔔 Notifications", icon: "🔔" },
    { id: "shipping", label: "🚚 Shipping", icon: "🚚" },
    { id: "payment", label: "💳 Payment", icon: "💳" },
    { id: "security", label: "🔒 Security", icon: "🔒" },
    { id: "advanced", label: "⚡ Advanced", icon: "⚡" }
  ];

  if (loading) {
    return (
      <div className="admin-settings-loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your store settings and preferences</p>
        </div>
        <div className="settings-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleResetSettings}
            disabled={saving}
          >
            Reset to Default
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-small"></span>
                Saving...
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {activeTab === "general" && (
          <div className="settings-section">
            <div className="section-header">
              <h3>General Settings</h3>
              <p>Basic store information and configuration</p>
            </div>
            
            <div className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Store Name *</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => handleSettingChange('storeName', e.target.value)}
                    className="form-input"
                    placeholder="Your Store Name"
                  />
                </div>
                <div className="form-group">
                  <label>Store Email *</label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                    className="form-input"
                    placeholder="support@store.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Store Phone</label>
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                    className="form-input"
                    placeholder="+880 1234 567890"
                  />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="form-input"
                  >
                    <option value="BDT">Bangladeshi Taka (৳)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="INR">Indian Rupee (₹)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="form-input"
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="America/New_York">America/New York (GMT-5)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="form-input"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="form-input"
                  >
                    <option value="en">English</option>
                    <option value="bn">বাংলা (Bangla)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Store Logo</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleSettingChange('storeLogo', URL.createObjectURL(file));
                        }
                      }}
                      className="file-input"
                    />
                    <button className="upload-btn">
                      {settings.storeLogo ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    {settings.storeLogo && (
                      <div className="logo-preview">
                        <img src={settings.storeLogo} alt="Store Logo" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    />
                    <span>Enable Maintenance Mode</span>
                  </label>
                  <p className="form-help">
                    When enabled, only admins can access the store
                  </p>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                    />
                    <span>Allow User Registration</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Notification Settings</h3>
              <p>Configure email and notification preferences</p>
            </div>

            <div className="settings-form">
              <div className="notification-group">
                <h4>Email Notifications</h4>
                <div className="notification-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    />
                    <span>Enable Email Notifications</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notifications.newOrderNotification}
                      onChange={(e) => handleNotificationChange('newOrderNotification', e.target.checked)}
                    />
                    <span>New Order Notifications</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notifications.lowStockNotification}
                      onChange={(e) => handleNotificationChange('lowStockNotification', e.target.checked)}
                    />
                    <span>Low Stock Alerts</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notifications.customerRegistrationNotification}
                      onChange={(e) => handleNotificationChange('customerRegistrationNotification', e.target.checked)}
                    />
                    <span>New Customer Registration</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notifications.orderStatusNotification}
                      onChange={(e) => handleNotificationChange('orderStatusNotification', e.target.checked)}
                    />
                    <span>Order Status Updates</span>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h4>Marketing & Updates</h4>
                <div className="notification-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notifications.marketingEmails}
                      onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
                    />
                    <span>Marketing Emails</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notifications.newsletter}
                      onChange={(e) => handleNotificationChange('newsletter', e.target.checked)}
                    />
                    <span>Newsletter Subscription</span>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h4>Push Notifications</h4>
                <div className="notification-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                    />
                    <span>Enable Push Notifications</span>
                  </label>
                </div>
              </div>

              <div className="notification-test">
                <h4>Test Notifications</h4>
                <p>Send a test notification to ensure your settings are working correctly.</p>
                <button className="btn btn-secondary">
                  Send Test Notification
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Shipping Settings</h3>
              <p>Configure shipping methods and rates</p>
            </div>

            <div className="settings-form">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.shippingEnabled}
                    onChange={(e) => handleSettingChange('shippingEnabled', e.target.checked)}
                  />
                  <span>Enable Shipping</span>
                </label>
              </div>

              {settings.shippingEnabled && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Free Shipping Threshold</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          value={settings.freeShippingThreshold}
                          onChange={(e) => handleSettingChange('freeShippingThreshold', parseInt(e.target.value) || 0)}
                          className="form-input"
                          min="0"
                        />
                        <span className="input-unit">৳</span>
                      </div>
                      <p className="form-help">
                        Minimum order amount for free shipping
                      </p>
                    </div>
                    <div className="form-group">
                      <label>Tax Rate</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          value={settings.taxRate}
                          onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0)}
                          className="form-input"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="input-unit">%</span>
                      </div>
                      <p className="form-help">
                        Tax rate applied to all orders
                      </p>
                    </div>
                  </div>

                  <div className="shipping-methods">
                    <h4>Shipping Methods</h4>
                    <div className="method-list">
                      <div className="method-item">
                        <div className="method-header">
                          <h5>Standard Shipping</h5>
                          <span className="method-status active">Active</span>
                        </div>
                        <div className="method-details">
                          <p>Delivery in 3-5 business days</p>
                          <p className="method-price">৳ 50</p>
                        </div>
                      </div>
                      <div className="method-item">
                        <div className="method-header">
                          <h5>Express Shipping</h5>
                          <span className="method-status active">Active</span>
                        </div>
                        <div className="method-details">
                          <p>Delivery in 1-2 business days</p>
                          <p className="method-price">৳ 120</p>
                        </div>
                      </div>
                      <div className="method-item">
                        <div className="method-header">
                          <h5>Pickup</h5>
                          <span className="method-status inactive">Inactive</span>
                        </div>
                        <div className="method-details">
                          <p>Pick up from store</p>
                          <p className="method-price">Free</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Payment Settings</h3>
              <p>Configure payment gateways and methods</p>
            </div>

            <div className="settings-form">
              <div className="payment-methods">
                <div className="method-item">
                  <div className="method-header">
                    <div className="method-icon">💳</div>
                    <div className="method-info">
                      <h5>Credit/Debit Card</h5>
                      <p>Stripe Payment Gateway</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="method-config">
                    <div className="form-group">
                      <label>Publishable Key</label>
                      <input
                        type="text"
                        defaultValue="pk_test_51ABCD..."
                        className="form-input"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Secret Key</label>
                      <input
                        type="password"
                        defaultValue="sk_test_51XYZ..."
                        className="form-input"
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>
                </div>

                <div className="method-item">
                  <div className="method-header">
                    <div className="method-icon">💰</div>
                    <div className="method-info">
                      <h5>Cash on Delivery (COD)</h5>
                      <p>Pay when you receive</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="method-item">
                  <div className="method-header">
                    <div className="method-icon">📱</div>
                    <div className="method-info">
                      <h5>bKash</h5>
                      <p>Mobile Banking</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="method-config">
                    <div className="form-group">
                      <label>bKash Merchant Number</label>
                      <input
                        type="text"
                        defaultValue="016XXXXXXXX"
                        className="form-input"
                        placeholder="016XXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="method-item">
                  <div className="method-header">
                    <div className="method-icon">📲</div>
                    <div className="method-info">
                      <h5>Nagad</h5>
                      <p>Mobile Banking</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="payment-settings">
                <h4>Payment Settings</h4>
                <div className="form-group">
                  <label>Currency</label>
                  <select className="form-input" defaultValue="BDT">
                    <option value="BDT">Bangladeshi Taka (BDT)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Enable Test Mode</span>
                  </label>
                  <p className="form-help">
                    Use test payments for development and testing
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Security Settings</h3>
              <p>Configure security and privacy settings</p>
            </div>

            <div className="settings-form">
              <div className="security-options">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                    />
                    <span>Require Email Verification</span>
                  </label>
                  <p className="form-help">
                    Users must verify their email before accessing account
                  </p>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Enable Two-Factor Authentication (2FA)</span>
                  </label>
                  <p className="form-help">
                    Add an extra layer of security to admin accounts
                  </p>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>SSL/HTTPS Enforcement</span>
                  </label>
                  <p className="form-help">
                    Redirect all traffic to secure HTTPS connection
                  </p>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>IP Address Restrictions</span>
                  </label>
                  <p className="form-help">
                    Restrict admin access to specific IP addresses
                  </p>
                </div>
              </div>

              <div className="security-audit">
                <h4>Security Audit</h4>
                <div className="audit-list">
                  <div className="audit-item success">
                    <span className="audit-icon">✅</span>
                    <div>
                      <h5>SSL Certificate</h5>
                      <p>Valid and up to date</p>
                    </div>
                  </div>
                  <div className="audit-item success">
                    <span className="audit-icon">✅</span>
                    <div>
                      <h5>Firewall Protection</h5>
                      <p>Active and configured</p>
                    </div>
                  </div>
                  <div className="audit-item warning">
                    <span className="audit-icon">⚠️</span>
                    <div>
                      <h5>Password Strength</h5>
                      <p>Some users have weak passwords</p>
                    </div>
                  </div>
                  <div className="audit-item success">
                    <span className="audit-icon">✅</span>
                    <div>
                      <h5>Malware Scan</h5>
                      <p>Last scan: 2 days ago</p>
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary">
                  Run Security Scan
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="settings-section">
            <div className="section-header">
              <h3>Advanced Settings</h3>
              <p>Advanced configuration and system settings</p>
            </div>

            <div className="settings-form">
              <div className="danger-zone">
                <h4>⚠️ Danger Zone</h4>
                <p>These actions are irreversible. Please proceed with caution.</p>
                
                <div className="danger-actions">
                  <button className="btn btn-danger">
                    <span className="btn-icon">🗑️</span>
                    Clear All Cache
                  </button>
                  <button className="btn btn-danger">
                    <span className="btn-icon">📊</span>
                    Reset Analytics Data
                  </button>
                  <button className="btn btn-danger">
                    <span className="btn-icon">🔄</span>
                    Re-index Database
                  </button>
                </div>
              </div>

              <div className="system-info">
                <h4>System Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Platform Version</span>
                    <span className="info-value">v2.5.1</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Database</span>
                    <span className="info-value">MongoDB 7.0</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Node.js</span>
                    <span className="info-value">v18.17.0</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">React</span>
                    <span className="info-value">v18.2.0</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Server Uptime</span>
                    <span className="info-value">15 days, 6 hours</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Storage Usage</span>
                    <span className="info-value">2.4 GB / 10 GB</span>
                  </div>
                </div>
              </div>

              <div className="backup-section">
                <h4>Backup & Restore</h4>
                <p>Create backups of your store data and settings.</p>
                <div className="backup-actions">
                  <button className="btn btn-secondary">
                    <span className="btn-icon">💾</span>
                    Create Backup
                  </button>
                  <button className="btn btn-secondary">
                    <span className="btn-icon">📤</span>
                    Restore Backup
                  </button>
                  <button className="btn btn-secondary">
                    <span className="btn-icon">📥</span>
                    Download Latest Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;