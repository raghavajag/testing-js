/**
 * Product List Component
 * Uses product hook with complex service orchestration
 */

import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    category: '',
    min_price: '',
    max_price: ''
  });

  const { products, loading, error, searchProducts } = useProducts();

  const handleSearch = async () => {
    const criteria = {};
    if (searchCriteria.name) criteria.name = searchCriteria.name;
    if (searchCriteria.category) criteria.category = searchCriteria.category;
    if (searchCriteria.min_price) criteria.min_price = parseFloat(searchCriteria.min_price);
    if (searchCriteria.max_price) criteria.max_price = parseFloat(searchCriteria.max_price);

    await searchProducts(criteria);
  };

  const handleCriteriaChange = (field) => (e) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Load initial products
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="product-list">
      <h2>Products</h2>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchCriteria.name}
          onChange={handleCriteriaChange('name')}
        />

        <input
          type="text"
          placeholder="Category..."
          value={searchCriteria.category}
          onChange={handleCriteriaChange('category')}
        />

        <input
          type="number"
          placeholder="Min price..."
          value={searchCriteria.min_price}
          onChange={handleCriteriaChange('min_price')}
        />

        <input
          type="number"
          placeholder="Max price..."
          value={searchCriteria.max_price}
          onChange={handleCriteriaChange('max_price')}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="no-products">No products found</div>
      )}
    </div>
  );
};

export default ProductList;