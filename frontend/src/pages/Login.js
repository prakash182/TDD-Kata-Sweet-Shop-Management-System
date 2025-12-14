import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Use the file you just created

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Send credentials to backend
      const res = await api.post('/auth/login', { email, password });
      
      // 2. CRITICAL STEP: Save the token! 
      // This is what api.js looks for later.
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user)); // Optional: save user info
      
      alert('Login Successful!');
      navigate('/'); // Go to home page
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4 border rounded max-w-sm mx-auto mt-10">
      <h2 className="text-xl mb-4">Login</h2>
      <input 
        className="border p-2 w-full mb-2" 
        placeholder="Email" 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password"
        className="border p-2 w-full mb-4" 
        placeholder="Password" 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button className="bg-blue-500 text-white p-2 w-full">Login</button>
    </form>
  );
};

export default Login;