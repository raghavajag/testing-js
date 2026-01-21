/**
 * Shopping Cart Component
 * Uses cart hook with checkout functionality
 */

import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useProducts';
import { useAppContext } from '../contexts/AppContext';

const Cart = () => {
  const { user } = useAppContext();
  const { cartItems, total, loading, error, getCartTotal, checkout, refreshCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (user) {
      refreshCart(user.id);
    }
  }, [user, refreshCart]);

  const handleCheckout = async () => {
    if (!user) return;

    setCheckingOut(true);
    try {
      const result = await checkout(user.id);
      if (result.success) {
        alert(`Order placed! Order ID: ${result.orderId}, Total: $${result.total}`);
      } else {
        alert('Checkout failed: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (!user) {
    return <div>Please login to view your cart</div>;
  }

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>

      {error && <div className="error">{error}</div>}

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div>Your cart is empty</div>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <span>Product {item.product_id}</span>
              <span>Quantity: {item.quantity}</span>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-total">
          <strong>Total: ${total.toFixed(2)}</strong>
          <button
            onClick={handleCheckout}
            disabled={checkingOut || loading}
          >
            {checkingOut ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;