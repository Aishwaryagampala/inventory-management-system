import React from "react";
import LoginForm from "../LoginForm";
import "../LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  return (
    <div className="login-page-container">
      <div className="login-page-left">
        <div className="logo-section">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="2" width="20" height="20" rx="4" fill="#333" />
            <path d="M7 7H17V9H7V7Z" fill="white" />
            <path d="M7 11H17V13H7V11Z" fill="white" />
            <path d="M7 15H13V17H7V15Z" fill="white" />
          </svg>
          <span className="logo-text">IMS</span>
        </div>
        <h1 className="system-title">Inventory Management System</h1>

        <div className="illustration-placeholder"></div>
      </div>

      <div className="login-page-right">
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
