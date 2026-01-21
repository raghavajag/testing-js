/**
 * Admin Panel Component
 * Uses system services with command execution and file operations
 */

import React, { useState } from 'react';
import { CommandService, FileService, TemplateService } from '../services/systemService';

const AdminPanel = () => {
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [commandOutput, setCommandOutput] = useState('');

  const [filename, setFilename] = useState('');
  const [fileContent, setFileContent] = useState('');

  const [templateName, setTemplateName] = useState('');
  const [templateContext, setTemplateContext] = useState('{}');
  const [renderedTemplate, setRenderedTemplate] = useState('');

  const executeCommand = async () => {
    try {
      const result = await CommandService.executeCommand(command, args.split(' '));
      setCommandOutput(result.output);
    } catch (error) {
      setCommandOutput(`Error: ${error.message}`);
    }
  };

  const readFile = async () => {
    try {
      const content = await FileService.readFile(filename);
      setFileContent(content);
    } catch (error) {
      setFileContent(`Error: ${error.message}`);
    }
  };

  const renderTemplate = async () => {
    try {
      const context = JSON.parse(templateContext);
      const result = await TemplateService.renderTemplate(templateName, context);
      setRenderedTemplate(result);
    } catch (error) {
      setRenderedTemplate(`Error: ${error.message}`);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <div className="admin-section">
        <h3>Command Execution</h3>
        <input
          type="text"
          placeholder="Command"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <input
          type="text"
          placeholder="Arguments (space separated)"
          value={args}
          onChange={(e) => setArgs(e.target.value)}
        />
        <button onClick={executeCommand}>Execute</button>
        {commandOutput && (
          <pre className="output">{commandOutput}</pre>
        )}
      </div>

      <div className="admin-section">
        <h3>File Operations</h3>
        <input
          type="text"
          placeholder="Filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
        <button onClick={readFile}>Read File</button>
        {fileContent && (
          <pre className="output">{fileContent}</pre>
        )}
      </div>

      <div className="admin-section">
        <h3>Template Rendering</h3>
        <input
          type="text"
          placeholder="Template name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        <textarea
          placeholder="Context JSON"
          value={templateContext}
          onChange={(e) => setTemplateContext(e.target.value)}
        />
        <button onClick={renderTemplate}>Render</button>
        {renderedTemplate && (
          <div
            className="template-output"
            dangerouslySetInnerHTML={{ __html: renderedTemplate }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;