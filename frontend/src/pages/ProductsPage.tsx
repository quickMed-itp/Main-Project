import React, { useState, useEffect } from 'react';
import { Filter, Search, X, ShoppingCart, Heart, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  mainImage: string;
  subImages: string[];
  totalStock: number;
  price: number;
  createdAt: string;
}

const ProductsPage: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/v1/products');
        setProducts(response.data.data.products);
        setFilteredProducts(response.data.data.products);
        
        // Set max price for range slider
        const maxPrice = Math.max(...response.data.data.products.map((p: Product) => p.price));
        setPriceRange([0, Math.ceil(maxPrice)]);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  // Handle filtering and sorting
  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(product => product.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
      );
    }
    
    // Filter by price range
    result = result.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Sort products
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sort by newest first
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    setFilteredProducts(result);
  }, [products, activeCategory, searchQuery, sortOption, priceRange]);
  
  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: `http://localhost:5000/uploads/${product.mainImage}`,
      quantity: 1,
    });
    
    if (window.showToast) {
      window.showToast.success(`Added ${product.name} to cart`);
    }
  };
  
  const resetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSortOption('');
    setPriceRange([0, Math.max(...products.map(p => p.price))]);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Products</h1>
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <button
            onClick={toggleFilters}
            className="md:hidden bg-white border border-gray-300 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
          
          <div className="flex-shrink-0 relative w-full md:w-48">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            <ArrowUpDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-64 bg-white p-4 rounded-lg shadow-sm h-fit sticky top-24">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`block px-2 py-1 rounded-md w-full text-left ${
                    activeCategory === 'all'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Products
                </button>
                {Array.from(new Set(products.map(p => p.category))).map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`block px-2 py-1 rounded-md w-full text-left ${
                      activeCategory === category
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Price Range</h3>
              <div className="px-2">
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </aside>
          
          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
              <div className="bg-white w-full rounded-t-xl p-4 animate-slide-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button onClick={toggleFilters} className="text-gray-500">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Categories</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveCategory('all');
                        toggleFilters();
                      }}
                      className={`block px-2 py-1 rounded-md w-full text-left ${
                        activeCategory === 'all'
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      All Products
                    </button>
                    {Array.from(new Set(products.map(p => p.category))).map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          setActiveCategory(category);
                          toggleFilters();
                        }}
                        className={`block px-2 py-1 rounded-md w-full text-left ${
                          activeCategory === category
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <div className="px-2">
                    <input
                      type="range"
                      min={priceRange[0]}
                      max={priceRange[1]}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">${priceRange[0]}</span>
                      <span className="text-sm text-gray-600">${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      resetFilters();
                      toggleFilters();
                    }}
                    className="flex-1 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700"
                  >
                    Reset
                  </button>
                  <button
                    onClick={toggleFilters}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-md text-sm font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <Link to={`/products/${product._id}`} className="block relative h-48 overflow-hidden group">
                      <img
                        src={`http://localhost:5000/uploads/${product.mainImage}`}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Add to favorites"
                      >
                        <Heart size={18} className="text-gray-600 hover:text-error-500" />
                      </button>
                    </Link>
                    <div className="p-4">
                      <p className="text-sm text-primary-600 font-medium mb-1">{product.category}</p>
                      <Link to={`/products/${product._id}`}>
                        <h3 className="text-lg font-semibold mb-1 text-gray-800 hover:text-primary-600">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-baseline">
                          <span className="text-lg font-bold text-gray-800">${product.price.toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full transition-colors"
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                      
                      {product.totalStock < 10 && (
                        <p className="text-xs text-warning-600 mt-2">
                          Only {product.totalStock} left in stock
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-600 mb-3">No products found matching your criteria.</p>
                <button
                  onClick={resetFilters}
                  className="text-primary-600 font-medium hover:text-primary-700"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;