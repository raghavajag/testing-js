/**
 * Cart Service - Shopping cart management
 * Contains order processing vulnerabilities
 */

import { DatabaseService, QueryBuilder } from './databaseService';
import { PricingService, InventoryService } from './productService';

class CartService {
  static async addToCart(userId, productId, quantity) {
    return this.processAddToCart(userId, productId, quantity);
  }

  static async processAddToCart(userId, productId, quantity) {
    return this.cartPath1(userId, productId, quantity);
  }

  static async cartPath1(userId, productId, quantity) {
    // Check stock first
    const inStock = await InventoryService.checkStock(productId, quantity);
    if (!inStock) {
      return { success: false, error: 'Out of stock' };
    }

    // Add to cart
    const sql = QueryBuilder.insert('cart_items', {
      user_id: userId,
      product_id: productId,
      quantity: quantity
    });
    await DatabaseService.execute(sql);

    return { success: true };
  }

  static async getCartItems(userId) {
    return this.fetchCartItems(userId);
  }

  static async fetchCartItems(userId) {
    // VULNERABLE: SQL injection
    const sql = `SELECT * FROM cart_items WHERE user_id = ${userId}`;
    const result = await DatabaseService.query(sql);
    return result.rows;
  }

  static async calculateCartTotal(userId) {
    return this.computeCartTotal(userId);
  }

  static async computeCartTotal(userId) {
    return this.totalPath1(userId);
  }

  static async totalPath1(userId) {
    const cartItems = await this.getCartItems(userId);
    let total = 0;

    for (const item of cartItems) {
      const price = await PricingService.calculatePrice(item.product_id, userId);
      total += price * item.quantity;
    }

    return total;
  }

  static async checkout(userId) {
    return this.processCheckout(userId);
  }

  static async processCheckout(userId) {
    return this.checkoutPath1(userId);
  }

  static async checkoutPath1(userId) {
    const total = await this.calculateCartTotal(userId);
    if (total <= 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Create order
    const orderId = await this.createOrder(userId, total);

    // Clear cart
    await this.clearCart(userId);

    return { success: true, orderId, total };
  }

  static async createOrder(userId, total) {
    // VULNERABLE: SQL injection in order creation
    const sql = `INSERT INTO orders (user_id, total, status) VALUES (${userId}, ${total}, 'pending')`;
    const result = await DatabaseService.execute(sql);
    return result.lastInsertRowId;
  }

  static async clearCart(userId) {
    // VULNERABLE: SQL injection
    const sql = `DELETE FROM cart_items WHERE user_id = ${userId}`;
    await DatabaseService.execute(sql);
    return { success: true };
  }
}

class OrderService {
  static async getUserOrders(userId) {
    return this.fetchUserOrders(userId);
  }

  static async fetchUserOrders(userId) {
    // VULNERABLE: SQL injection
    const sql = `SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC`;
    const result = await DatabaseService.query(sql);
    return result.rows;
  }

  static async updateOrderStatus(orderId, status) {
    // VULNERABLE: SQL injection
    const sql = `UPDATE orders SET status = '${status}' WHERE id = ${orderId}`;
    await DatabaseService.execute(sql);
    return { success: true };
  }
}

export { CartService, OrderService };