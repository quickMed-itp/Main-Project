import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Upload, ShoppingBag, Truck, Shield, Clock, ArrowRight } from 'lucide-react';
import { mockProducts } from '../data/mockData';

const HomePage: React.FC = () => {
  // Get featured products
  const featuredProducts = mockProducts.filter(product => product.featured).slice(0, 4);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-800 to-secondary-800 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Your Health Is Our Priority
            </h1>
            <p className="text-lg mb-8 text-gray-100">
              Access quality healthcare products and medications from the comfort of your home. 
              Professional advice, fast delivery, and complete care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/products" 
                className="bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 rounded-md font-semibold transition-colors flex items-center justify-center"
              >
                <ShoppingBag className="mr-2" size={18} />
                Shop Now
              </Link>
              <Link 
                to="/upload-prescription" 
                className="bg-transparent hover:bg-white/10 border-2 border-white px-6 py-3 rounded-md font-semibold transition-colors flex items-center justify-center"
              >
                <Upload className="mr-2" size={18} />
                Upload Prescription
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Medicines</h3>
              <p className="text-gray-600">
                Search our extensive catalog of medications and healthcare products.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Prescription</h3>
              <p className="text-gray-600">
                Easily upload your prescription and get medicines delivered to your doorstep.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Online Ordering</h3>
              <p className="text-gray-600">
                Order healthcare products online with our easy-to-use platform.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <Truck size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your medications and products delivered quickly to your location.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">${product.price.toFixed(2)}</span>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg text-primary-600">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Genuine Products</h3>
                <p className="text-gray-600">
                  We source all our products directly from authorized manufacturers to ensure authenticity and quality.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg text-primary-600">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Our efficient logistics network ensures your medications reach you quickly and safely.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg text-primary-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Our customer service team is available round the clock to assist with your queries and concerns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their healthcare needs.
          </p>
          <Link 
            to="/signup" 
            className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold transition-colors inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;