/**
 * Product Service - E-commerce product management
 * Contains search and pricing vulnerabilities
 */

import { DatabaseService, QueryBuilder } from './databaseService';

class ProductService {
  static async searchProducts(searchCriteria) {
    return this.performProductSearch(searchCriteria);
  }

  static async performProductSearch(criteria) {
    return this.searchPath1(criteria);
  }

  static async searchPath1(criteria) {
    // VULNERABLE: Dynamic query building
    const baseQuery = "SELECT * FROM products WHERE active = 1";
    const sql = QueryBuilder.complex(baseQuery, criteria);
    const result = await DatabaseService.query(sql);
    return result.rows;
  }

  static async searchPath2(criteria) {
    // Alternative search path
    const conditions = {};
    if (criteria.name) conditions.name = criteria.name;
    if (criteria.category) conditions.category = criteria.category;

    const sql = QueryBuilder.select('products', conditions);
    const result = await DatabaseService.query(sql);
    return result.rows;
  }

  static async getProductDetails(productId) {
    return this.fetchProductDetails(productId);
  }

  static async fetchProductDetails(productId) {
    // VULNERABLE: SQL injection
    const sql = `SELECT * FROM products WHERE id = ${productId}`;
    const result = await DatabaseService.query(sql);
    return result.rows[0] || null;
  }

  static async updateProduct(productId, productData) {
    // VULNERABLE: SQL injection in update
    const conditions = { id: productId };
    const sql = QueryBuilder.update('products', productData, conditions);
    await DatabaseService.execute(sql);
    return { success: true };
  }
}

class PricingService {
  static async calculatePrice(productId, userId = null) {
    return this.computeProductPrice(productId, userId);
  }

  static async computeProductPrice(productId, userId) {
    return this.pricingPath1(productId, userId);
  }

  static async pricingPath1(productId, userId) {
    // Get base price
    const product = await ProductService.getProductDetails(productId);
    if (!product) return 0;

    let price = product.price;

    // Apply discounts if user provided
    if (userId) {
      const discount = await DiscountService.getUserDiscount(userId);
      price = price * (1 - discount);
    }

    return price;
  }
}

class DiscountService {
  static async getUserDiscount(userId) {
    return this.calculateDiscount(userId);
  }

  static async calculateDiscount(userId) {
    return this.discountPath1(userId);
  }

  static async discountPath1(userId) {
    // Get user order count
    const orderCount = await this.getUserOrderCount(userId);

    if (orderCount > 10) return 0.15; // 15% discount
    if (orderCount > 5) return 0.10;  // 10% discount
    if (orderCount > 2) return 0.05;  // 5% discount

    return 0; // No discount
  }

  static async getUserOrderCount(userId) {
    // VULNERABLE: SQL injection
    const sql = `SELECT COUNT(*) as count FROM orders WHERE user_id = ${userId}`;
    const result = await DatabaseService.query(sql);
    return result.rows[0]?.count || 0;
  }
}

class InventoryService {
  static async checkStock(productId, quantity) {
    return this.verifyStock(productId, quantity);
  }

  static async verifyStock(productId, quantity) {
    return this.stockPath1(productId, quantity);
  }

  static async stockPath1(productId, quantity) {
    // VULNERABLE: SQL injection
    const sql = `SELECT stock_quantity FROM products WHERE id = ${productId}`;
    const result = await DatabaseService.query(sql);
    const stock = result.rows[0]?.stock_quantity || 0;
    return stock >= quantity;
  }

  static async updateStock(productId, quantityChange) {
    // VULNERABLE: SQL injection
    const sql = `UPDATE products SET stock_quantity = stock_quantity + ${quantityChange} WHERE id = ${productId}`;
    await DatabaseService.execute(sql);
    return { success: true };
  }
}

export { ProductService, PricingService, DiscountService, InventoryService };