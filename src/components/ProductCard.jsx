/**
 * Product Card Component
 * Handles product display and cart addition
 */

import React, { useState } from 'react';
import { useCart } from '../hooks/useProducts';
import { useAppContext } from '../contexts/AppContext';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { user } = useAppContext();
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    setAdding(true);
    try {
      const result = await addToCart(user.id, product.id, quantity);
      if (result.success) {
        alert('Added to cart!');
      } else {
        alert('Failed to add to cart: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="product-price">${product.price}</div>

      <div className="add-to-cart">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
        <button
          onClick={handleAddToCart}
          disabled={adding || !user}
        >
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;