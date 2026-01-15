/**
 * QA Multilang Testbed - React Application
 * ==========================================
 * 
 * FINAL BOSS TEST CODEBASE for AI-SAST Pipeline Stress Testing
 * 
 * This application simulates a production-grade admin dashboard with:
 * - Multi-hop call chains (6+ functions deep)
 * - Dead code paths
 * - Sanitized paths (true false positives via DOMPurify)
 * - Protected paths (admin checks)
 * - Various vulnerability types (XSS, Command Injection via API)
 * - Mixed reachability scenarios
 * 
 * VULNERABILITY INVENTORY:
 * ========================
 * 1. VULN-REACT-001: XSS via dangerouslySetInnerHTML (5-hop chain, LIVE)
 * 2. VULN-REACT-002: XSS with DOMPurify sanitization (FALSE POSITIVE - SANITIZED)
 * 3. VULN-REACT-003: DOM-based XSS via innerHTML (4-hop chain, LIVE)
 * 4. VULN-REACT-004: XSS in dead code path (FALSE POSITIVE - DEAD CODE)
 * 5. VULN-REACT-005: XSS behind admin check (FALSE POSITIVE - PROTECTED)
 * 6. VULN-REACT-006: Eval injection via dynamic import (3-hop chain, LIVE)
 * 7. VULN-REACT-007: Partial sanitization bypass (LIVE)
 */

import DOMPurify from 'dompurify';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';
const FEATURE_FLAGS = {
  ENABLE_LEGACY_RENDERER: false,  // Always false - dead code
  ENABLE_EXPERIMENTAL_FEATURES: false,
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development'
};

// =============================================================================
// AUTHENTICATION CONTEXT
// =============================================================================

