import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import './App.css';

/**
 * Main App Component - AI Call Center Frontend
 * 
 * Enhanced version with modern UI, dark mode support, and better UX
 */
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('ai-callcenter-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
    setIsLoaded(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('ai-callcenter-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('ai-callcenter-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!isLoaded) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading AI Call Center...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              <span className="title-icon">🤖</span>
              <span className="title-text">AI Call Center</span>
              <span className="title-badge">Pro</span>
            </h1>
            <p className="app-subtitle">
              Intelligent support powered by advanced AI agents
            </p>
          </div>
          
          <div className="header-right">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <span className="theme-icon">
                {isDarkMode ? '☀️' : '🌙'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        <div className="chat-container">
          <ChatInterface isDarkMode={isDarkMode} />
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p className="footer-text">
              <span className="footer-icon">✨</span>
              <strong>Smart Help:</strong> Our AI agents are ready to assist with appointments, HR questions, and more
            </p>
          </div>
          
          <div className="footer-services">
            <div className="service-card">
              <span className="service-icon">🏥</span>
              <span className="service-name">Medical</span>
            </div>
            <div className="service-card">
              <span className="service-icon">👥</span>
              <span className="service-name">HR Support</span>
            </div>
            <div className="service-card">
              <span className="service-icon">📞</span>
              <span className="service-name">General Help</span>
            </div>
            <div className="service-card">
              <span className="service-icon">⚡</span>
              <span className="service-name">24/7 Available</span>
            </div>
          </div>
          
          <div className="footer-meta">
            <span className="footer-version">v2.0</span>
            <span className="footer-status">
              <span className="status-indicator-small"></span>
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
