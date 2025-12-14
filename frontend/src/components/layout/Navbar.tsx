import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom'; // 1. Import useLocation
import { useCart } from '../../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 2. Get current location
  
  const { cartItemCount } = useCart(); 

  // 3. Define paths where Navbar should NOT appear
  const hideNavbarRoutes = ['/login', '/register'];

  // 4. Return null if on login or register page
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-md border-b border-pink-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="text-3xl mr-2">🍭</span>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Royal Sweet
            </span>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            
            {/* Shopping Cart Icon (Only show if user is logged in) */}
            {user && (
              <button 
                className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors duration-200"
                onClick={() => navigate('/cart')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                
                {/* Badge for Item Count */}
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User Info & Actions */}
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-sm flex flex-col items-end">
                    <span className="text-gray-500 text-xs">Welcome back,</span>
                    <span className="font-semibold text-gray-800">{user.name}</span>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Admin Panel
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
               // If for some reason a non-logged-in user sees this (e.g. public dashboard), show Login button
               <button
                  onClick={() => navigate('/login')}
                  className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-700 transition-colors"
                >
                  Login
                </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;