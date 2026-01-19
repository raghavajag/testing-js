// tests/testcode/react_multi_hop/App.jsx
/**
 * Multi-hop attack path test project for React.
 *
 * This file contains various vulnerability scenarios to test:
 * 1. Multi-hop LIVE paths (JSX handler -> service -> sink)
 * 2. Dead code paths (unused components/functions)
 * 3. Sanitized paths (DOMPurify/escaping before render)
 * 4. Dynamic callbacks (UNKNOWN reachability)
 * 5. dangerouslySetInnerHTML (XSS sink)
 */
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

// ==============================================================================
// SCENARIO A: Multi-hop LIVE path (JSX onClick -> controller -> service -> sink)
// Expected: LIVE, classification=must_fix
// ==============================================================================

function renderUnsafeHTML(html) {
  // SINK: XSS via innerHTML - final hop
  document.getElementById('output').innerHTML = html;  // VULNERABLE SINK
}

function processUserContent(content) {
  // SERVICE LAYER: Formats content - hop 3
  const formatted = `<div class="user-content">${content}</div>`;
  return renderUnsafeHTML(formatted);
}

function handleContentSubmit(data) {
  // CONTROLLER: Extracts content from form - hop 2
  const content = data.userContent;
  return processUserContent(content);
}

export function VulnerableForm() {
  const [userContent, setUserContent] = useState('');

  // ENTRYPOINT: JSX onClick handler - hop 1
  const onSubmitClick = () => {
    handleContentSubmit({ userContent });
  };

  return (
    <div>
      <textarea 
        value={userContent}
        onChange={(e) => setUserContent(e.target.value)}
      />
      <button onClick={onSubmitClick}>Submit (Unsafe)</button>
      <div id="output"></div>
    </div>
  );
}


// ==============================================================================
// SCENARIO B: Dead code path (component never rendered)
// Expected: DEAD, classification=false_positive_deadcode
// ==============================================================================

function unusedDangerousSink(data) {
  // DEAD CODE: No callers in entire codebase
  return eval(data);  // DEAD SINK - should be false positive
}

function NeverUsedComponent() {
  // DEAD CODE: This component is never rendered
  const [data, setData] = useState('');
  
  const handleClick = () => {
    unusedDangerousSink(data);  // DEAD SINK
  };

  return <button onClick={handleClick}>Never Rendered</button>;
}


// ==============================================================================
// SCENARIO C: Sanitized path (DOMPurify before render)
// Expected: LIVE but PROTECTED/SANITIZED, classification=false_positive_sanitized
// ==============================================================================

function sanitizeHTML(html) {
  // SANITIZER: DOMPurify cleans dangerous content
  return DOMPurify.sanitize(html);
}

function renderSafeHTML(html) {
  // SINK: But receives sanitized input
  document.getElementById('safe-output').innerHTML = html;
}

function handleSafeSubmit(data) {
  // CONTROLLER: Applies sanitization before sink
  const rawHTML = data.userContent;
  const safeHTML = sanitizeHTML(rawHTML);  // SANITIZER EDGE
  return renderSafeHTML(safeHTML);
}

export function SafeForm() {
  const [userContent, setUserContent] = useState('');

  // ENTRYPOINT: JSX onClick handler with sanitized path
  const onSubmitClick = () => {
    handleSafeSubmit({ userContent });
  };

  return (
    <div>
      <textarea 
        value={userContent}
        onChange={(e) => setUserContent(e.target.value)}
      />
      <button onClick={onSubmitClick}>Submit (Safe)</button>
      <div id="safe-output"></div>
    </div>
  );
}


// ==============================================================================
// SCENARIO D: dangerouslySetInnerHTML (React-specific XSS)
// Expected: LIVE, classification=must_fix
// ==============================================================================

function processTemplate(userData) {
  // SERVICE: Builds HTML template with user data
  return `<span class="greeting">Hello, ${userData}!</span>`;
}