const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const userData = await response.json();
      setUser(userData.user);
      localStorage.setItem('user', JSON.stringify(userData.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value = useMemo(() => ({
    user,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
    loading,
    login,
    logout
  }), [user, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =============================================================================
// SERVICE LAYER - Content Rendering Service (Multi-hop XSS chain)
// =============================================================================

/**
 * ContentProcessor - Processes user-generated content
 * Contains VULN-REACT-001: 5-hop XSS chain
 */
class ContentProcessor {
  constructor() {
    this.formatter = new ContentFormatter();
    this.transformer = new HTMLTransformer();
  }

  /**
   * HOP 1: Entry point for content processing
   * Receives raw user content from component
   */
  processUserContent(rawContent, options = {}) {
    const { allowMarkdown = true, allowHTML = false } = options;
    
    // Transform content based on options
    let processedContent = rawContent;
    
    if (allowMarkdown) {
      processedContent = this.formatter.parseMarkdown(processedContent);
    }
    
    if (allowHTML) {
      processedContent = this._applyHTMLTransformations(processedContent);
    }
    
    return processedContent;
  }

  /**
   * HOP 2: Applies HTML transformations
   */
  _applyHTMLTransformations(content) {
    return this.transformer.transformToHTML(content);
  }
}

/**
 * ContentFormatter - Formats content with markdown-like syntax
 */
class ContentFormatter {
  /**
   * HOP 3: Parses markdown to HTML
   * VULNERABLE: No sanitization of user input
   */
  parseMarkdown(content) {
    // Simple markdown parsing (vulnerable to XSS)
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    
    return html;
  }
}

/**
 * HTMLTransformer - Transforms content to HTML
 */
class HTMLTransformer {
  constructor() {
    this.renderer = new UnsafeHTMLRenderer();
  }

  /**
   * HOP 4: Transforms content to HTML
   */
  transformToHTML(content) {
    // Wrap in container
    const wrappedContent = `<div class="user-content">${content}</div>`;
    return this.renderer.renderHTML(wrappedContent);
  }
}

/**
 * UnsafeHTMLRenderer - Renders HTML without sanitization
 * SINK for XSS vulnerabilities
 */
class UnsafeHTMLRenderer {
  /**
   * HOP 5: Final render - SINK
   * Returns unsanitized HTML
   */
  renderHTML(html) {
    // VULNERABLE: Returns unsanitized HTML
    return { __html: html };  // SINK: Will be used with dangerouslySetInnerHTML
  }
}

// =============================================================================
// SERVICE LAYER - Safe Content Service (Sanitized paths)
// =============================================================================

/**
 * SafeContentProcessor - Processes content with proper sanitization
 * Contains VULN-REACT-002: FALSE POSITIVE (properly sanitized)
 */
class SafeContentProcessor {
  constructor() {
    this.sanitizer = new ContentSanitizer();
  }

  /**
   * HOP 1: Entry point for safe content processing
   */
  processSafeContent(rawContent) {
    // First sanitize, then process
    const sanitized = this.sanitizer.sanitize(rawContent);
    return this._formatSafeContent(sanitized);
  }

  /**
   * HOP 2: Formats already-sanitized content
   */
  _formatSafeContent(content) {
    return { __html: content };  // SAFE: Already sanitized by DOMPurify
  }
}

/**
 * ContentSanitizer - Sanitizes HTML content using DOMPurify
 */
class ContentSanitizer {
  /**
   * Sanitizes HTML using DOMPurify
   * This makes the path SAFE - FALSE POSITIVE
   */
  sanitize(html) {
    // SAFE: DOMPurify sanitization
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'title']
    });
  }
}

// =============================================================================
// SERVICE LAYER - DOM Manipulation Service (Direct DOM XSS)
// =============================================================================

/**
 * DOMManipulator - Directly manipulates DOM
 * Contains VULN-REACT-003: 4-hop DOM-based XSS
 */
class DOMManipulator {
  constructor(targetElementId) {
    this.targetId = targetElementId;
    this.contentBuilder = new DOMContentBuilder();
  }

  /**
   * HOP 1: Entry point for DOM updates
   */
  updateContent(userContent) {
    const htmlContent = this.contentBuilder.buildHTML(userContent);
    this._injectIntoDOM(htmlContent);
  }

  /**
   * HOP 2: Injects content into DOM
   */
  _injectIntoDOM(html) {
    const element = document.getElementById(this.targetId);
    if (element) {
      this._setElementContent(element, html);
    }
  }

  /**
   * HOP 3: Sets element innerHTML - SINK
   */
  _setElementContent(element, html) {
    element.innerHTML = html;  // SINK: DOM-based XSS
  }
}

/**
 * DOMContentBuilder - Builds HTML content for DOM
 */
class DOMContentBuilder {
  /**
   * HOP 4: Builds HTML from user input
   */
  buildHTML(content) {
    // VULNERABLE: Direct concatenation
    return `<div class="dynamic-content">${content}</div>`;
  }
}

// =============================================================================
// DEAD CODE PATHS
// =============================================================================

/**
 * LegacyContentRenderer - DEAD CODE
 * Contains VULN-REACT-004: XSS (FALSE POSITIVE - DEAD CODE)
 * This class is never instantiated or called
 */
class LegacyContentRenderer {
  /**
   * DEAD CODE: Never called due to feature flag
   */
  renderLegacyContent(userInput) {
    if (FEATURE_FLAGS.ENABLE_LEGACY_RENDERER) {  // Always false
      return { __html: userInput };  // VULN but DEAD CODE
    }
    return { __html: '' };
  }
}

/**
 * DeprecatedHTMLBuilder - DEAD CODE
 * No callers anywhere in codebase
 */
function deprecatedBuildHTML(input) {
  // DEAD CODE: This function is never called
  const div = document.createElement('div');
  div.innerHTML = input;  // VULN but DEAD CODE
  return div.outerHTML;
}

/**
 * ExperimentalFeatures - Behind always-false flag
 */
const experimentalRenderUnsafe = (content) => {
  if (FEATURE_FLAGS.ENABLE_EXPERIMENTAL_FEATURES) {  // Always false
    // DEAD CODE BLOCK
    const element = document.getElementById('experimental-container');
    if (element) {
      element.innerHTML = content;  // VULN but in dead code block
    }
  }
};

// =============================================================================
// PROTECTED PATHS (Admin-only features)
// =============================================================================

/**
 * AdminContentManager - Admin-only content management
 * Contains VULN-REACT-005: XSS (FALSE POSITIVE - PROTECTED)
 */
class AdminContentManager {
  /**
   * HOP 1: Admin-only content update
   * Protected by admin check in component
   */
  updateAdminContent(htmlContent, targetElement) {
    return this._renderAdminHTML(htmlContent, targetElement);
  }

  /**
   * HOP 2: Renders admin HTML - SINK
   * Protected because only admins can reach this code
   */
  _renderAdminHTML(html, element) {
    if (element) {
      element.innerHTML = html;  // SINK but protected by admin check
    }
    return { __html: html };
  }
}

// =============================================================================
// PARTIAL SANITIZATION (Bypassable)
// =============================================================================

/**
 * WeakSanitizer - Implements bypassable sanitization
 * Contains VULN-REACT-007: Partial sanitization bypass
 */
class WeakSanitizer {
  /**
   * HOP 1: Weak sanitization attempt
   */
  sanitize(input) {
    // Only removes <script> tags - easily bypassed
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Doesn't handle event handlers, data: URLs, etc.
    return sanitized;
  }
}

class PartiallyProtectedRenderer {
  constructor() {
    this.sanitizer = new WeakSanitizer();
  }

  /**
   * HOP 2: Renders with weak sanitization
   * Bypassed with: <img src=x onerror=alert(1)>
   */
  render(userContent) {
    const weaklySanitized = this.sanitizer.sanitize(userContent);
    return this._finalRender(weaklySanitized);
  }

  /**
   * HOP 3: Final render - SINK (bypassed sanitization)
   */
  _finalRender(content) {
    return { __html: content };  // SINK: XSS (sanitization bypassed)
  }
}

// =============================================================================
// DYNAMIC CODE EXECUTION (Eval injection)
// =============================================================================

/**
 * DynamicModuleLoader - Loads modules dynamically
 * Contains VULN-REACT-006: Eval injection
 */
class DynamicModuleLoader {
  /**
   * HOP 1: Entry point for dynamic loading
   */
  loadModule(modulePath) {
    return this._resolveAndLoad(modulePath);
  }

  /**
   * HOP 2: Resolves module path
   */
  _resolveAndLoad(path) {
    const resolvedPath = this._constructPath(path);
    return this._executeLoad(resolvedPath);
  }

  /**
   * HOP 3: Executes dynamic import - SINK
   */
  _executeLoad(path) {
    // VULNERABLE: User-controlled path in eval-like construct
    return new Function(`return import('${path}')`)();  // SINK: Code injection
  }

  _constructPath(userPath) {
    // No validation - directly uses user input
    return userPath;
  }
}

// =============================================================================
// REACT COMPONENTS
// =============================================================================

/**
 * UserContentDisplay - Displays user-generated content
 * VULN-REACT-001: XSS Entry Point
 */
export const UserContentDisplay = ({ content, allowHTML = false }) => {
  const [processedContent, setProcessedContent] = useState({ __html: '' });
  
  useEffect(() => {
    const processor = new ContentProcessor();
    const result = processor.processUserContent(content, { allowHTML });
    setProcessedContent(result);
  }, [content, allowHTML]);

  // SINK: dangerouslySetInnerHTML with unsanitized content
  return (
    <div 
      className="user-content-display"
      dangerouslySetInnerHTML={processedContent}  // SINK: XSS
    />
  );
};

/**
 * SafeContentDisplay - Displays sanitized content
 * VULN-REACT-002: FALSE POSITIVE (Sanitized)
 */
export const SafeContentDisplay = ({ content }) => {
  const [safeContent, setSafeContent] = useState({ __html: '' });
  
  useEffect(() => {
    const processor = new SafeContentProcessor();
    const result = processor.processSafeContent(content);
    setSafeContent(result);
  }, [content]);

  // SAFE: Content is sanitized by DOMPurify before rendering
  return (
    <div 
      className="safe-content-display"
      dangerouslySetInnerHTML={safeContent}  // SAFE: Sanitized
    />
  );
};

/**
 * DynamicContentPanel - Direct DOM manipulation
 * VULN-REACT-003: DOM-based XSS Entry Point
 */
export const DynamicContentPanel = ({ content }) => {
  const panelId = 'dynamic-panel-' + Math.random().toString(36).substr(2, 9);
  
  useEffect(() => {
    const manipulator = new DOMManipulator(panelId);
    manipulator.updateContent(content);  // VULN: DOM-based XSS
  }, [content, panelId]);

  return <div id={panelId} className="dynamic-content-panel" />;
};

/**
 * AdminPanel - Admin-only content management
 * VULN-REACT-005: FALSE POSITIVE (Protected by admin check)
 */
export const AdminPanel = ({ customHTML }) => {
  const { isAdmin } = useAuth();
  const adminPanelRef = React.useRef(null);
  
  useEffect(() => {
    // PROTECTION: Only executes if user is admin
    if (isAdmin && adminPanelRef.current) {
      const manager = new AdminContentManager();
      manager.updateAdminContent(customHTML, adminPanelRef.current);
    }
  }, [isAdmin, customHTML]);

  // PROTECTED: Only admins can trigger the vulnerable path
  if (!isAdmin) {
    return <div>Access Denied: Admin privileges required</div>;
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <div ref={adminPanelRef} className="admin-content" />
    </div>
  );
};

/**
 * PartiallyProtectedContent - Weakly sanitized content
 * VULN-REACT-007: Partial sanitization bypass
 */
export const PartiallyProtectedContent = ({ content }) => {
  const [renderedContent, setRenderedContent] = useState({ __html: '' });
  
  useEffect(() => {
    const renderer = new PartiallyProtectedRenderer();
    const result = renderer.render(content);
    setRenderedContent(result);
  }, [content]);

  // VULNERABLE: Weak sanitization can be bypassed
  return (
    <div 
      className="partially-protected"
      dangerouslySetInnerHTML={renderedContent}  // SINK: XSS (bypassed)
    />
  );
};

/**
 * ModuleLoader - Dynamic module loading
 * VULN-REACT-006: Eval injection Entry Point
 */
export const ModuleLoader = ({ modulePath }) => {
  const [status, setStatus] = useState('idle');
  
  const loadModule = useCallback(async () => {
    setStatus('loading');
    try {
      const loader = new DynamicModuleLoader();
      await loader.loadModule(modulePath);  // VULN: Code injection
      setStatus('loaded');
    } catch (error) {
      setStatus('error');
    }
  }, [modulePath]);

  return (
    <div className="module-loader">
      <button onClick={loadModule}>Load Module</button>
      <span>Status: {status}</span>
    </div>
  );
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

function App() {
  const [userInput, setUserInput] = useState('');
  
  return (
    <AuthProvider>
      <div className="app">
        <header>
          <h1>QA Testbed - React Application</h1>
        </header>
        
        <main>
          <section className="input-section">
            <h2>Content Input</h2>
            <textarea 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter content here..."
            />
          </section>
          
          <section className="display-section">
            <h3>Unsafe Display (VULN-REACT-001)</h3>
            <UserContentDisplay content={userInput} allowHTML={true} />
            
            <h3>Safe Display (SANITIZED)</h3>
            <SafeContentDisplay content={userInput} />
            
            <h3>DOM-based Display (VULN-REACT-003)</h3>
            <DynamicContentPanel content={userInput} />
            
            <h3>Partially Protected (VULN-REACT-007)</h3>
            <PartiallyProtectedContent content={userInput} />
          </section>
          
          <section className="admin-section">
            <h3>Admin Panel (PROTECTED)</h3>
            <AdminPanel customHTML={userInput} />
          </section>
          
          <section className="module-section">
            <h3>Dynamic Module Loader (VULN-REACT-006)</h3>
            <ModuleLoader modulePath={userInput} />
          </section>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
