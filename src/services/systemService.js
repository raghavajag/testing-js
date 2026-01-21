/**
 * System Service - Command execution and file operations
 * Contains command injection and path traversal vulnerabilities
 */

class CommandService {
  static async executeCommand(command, args = []) {
    return this.runSystemCommand(command, args);
  }

  static async runSystemCommand(command, args) {
    return this.commandPath1(command, args);
  }

  static async commandPath1(command, args) {
    // VULNERABLE: Command injection via shell execution
    const fullCommand = `${command} ${args.join(' ')}`;
    console.log('Executing command:', fullCommand);

    // Simulate command execution
    return {
      output: 'command output',
      error: null,
      code: 0
    };
  }

  static async commandPath2(command, args) {
    // VULNERABLE: Weak command validation
    const allowedCommands = ['ls', 'pwd', 'whoami', 'date'];
    if (!allowedCommands.includes(command)) {
      throw new Error('Command not allowed');
    }

    // Still vulnerable to argument injection
    const fullCommand = `${command} ${args.join(' ')}`;
    console.log('Executing validated command:', fullCommand);

    return {
      output: 'validated command output',
      error: null,
      code: 0
    };
  }

  static async executeSafeCommand(command, args) {
    // SAFE: Use array format (would be safe in Node.js)
    console.log('Safe execution:', command, args);
    return {
      output: 'safe command output',
      error: null,
      code: 0
    };
  }
}

class FileService {
  static async readFile(filename) {
    return this.readFileContent(filename);
  }

  static async readFileContent(filename) {
    return this.filePath1(filename);
  }

  static async filePath1(filename) {
    // VULNERABLE: Path traversal
    const filePath = `/tmp/${filename}`;
    console.log('Reading file:', filePath);

    // Simulate file reading
    return 'file content';
  }

  static async filePath2(filename) {
    // VULNERABLE: Weak path validation
    if (filename.includes('../')) {
      throw new Error('Invalid path');
    }

    const filePath = `/tmp/${filename}`;
    console.log('Reading validated file:', filePath);

    return 'validated file content';
  }

  static async readSafeFile(filename) {
    // SAFE: Use path.basename equivalent
    const safeFilename = filename.split('/').pop();
    const filePath = `/tmp/${safeFilename}`;
    console.log('Safe file read:', filePath);

    return 'safe file content';
  }

  static async writeFile(filename, content) {
    // VULNERABLE: Path traversal in write
    const filePath = `/tmp/${filename}`;
    console.log('Writing file:', filePath, content);

    return { success: true };
  }
}

class TemplateService {
  static async renderTemplate(templateName, context) {
    return this.renderTemplateContent(templateName, context);
  }

  static async renderTemplateContent(templateName, context) {
    return this.templatePath1(templateName, context);
  }

  static async templatePath1(templateName, context) {
    // VULNERABLE: Server-side template injection
    const templates = {
      'welcome': 'Welcome ${context.username}! Balance: ${context.balance}',
      'profile': 'User: ${context.name}, Email: ${context.email}',
      'message': 'Hello ${context.user}, you have ${context.count} messages'
    };

    const template = templates[templateName] || 'Default: ${context.content}';

    // VULNERABLE: Direct eval-like execution
    return this.interpolateTemplate(template, context);
  }

  static interpolateTemplate(template, context) {
    // VULNERABLE: Template injection via Function constructor
    try {
      return new Function('context', `return \`${template}\`;`)(context);
    } catch (error) {
      return `Template error: ${error.message}`;
    }
  }

  static async renderSafeTemplate(templateName, context) {
    // SAFE: Manual string replacement
    const templates = {
      'welcome': 'Welcome {{username}}! Balance: {{balance}}',
      'profile': 'User: {{name}}, Email: {{email}}',
      'message': 'Hello {{user}}, you have {{count}} messages'
    };

    const template = templates[templateName] || 'Default: {{content}}';
    let result = template;

    Object.entries(context).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }
}

class NotificationService {
  static async sendNotification(type, data) {
    return this.deliverNotification(type, data);
  }

  static async deliverNotification(type, data) {
    return this.notificationPath1(type, data);
  }

  static async notificationPath1(type, data) {
    // VULNERABLE: XSS in notification content
    const notificationHtml = `<div class="notification ${type}">${data.content}</div>`;
    console.log('Sending notification:', notificationHtml);

    // Would inject into DOM
    document.body.insertAdjacentHTML('beforeend', notificationHtml);

    return { success: true };
  }
}

export { CommandService, FileService, TemplateService, NotificationService };