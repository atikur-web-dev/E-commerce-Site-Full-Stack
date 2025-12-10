// ./Frontend/src/components/common/Loading/Loading.jsx
import React from "react";
import "./Loading.css";

const Loading = ({
  size = "medium",
  type = "spinner",
  text = "Loading...",
  fullScreen = false,
}) => {
  const sizeClass = `loading-${size}`;
  const typeClass = `loading-${type}`;

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`loading-container ${sizeClass} ${typeClass}`}>
          {type === "spinner" && <div className="spinner"></div>}
          {type === "dots" && (
            <div className="dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          {type === "pulse" && <div className="pulse"></div>}
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-container ${sizeClass} ${typeClass}`}>
      {type === "spinner" && <div className="spinner"></div>}
      {type === "dots" && (
        <div className="dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      )}
      {type === "pulse" && <div className="pulse"></div>}
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
