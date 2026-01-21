/**
 * Main App Component - AI-SAST Multi-File Stress Test
 * ================================================
 *
 * Orchestrates complex component hierarchy with cross-file attack paths.
 * Tests static analyzer's ability to trace calls across imports and modules.
 *
 * Total Files: 15+
 * Total Components: 10+
 * Attack Paths: 200+ (spanning multiple files)
 * Import Chains: 5+ levels deep
 */

import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import AuthForm from './components/AuthForm';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import './App.css';

const AppContent = () => {
  const { user, logout } = useAppContext();
  const [currentView, setCurrentView] = React.useState('products');

  const renderView = () => {
    switch (currentView) {
      case 'auth':
        return <AuthForm />;
      case 'products':
        return <ProductList />;
      case 'cart':
        return <Cart />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : <div>Access denied</div>;
      default:
        return <ProductList />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI-SAST Multi-File Stress Test</h1>
        <nav>
          <button onClick={() => setCurrentView('products')}>Products</button>
          <button onClick={() => setCurrentView('cart')}>Cart</button>
          {user?.role === 'admin' && (
            <button onClick={() => setCurrentView('admin')}>Admin</button>
          )}
          {user ? (
            <div>
              <span>Welcome, {user.username}!</span>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setCurrentView('auth')}>Login</button>
          )}
        </nav>
      </header>

      <main className="app-main">
        {renderView()}
      </main>

      <footer className="app-footer">
        <div className="stats">
          <div>Files: 15+</div>
          <div>Components: 10+</div>
          <div>Attack Paths: 200+</div>
          <div>Vulnerabilities: 50+</div>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;