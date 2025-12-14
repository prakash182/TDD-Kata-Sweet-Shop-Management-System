import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import api from '../../services/api'; // <--- Use the centralized service!

interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

const Dashboard: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Get addToCart from Context
  const { addToCart } = useCart();

  const categories = ['chocolate', 'candy', 'gummy', 'hard candy', 'lollipop'];

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      // API Service automatically attaches the Token!
      const response = await api.get('/sweets');
      
      const data = response.data.sweets || response.data;
      if (Array.isArray(data)) {
        setSweets(data);
        setError('');
      } else {
        setSweets([]);
      }
    } catch (err: any) {
      console.error('Error fetching sweets:', err);
      // API Service interceptor handles 401 (Logout), so we just show error here
      setError('Failed to load sweets. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (sweet: Sweet) => {
    // 1. Check Stock
    if (sweet.quantity <= 0) return;

    // 2. Add to Global Cart (Backend Sync happens inside Context)
    await addToCart(sweet);

    // 3. Optional: Visual Feedback (Optimistic UI)
    // We don't reduce database stock yet (that happens at checkout), 
    // but we can visually show "1 less available" if you want.
    /* setSweets(prevSweets => prevSweets.map(item => 
      item._id === sweet._id 
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    )); 
    */
  };

  const filteredSweets = sweets.filter(sweet => {
    const matchesSearch = sweet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || sweet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-xl animate-pulse text-pink-600 font-bold">Loading amazing sweets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-sans">
      {/* Navbar is handled by App.tsx, so we don't need it here */}
      
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
            Taste the Tradition
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Authentic handmade sweets delivered to your doorstep. Experience the royal sweetness in every bite.
          </p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-8 text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="max-w-4xl mx-auto mb-16">
          {/* Search Bar */}
          <div className="relative mb-8 shadow-xl rounded-full group focus-within:ring-4 ring-pink-200 transition-all">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <span className="text-2xl opacity-50">🔍</span>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-16 pr-6 py-4 rounded-full border-none text-lg shadow-sm bg-white/90 backdrop-blur-md placeholder-gray-400 focus:outline-none"
              placeholder="Search for Kaju Katli, Laddu..."
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:shadow-md'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium capitalize transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:shadow-md'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sweets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredSweets.map((sweet) => (
            <div 
              key={sweet._id} 
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={sweet.image || 'https://via.placeholder.com/400?text=Sweet'}
                  alt={sweet.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-gray-800 capitalize shadow-sm">
                    {sweet.category}
                  </span>
                </div>
                {sweet.quantity <= 0 && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                     <span className="text-white font-bold text-xl border-2 border-white px-4 py-2 rounded-lg">SOLD OUT</span>
                   </div>
                )}
              </div>
              
              {/* Card Content */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {sweet.name}
                  </h3>
                  <span className="text-lg font-bold text-pink-600">
                    ₹{sweet.price}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">
                  {sweet.description || 'Delicious handmade sweet delicacy.'}
                </p>
                
                <div className="mt-4">
                  <button
                    onClick={() => handleAddToCart(sweet)}
                    disabled={sweet.quantity <= 0}
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                      sweet.quantity > 0 
                      ? 'bg-gray-900 text-white hover:bg-pink-600 hover:shadow-lg active:scale-95' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {sweet.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSweets.length === 0 && !loading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4 opacity-30">🍪</div>
            <p className="text-gray-500 text-xl font-light">No sweets found matching your taste.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('')}}
              className="mt-4 text-pink-600 hover:text-pink-700 underline font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;