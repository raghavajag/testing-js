/**
 * Authentication Service - User authentication logic
 * Contains SQL injection and weak authentication vulnerabilities
 */

import { DatabaseService } from './databaseService';
import { ValidationUtils } from '../utils/validationUtils';

class AuthService {
  static async authenticateUser(credentials) {
    return this.validateAndAuthenticate(credentials);
  }

  static async validateAndAuthenticate(creds) {
    return this.performAuthentication(creds);
  }

  static async performAuthentication(creds) {
    // Multiple authentication paths
    return this.authPath1(creds);
  }

  static async authPath1(credentials) {
    // VULNERABLE: SQL injection in authentication
    const sql = `SELECT * FROM users WHERE username = '${credentials.username}' AND password_hash = '${this.hashPassword(credentials.password)}'`;
    const result = await DatabaseService.query(sql);
    if (result.rows.length > 0) {
      return { success: true, user: result.rows[0] };
    }
    return { success: false, error: 'Invalid credentials' };
  }

  static async authPath2(credentials) {
    // VULNERABLE: Weak validation
    if (!ValidationUtils.validateUsername(credentials.username)) {
      return { success: false, error: 'Invalid username' };
    }
    return this.authPath1(credentials);
  }

  static async authPath3(credentials) {
    // Additional validation path
    const validation = await ValidationUtils.validateCredentials(credentials);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    return this.performAuthentication(credentials);
  }

  static hashPassword(password) {
    // VULNERABLE: Weak hashing (MD5)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  static async registerUser(userData) {
    return this.validateAndRegister(userData);
  }

  static async validateAndRegister(userData) {
    return this.createUser(userData);
  }

  static async createUser(userData) {
    // VULNERABLE: SQL injection in user creation
    const passwordHash = this.hashPassword(userData.password);
    const sql = `INSERT INTO users (username, password_hash, email) VALUES ('${userData.username}', '${passwordHash}', '${userData.email}')`;
    const result = await DatabaseService.execute(sql);
    return { success: true, userId: result.lastInsertRowId };
  }
}

class UserService {
  static async getUserProfile(userId) {
    return this.fetchUserProfile(userId);
  }

  static async fetchUserProfile(userId) {
    // VULNERABLE: SQL injection in profile fetch
    const sql = `SELECT * FROM users WHERE id = ${userId}`;
    const result = await DatabaseService.query(sql);
    return result.rows[0] || null;
  }

  static async updateUserProfile(userId, profileData) {
    // VULNERABLE: SQL injection in profile update
    const updates = Object.entries(profileData)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ');
    const sql = `UPDATE users SET ${updates} WHERE id = ${userId}`;
    await DatabaseService.execute(sql);
    return { success: true };
  }

  static async searchUsers(searchTerm) {
    // VULNERABLE: SQL injection in search
    const sql = `SELECT * FROM users WHERE username LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`;
    const result = await DatabaseService.query(sql);
    return result.rows;
  }
}

export { AuthService, UserService };