export function DangerousComponent() {
  const [name, setName] = useState('');
  const [html, setHtml] = useState('');

  // ENTRYPOINT: useEffect that processes user input
  useEffect(() => {
    if (name) {
      const rendered = processTemplate(name);
      setHtml(rendered);
    }
  }, [name]);

  return (
    <div>
      <input 
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      {/* SINK: dangerouslySetInnerHTML */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}


// ==============================================================================
// SCENARIO E: Dynamic callback (UNKNOWN reachability)
// Expected: UNKNOWN - cannot statically determine handler
// ==============================================================================

function dynamicHandler(handlers, action, payload) {
  // DYNAMIC: Cannot statically resolve which handler is called
  const handler = handlers[action];
  if (handler) {
    return handler(payload);  // UNKNOWN - dynamic dispatch
  }
  return null;
}

function dangerousCallback(data) {
  // SINK: Only reachable via dynamic dispatch
  return eval(data);
}

function safeCallback(data) {
  return JSON.stringify(data);
}

export function DynamicComponent() {
  const [action, setAction] = useState('safe');
  const [payload, setPayload] = useState('');

  const handlers = {
    dangerous: dangerousCallback,
    safe: safeCallback
  };

  // ENTRYPOINT: onClick with dynamic dispatch
  const onExecute = () => {
    dynamicHandler(handlers, action, payload);
  };

  return (
    <div>
      <select value={action} onChange={(e) => setAction(e.target.value)}>
        <option value="safe">Safe</option>
        <option value="dangerous">Dangerous</option>
      </select>
      <input value={payload} onChange={(e) => setPayload(e.target.value)} />
      <button onClick={onExecute}>Execute</button>
    </div>
  );
}


// ==============================================================================
// SCENARIO F: Fetch with URL injection
// Expected: LIVE, classification=must_fix
// ==============================================================================

function makeAPICall(url) {
  // SINK: SSRF via user-controlled URL
  return fetch(url);  // VULNERABLE - URL injection
}

function buildAPIUrl(endpoint, params) {
  // SERVICE: Builds URL with user params
  return `${endpoint}?${new URLSearchParams(params).toString()}`;
}

export function SearchComponent() {
  const [query, setQuery] = useState('');

  // ENTRYPOINT: onSubmit handler
  const onSearch = (e) => {
    e.preventDefault();
    const url = buildAPIUrl('/api/search', { q: query });
    makeAPICall(url);
  };

  return (
    <form onSubmit={onSearch}>
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}


// ==============================================================================
// SCENARIO G: Deep component chain (5 levels)
// Expected: LIVE, tests deep traversal through components
// ==============================================================================

function finalRender(data) {
  // SINK: XSS at bottom of chain
  document.body.innerHTML += data;
}

function Level4({ data }) {
  useEffect(() => {
    finalRender(data);
  }, [data]);
  return <div>Level 4</div>;
}

function Level3({ data }) {
  return <Level4 data={data} />;
}

function Level2({ data }) {
  return <Level3 data={data} />;
}

function Level1({ data }) {
  return <Level2 data={data} />;
}

export function DeepComponent() {
  const [userData, setUserData] = useState('');

  return (
    <div>
      <input 
        value={userData}
        onChange={(e) => setUserData(e.target.value)}
      />
      <Level1 data={userData} />
    </div>
  );
}


// ==============================================================================
// MAIN APP: Only renders some components (others are DEAD)
// ==============================================================================

export default function App() {
  return (
    <div className="app">
      <h1>Multi-hop Attack Path Test</h1>
      
      {/* LIVE: These components are rendered */}
      <VulnerableForm />
      <SafeForm />
      <DangerousComponent />
      <DynamicComponent />
      <SearchComponent />
      <DeepComponent />
      
      {/* DEAD: NeverUsedComponent is NOT rendered anywhere */}
    </div>
  );
}
