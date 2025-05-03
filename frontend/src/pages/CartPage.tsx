import React from 'react';

const CartPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col space-y-4">
          {/* Cart items will be rendered here */}
          <p className="text-gray-500 text-center py-8">Your cart is empty</p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;