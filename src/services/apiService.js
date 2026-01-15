/**
 * API Service Layer - Deep Call Chains
 * =====================================
 * 
 * Additional services with deep call chains for thorough testing
 * 
 * VULNERABILITY INVENTORY (Continued):
 * ====================================
 * 8. VULN-REACT-008: Fetch URL injection (6-hop chain, LIVE)
 * 9. VULN-REACT-009: postMessage XSS (5-hop chain, LIVE)
 * 10. VULN-REACT-010: localStorage XSS (4-hop chain, LIVE)
 * 11. VULN-REACT-011: URL redirect open redirect (3-hop chain, LIVE)
 * 12. VULN-REACT-012: Template literal injection (FALSE POSITIVE - DEAD CODE)
 */

// =============================================================================
// FETCH URL INJECTION (6-hop chain)
// =============================================================================

/**
 * APIGateway - Central API gateway
 * Contains VULN-REACT-008: Fetch URL injection
 */
export class APIGateway {
  constructor() {
    this.requestBuilder = new RequestBuilder();
    this.urlResolver = new URLResolver();
  }

  /**
   * HOP 1: Entry point for API calls
   */
  async makeRequest(endpoint, userParams = {}) {
    const resolvedURL = this.urlResolver.resolve(endpoint, userParams);
    const request = this.requestBuilder.build(resolvedURL);
    return this._executeRequest(request);
  }

  /**
   * HOP 2: Executes the HTTP request
   */
  async _executeRequest(request) {
    return await this.requestBuilder.execute(request);
  }
}

/**
 * URLResolver - Resolves API URLs
 */
class URLResolver {
  constructor() {
    this.pathBuilder = new PathBuilder();
  }

  /**
   * HOP 3: Resolves endpoint to full URL
   */
  resolve(endpoint, params) {
    const path = this.pathBuilder.buildPath(endpoint, params);
    return this._constructFullURL(path);
  }

  /**
   * HOP 4: Constructs full URL
   */
  _constructFullURL(path) {
    // VULNERABLE: User-controlled path appended without validation
    return `${window.location.origin}/${path}`;
  }
}

/**
 * PathBuilder - Builds request paths
 */
class PathBuilder {
  /**
   * HOP 5: Builds path from user input
   */
  buildPath(endpoint, params) {
    // VULNERABLE: Direct concatenation of user params
    let path = endpoint;
    if (params.customPath) {
      path = params.customPath;  // User-controlled
    }
    return path;
  }
}

/**
 * RequestBuilder - Builds and executes HTTP requests
 */
class RequestBuilder {
  /**
   * Builds request configuration
   */
  build(url) {
    return {
      url: url,
      method: 'GET',
      credentials: 'include'
    };
  }

  /**
   * HOP 6: Executes fetch - SINK
   */
  async execute(request) {
    // SINK: Fetch with user-controlled URL
    const response = await fetch(request.url, {
      method: request.method,
      credentials: request.credentials
    });
    return response.json();
  }
}

// =============================================================================
// postMessage XSS (5-hop chain)
// =============================================================================

/**
 * CrossOriginMessenger - Handles postMessage communication
 * Contains VULN-REACT-009: postMessage XSS
 */
export class CrossOriginMessenger {
  constructor() {
    this.messageProcessor = new MessageProcessor();
    this.renderQueue = new RenderQueue();
  }

  /**
   * HOP 1: Registers message listener
   */
  registerListener() {
    window.addEventListener('message', (event) => {
      // VULNERABLE: No origin validation
      this._handleMessage(event.data);
    });
  }

  /**
   * HOP 2: Handles incoming message
   */
  _handleMessage(data) {
    if (data.type === 'RENDER_CONTENT') {
      const processed = this.messageProcessor.process(data.content);
      this.renderQueue.enqueue(processed);
    }
  }
}

/**
 * MessageProcessor - Processes message content
 */
class MessageProcessor {
  constructor() {
    this.htmlBuilder = new UnsafeHTMLBuilder();
  }

  /**
   * HOP 3: Processes message content
   */
  process(content) {
    return this.htmlBuilder.build(content);
  }
}

/**
 * UnsafeHTMLBuilder - Builds HTML without sanitization
 */
class UnsafeHTMLBuilder {
  /**
   * HOP 4: Builds unsafe HTML
   */
  build(content) {
    return `<div class="message-content">${content}</div>`;
  }
}

/**
 * RenderQueue - Queue for rendering content
 */
class RenderQueue {
  constructor() {
    this.queue = [];
    this.targetElement = null;
  }

  setTarget(element) {
    this.targetElement = element;
  }

