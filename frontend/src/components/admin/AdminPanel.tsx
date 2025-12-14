import React, { useState, useEffect } from 'react';
// import Navbar from '../layout/Navbar'; <--- REMOVED THIS LINE
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; 

interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'chocolate',
    price: '',
    quantity: '',
    image: '',
    description: ''
  });

  const categories = ['chocolate', 'candy', 'gummy', 'hard candy', 'lollipop'];

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    } else {
      fetchSweets();
    }
  }, [user, navigate]);

  const fetchSweets = async () => {
    try {
      const response = await api.get('/sweets');
      const sweetsData = response.data.sweets || response.data;
      setSweets(Array.isArray(sweetsData) ? sweetsData : []);
    } catch (err) {
      setError('Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sweetData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        image: formData.image || undefined 
      };

      if (editingSweet) {
        await api.put(`/sweets/${editingSweet._id}`, sweetData);
      } else {
        await api.post('/sweets', sweetData);
      }

      resetForm();
      fetchSweets();
    } catch (err) {
      setError('Failed to save sweet. Please try again.');
    }
  };

  const handleDelete = async (sweetId: string) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) return;
    try {
      await api.delete(`/sweets/${sweetId}`);
      setSweets(prev => prev.filter(s => s._id !== sweetId)); 
    } catch (err) {
      setError('Failed to delete sweet');
      fetchSweets(); 
    }
  };

  const handleRestock = async (sweetId: string, quantity: number) => {
    try {
      await api.post(`/sweets/${sweetId}/restock`, { quantity });
      fetchSweets(); 
    } catch (err) {
      setError('Restock failed');
    }
  };

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
      image: sweet.image || '',
      description: sweet.description || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingSweet(null);
    setFormData({ name: '', category: 'chocolate', price: '', quantity: '', image: '', description: '' });
    setError('');
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar removed to prevent duplication */}
      
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your inventory and stock levels</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition transform hover:-translate-y-1"
          >
            + Add New Sweet
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingSweet ? 'Edit Sweet' : 'Add New Product'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sweet Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                  <button type="button" onClick={resetForm} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-pink-600 text-white rounded-lg font-bold shadow-md hover:bg-pink-700 transition">
                    {editingSweet ? 'Save Changes' : 'Create Sweet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sweets.map((sweet) => (
                <tr key={sweet._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden">
                        {sweet.image ? (
                          <img className="h-12 w-12 object-cover" src={sweet.image} alt="" />
                        ) : (
                          <span className="h-full w-full flex items-center justify-center text-xs text-gray-400">N/A</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{sweet.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800 capitalize">{sweet.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{sweet.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sweet.quantity < 10 ? <span className="text-red-600 font-bold text-sm">{sweet.quantity} (Low)</span> : <span className="text-green-600 font-medium text-sm">{sweet.quantity}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleRestock(sweet._id, 10)} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md text-xs font-bold transition hover:bg-green-100">+ Stock</button>
                      <button onClick={() => handleEdit(sweet)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-xs font-bold transition hover:bg-indigo-100">Edit</button>
                      <button onClick={() => handleDelete(sweet._id)} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-xs font-bold transition hover:bg-red-100">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sweets.length === 0 && <div className="text-center py-12 text-gray-400">No sweets found. Click "Add New Sweet" to start!</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;