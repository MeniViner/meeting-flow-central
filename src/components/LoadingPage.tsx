// LoadingPage.tsx
import React from "react";
import "./LoadingPage.css";

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message = "טוען..." 
}) => {
  return (
    <div className="loading-page">
      <div className="loading-spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}; 