  /**
   * HOP 5: Renders queued content - SINK
   */
  enqueue(html) {
    if (this.targetElement) {
      this.targetElement.innerHTML += html;  // SINK: XSS from postMessage
    }
    this.queue.push(html);
  }
}

// =============================================================================
// localStorage XSS (4-hop chain)
// =============================================================================

/**
 * StorageManager - Manages localStorage
 * Contains VULN-REACT-010: localStorage XSS
 */
export class StorageManager {
  constructor() {
    this.serializer = new DataSerializer();
    this.renderer = new StoredContentRenderer();
  }

  /**
   * HOP 1: Stores user data (entry point for injection)
   */
  storeUserData(key, value) {
    const serialized = this.serializer.serialize(value);
    localStorage.setItem(key, serialized);
  }

  /**
   * HOP 2: Retrieves and renders stored data
   */
  loadAndRender(key, targetElement) {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = this.serializer.deserialize(stored);
      this.renderer.render(data, targetElement);
    }
  }
}

/**
 * DataSerializer - Serializes/deserializes data
 */
class DataSerializer {
  serialize(data) {
    return JSON.stringify(data);
  }

  deserialize(data) {
    return JSON.parse(data);
  }
}

/**
 * StoredContentRenderer - Renders stored content
 */
class StoredContentRenderer {
  /**
   * HOP 3: Prepares content for rendering
   */
  render(data, element) {
    if (data.htmlContent) {
      this._injectHTML(data.htmlContent, element);
    }
  }

  /**
   * HOP 4: Injects HTML - SINK
   */
  _injectHTML(html, element) {
    element.innerHTML = html;  // SINK: XSS from localStorage
  }
}

// =============================================================================
// Open Redirect (3-hop chain)
// =============================================================================

/**
 * NavigationManager - Manages navigation
 * Contains VULN-REACT-011: Open redirect
 */
export class NavigationManager {
  constructor() {
    this.urlValidator = new WeakURLValidator();
  }

  /**
   * HOP 1: Entry point for redirects
   */
  redirectTo(targetURL) {
    if (this.urlValidator.validate(targetURL)) {
      this._performRedirect(targetURL);
    }
  }

  /**
   * HOP 2: Performs the redirect - SINK
   */
  _performRedirect(url) {
    window.location.href = url;  // SINK: Open redirect
  }
}

/**
 * WeakURLValidator - Weak URL validation (easily bypassed)
 */
class WeakURLValidator {
  /**
   * HOP 3: Weak validation
   * Bypassed with: //evil.com
   */
  validate(url) {
    // Only checks for javascript: protocol - easily bypassed
    if (url.toLowerCase().startsWith('javascript:')) {
      return false;
    }
    return true;  // Allows //evil.com, data:, etc.
  }
}

// =============================================================================
// DEAD CODE - Template Literal Injection
// =============================================================================

/**
 * DeprecatedTemplateEngine - DEAD CODE
 * Contains VULN-REACT-012: FALSE POSITIVE (DEAD CODE)
 */
export class DeprecatedTemplateEngine {
  /**
   * DEAD CODE: No callers in the codebase
   */
  render(template, data) {
    // VULNERABLE but DEAD CODE
    const rendered = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || '';
    });
    document.body.innerHTML = rendered;  // SINK but never called
  }
}

/**
 * UnusedEvalFunction - DEAD CODE
 * This function is never called anywhere
 */
export function unsafeEvaluate(code) {
  // DEAD CODE: Never invoked
  return eval(code);  // SINK but dead code
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * useUnsafeHTML - Custom hook for unsafe HTML rendering
 * Wrapper for vulnerable rendering patterns
 */
export function useUnsafeHTML(rawHTML) {
  return { __html: rawHTML };  // SINK: Used in dangerouslySetInnerHTML
}

/**
 * useSafeHTML - Custom hook for safe HTML rendering
 * Uses DOMPurify for sanitization
 */
export function useSafeHTML(rawHTML) {
  const DOMPurify = require('dompurify');
  return { __html: DOMPurify.sanitize(rawHTML) };  // SAFE: Sanitized
}

// =============================================================================
// FEATURE FLAG DEAD CODE
// =============================================================================

const DEBUG_MODE_ENABLED = false;  // Always false in production

/**
 * DebugRenderer - Only active in debug mode (never in production)
 */
export class DebugRenderer {
  render(debugContent) {
    if (DEBUG_MODE_ENABLED) {  // Always false
      // DEAD CODE BLOCK
      const debugPanel = document.getElementById('debug-panel');
      if (debugPanel) {
        debugPanel.innerHTML = debugContent;  // VULN but dead code
      }
    }
  }
}
