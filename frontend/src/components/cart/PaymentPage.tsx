import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const PaymentPage: React.FC = () => {
  const { cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('upi'); // Default to UPI

  // Redirect if cart is empty
  useEffect(() => {
    if (cartTotal === 0 && !success) {
      navigate('/dashboard');
    }
  }, [cartTotal, navigate, success]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate Network Delay
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      clearCart();
    }, 3000); // 3 seconds for UPI feels more real
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full animate-fade-in-up">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-8">
            {paymentMethod === 'upi' ? 'UPI Transaction ID: 831203912' : 'Card ending in 4242 charged.'}
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-gray-500 flex items-center justify-center gap-2 mt-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Encrypted Connection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Tax (5%)</span>
              <span>₹{Math.floor(cartTotal * 0.05)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
              <span>Total to Pay</span>
              <span className="text-pink-600">₹{cartTotal + Math.floor(cartTotal * 0.05)}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
            
            {/* Loading Overlay */}
            {processing && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                {paymentMethod === 'upi' ? (
                  <>
                    <div className="animate-pulse mb-4">
                      <span className="text-4xl">📱</span>
                    </div>
                    <p className="font-bold text-gray-800 text-lg">Check your UPI App</p>
                    <p className="text-sm text-gray-500 mt-1">Request sent to your VPA</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-gray-700">Processing Payment...</p>
                  </>
                )}
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-800 mb-6">Select Payment Method</h3>

            {/* Payment Method Tabs */}
            <div className="flex gap-4 mb-8">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'upi'
                    ? 'border-pink-600 bg-pink-50 text-pink-700'
                    : 'border-gray-200 text-gray-500 hover:border-pink-200'
                }`}
              >
                <span>📱</span> UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'card'
                    ? 'border-pink-600 bg-pink-50 text-pink-700'
                    : 'border-gray-200 text-gray-500 hover:border-pink-200'
                }`}
              >
                <span>💳</span> Card
              </button>
            </div>
            
            <form onSubmit={handlePayment} className="space-y-5">
              
              {/* UPI FORM */}
              {paymentMethod === 'upi' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID / VPA</label>
                  <div className="relative">
                    <input 
                      required 
                      type="text" 
                      placeholder="mobile_number@upi" 
                      className="w-full pl-4 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:outline-none transition" 
                    />
                    <div className="absolute right-3 top-3.5">
                      <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-1 rounded">VERIFY</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                      <div key={app} className="flex-shrink-0 border px-3 py-1 rounded-md text-xs font-medium text-gray-500 cursor-pointer hover:border-pink-500 hover:text-pink-600">
                        {app}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    We will send a payment request to your UPI app. Please approve it within 5 minutes.
                  </p>
                </div>
              )}

              {/* CARD FORM */}
              {paymentMethod === 'card' && (
                <div className="animate-fade-in space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:outline-none transition font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                      <input required type="text" placeholder="MM/YY" maxLength={5} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:outline-none text-center" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input required type="password" placeholder="123" maxLength={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:outline-none text-center" />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition transform hover:-translate-y-1 shadow-md mt-6"
              >
                Pay ₹{cartTotal + Math.floor(cartTotal * 0.05)}
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;