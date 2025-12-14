import React from 'react';
import { useCart } from '../../context/CartContext';
// import Navbar from '../layout/Navbar'; <--- REMOVED THIS
import { useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar Removed: handled by App.tsx */}
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold mb-10 text-gray-800 flex items-center gap-3">
          🛒 Your Sweet Stash
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🍪</div>
            <p className="text-xl text-gray-500 mb-6">Your cart is empty.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              {cart.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition-transform hover:shadow-md">
                  {/* Image */}
                  <div className="w-full sm:w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                     {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                     )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                    <p className="text-pink-600 font-medium">₹{item.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-pink-600 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-pink-600"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="text-gray-400 hover:text-red-500 font-medium transition-colors p-2"
                    title="Remove Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
                
                <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-extrabold mb-8 text-gray-900">
                  <span>Total</span>
                  <span className="text-pink-600">₹{cartTotal}</span>
                </div>

                {/* --- THIS BUTTON IS UPDATED --- */}
                <button 
                  onClick={() => navigate('/payment')} 
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition transform hover:-translate-y-1 shadow-md"
                >
                  Checkout Now
                </button>
                
                <p className="text-xs text-center text-gray-400 mt-4">
                  Secure Checkout • 100% Satisfaction Guaranteed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;