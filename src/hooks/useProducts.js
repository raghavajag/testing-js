/**
 * Products Hook - Product management and cart functionality
 * Complex orchestration of multiple services
 */

import { useState, useCallback, useEffect } from 'react';
import { ProductService, PricingService } from '../services/productService';
import { CartService } from '../services/cartService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchProducts = useCallback(async (criteria) => {
    return searchHandler(criteria);
  }, []);

  const searchHandler = async (criteria) => {
    setLoading(true);
    setError(null);

    try {
      const result = await ProductService.searchProducts(criteria);
      setProducts(result);
      return { success: true, products: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = useCallback(async (productId, userId = null) => {
    return detailsHandler(productId, userId);
  }, []);

  const detailsHandler = async (productId, userId) => {
    try {
      const product = await ProductService.getProductDetails(productId);
      if (product && userId) {
        const price = await PricingService.calculatePrice(productId, userId);
        product.calculatedPrice = price;
      }
      return { success: true, product };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    products,
    loading,
    error,
    searchProducts,
    getProductDetails
  };
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToCart = useCallback(async (userId, productId, quantity) => {
    return cartAddHandler(userId, productId, quantity);
  }, []);

  const cartAddHandler = async (userId, productId, quantity) => {
    setLoading(true);
    setError(null);

    try {
      const result = await CartService.addToCart(userId, productId, quantity);
      if (result.success) {
        // Refresh cart
        await refreshCart(userId);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = useCallback(async (userId) => {
    return totalHandler(userId);
  }, []);

  const totalHandler = async (userId) => {
    try {
      const cartTotal = await CartService.calculateCartTotal(userId);
      setTotal(cartTotal);
      return { success: true, total: cartTotal };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const checkout = useCallback(async (userId) => {
    return checkoutHandler(userId);
  }, []);

  const checkoutHandler = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await CartService.checkout(userId);
      if (result.success) {
        setCartItems([]);
        setTotal(0);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = useCallback(async (userId) => {
    return refreshHandler(userId);
  }, []);

  const refreshHandler = async (userId) => {
    try {
      const items = await CartService.getCartItems(userId);
      setCartItems(items);
      await totalHandler(userId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    cartItems,
    total,
    loading,
    error,
    addToCart,
    getCartTotal,
    checkout,
    refreshCart
  };
};