import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Shield, Truck, RefreshCw, Star, StarHalf, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/useAuth';

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

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/v1/products/${id}`);
        setProduct(response.data.data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={18} className="text-yellow-400 fill-current" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} size={18} className="text-yellow-400 fill-current" />);
      } else {
        stars.push(<Star key={i} size={18} className="text-gray-300" />);
      }
    }

    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested product could not be found.'}</p>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/products"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Products
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="relative">
            <img
              src={`http://localhost:5000/uploads/${product.mainImage}`}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-lg"
            />
            <button
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
              aria-label="Add to favorites"
            >
              <Heart size={20} className="text-gray-600 hover:text-error-500" />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="text-sm text-primary-600 font-medium">{product.category}</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  {renderStars(4.5)}
                  <span className="ml-2 text-sm text-gray-600">4.5 (128 reviews)</span>
                </div>
              </div>
              <div className="flex items-baseline mt-4">
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-sm text-gray-600">
                <Shield size={18} className="text-success-500 mr-2" />
                <span>Genuine Product Guarantee</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Truck size={18} className="text-primary-500 mr-2" />
                <span>Free Delivery on orders above $50</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <RefreshCw size={18} className="text-accent-500 mr-2" />
                <span>30-Day Return Policy</span>
              </div>
            </div>

            {product.totalStock > 0 ? (
              <div className="mt-auto">
                <div className="mb-4">
                  <span className="text-sm text-gray-600">
                    Status: {' '}
                    <span className="text-success-600 font-medium">In Stock</span>
                    {product.totalStock < 10 && (
                      <span className="text-warning-600 ml-2">
                        (Only {product.totalStock} left)
                      </span>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 flex items-center justify-center"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Add to Cart
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg cursor-not-allowed mt-auto"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="border-t border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-2">Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>High-quality materials</li>
                <li>Durable construction</li>
                <li>Easy to use</li>
                <li>Compact and portable</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Specifications</h3>
              <div className="space-y-2 text-gray-600">
                <div className="grid grid-cols-2">
                  <span className="font-medium">Category:</span>
                  <span>{product.category}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Brand:</span>
                  <span>{product.brand}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">SKU:</span>
                  <span>{product._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Customer Reviews</h2>
            <button className="text-primary-600 hover:text-primary-700 flex items-center">
              <MessageSquare size={18} className="mr-2" />
              Write a Review
            </button>
          </div>

          {/* Review Form */}
          {isAuthenticated && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-medium mb-4">Write Your Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
              />
              <button className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                Submit Review
              </button>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {/* Sample reviews - Replace with real data when available */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {renderStars(5)}
                  <span className="ml-2 text-sm text-gray-600">John Doe</span>
                </div>
                <span className="ml-4 text-sm text-gray-500">2025-02-15</span>
              </div>
              <p className="text-gray-600">Excellent product! Works exactly as described and arrived quickly.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {renderStars(4)}
                  <span className="ml-2 text-sm text-gray-600">Jane Smith</span>
                </div>
                <span className="ml-4 text-sm text-gray-500">2025-02-10</span>
              </div>
              <p className="text-gray-600">Good quality product, but delivery took longer than expected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;