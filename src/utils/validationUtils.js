/**
 * Validation Utilities - Input validation functions
 * Contains weak validation that can be bypassed
 */

class ValidationUtils {
  static validateEmail(email) {
    return this.emailPath1(email);
  }

  static emailPath1(email) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUsername(username) {
    return this.usernamePath1(username);
  }

  static usernamePath1(username) {
    // Basic username validation
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
  }

  static validatePassword(password) {
    return this.passwordPath1(password);
  }

  static passwordPath1(password) {
    // Weak password validation
    return password.length >= 6;
  }

  static validateCredentials(credentials) {
    return this.credentialsPath1(credentials);
  }

  static credentialsPath1(credentials) {
    const errors = [];

    if (!this.validateUsername(credentials.username)) {
      errors.push('Invalid username');
    }

    if (!this.validatePassword(credentials.password)) {
      errors.push('Invalid password');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  static sanitizeHTML(html) {
    return this.htmlPath1(html);
  }

  static htmlPath1(html) {
    // VULNERABLE: Only removes script tags
    return html.replace(/<script[^>]*>.*?<\/script>/gi, '');
  }

  static sanitizeSQL(input) {
    return this.sqlPath1(input);
  }

  static sqlPath1(input) {
    // VULNERABLE: Only escapes single quotes
    return String(input).replace(/'/g, "''");
  }

  static validateURL(url) {
    return this.urlPath1(url);
  }

  static urlPath1(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

class SearchUtils {
  static buildSearchQuery(searchTerm, fields) {
    return this.searchPath1(searchTerm, fields);
  }

  static searchPath1(searchTerm, fields) {
    // VULNERABLE: SQL injection in search query building
    const conditions = fields.map(field => `${field} LIKE '%${searchTerm}%'`);
    return conditions.join(' OR ');
  }

  static highlightSearchTerm(text, searchTerm) {
    return this.highlightPath1(text, searchTerm);
  }

  static highlightPath1(text, searchTerm) {
    // VULNERABLE: XSS in search highlighting
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  static escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

class FormatUtils {
  static formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
  }

  static formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  static truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

export { ValidationUtils, SearchUtils, FormatUtils };