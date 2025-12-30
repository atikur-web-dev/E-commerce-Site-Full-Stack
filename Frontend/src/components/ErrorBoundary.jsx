// ./Frontend/src/components/ErrorBoundary.jsx
import React from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(" Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>Oops! Something went wrong</h1>
            <p>Please try refreshing the page or go back to home.</p>
            <div className="error-actions">
              <button
                onClick={() => (window.location.href = "/")}
                className="error-btn"
              >
                Go to Homepage
              </button>
              <button
                onClick={() => window.location.reload()}
                className="error-btn outline"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
