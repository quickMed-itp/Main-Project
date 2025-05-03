import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Shield, Truck, RefreshCw, Star, StarHalf, MessageSquare } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/useAuth';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const product = mockProducts.find(p => p.id === id);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      userName: 'John Doe',
      rating: 5,
      date: '2025-02-15',
      comment: 'Excellent product! Works exactly as described and arrived quickly.',
      verified: true,
    },
    {
      id: 2,
      userName: 'Jane Smith',
      rating: 4,
      date: '2025-02-10',
      comment: 'Good quality product, but delivery took longer than expected.',
      verified: true,
    },
    {
      id: 3,
      userName: 'Mike Johnson',
      rating: 5,
      date: '2025-02-05',
      comment: 'Very satisfied with the purchase. Will buy again!',
      verified: false,
    },
  ];

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    if (window.showToast) {
      window.showToast.success(`Added ${product.name} to cart`);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      if (window.showToast) {
        window.showToast.error('Please select a rating');
      }
      return;
    }

    if (!reviewText.trim()) {
      if (window.showToast) {
        window.showToast.error('Please enter your review');
      }
      return;
    }

    // Here you would typically submit the review to your backend
    if (window.showToast) {
      window.showToast.success('Review submitted successfully!');
    }
    setReviewText('');
    setRating(0);
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            className={`${interactive ? 'cursor-pointer' : ''} p-0.5`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          >
            <Star
              size={interactive ? 24 : 18}
              className={`${
                star <= (hoveredRating || rating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              } ${interactive ? 'hover:text-yellow-400' : ''}`}
            />
          </button>
        ))}
      </div>
    );
  };

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
              src={product.image}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-lg"
            />
            {product.discount && (
              <div className="absolute top-4 left-4 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {product.discount}% OFF
              </div>
            )}
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
                {product.discount && (
                  <span className="ml-3 text-lg text-gray-500 line-through">
                    ${(product.price * (1 + product.discount / 100)).toFixed(2)}
                  </span>
                )}
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

            {product.inStock > 0 ? (
              <div className="mt-auto">
                <div className="mb-4">
                  <span className="text-sm text-gray-600">
                    Status: {' '}
                    <span className="text-success-600 font-medium">In Stock</span>
                    {product.inStock < 10 && (
                      <span className="text-warning-600 ml-2">
                        (Only {product.inStock} left)
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
                  <span className="font-medium">SKU:</span>
                  <span>{product.id}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Tags:</span>
                  <span>{product.tags?.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Customer Reviews</h2>
            <div className="flex items-center space-x-2">
              <MessageSquare size={20} className="text-gray-600" />
              <span className="text-gray-600">{reviews.length} Reviews</span>
            </div>
          </div>

          {/* Review Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                {renderStars(rating, true)}
              </div>
              <div className="mb-4">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  id="review"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Share your thoughts about the product..."
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="mb-8 bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Please sign in to write a review</p>
              <Link
                to="/signin"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-gray-800">{review.userName}</p>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
                {review.verified && (
                  <div className="flex items-center mb-2">
                    <Shield size={14} className="text-success-500 mr-1" />
                    <span className="text-sm text-success-600">Verified Purchase</span>
                  </div>
                )}
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;