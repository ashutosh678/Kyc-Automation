import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset error when inputs change
    if (email || password) {
      setError('');
    }
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Log in to access your KYC document dashboard</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fadeIn">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
      >
        <div className="mb-5">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail size={18} />
            </span>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>
        
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-gray-700 font-medium">
              Password
            </label>
           
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Keep me signed in</span>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition transform duration-200 flex items-center justify-center shadow-md"
        >
          {isLoading ? (
            <>
              <span className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
              Logging in...
            </>
          ) : (
            <>
              Sign In <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </button>
        
        <div className="relative flex items-center justify-center mt-8 mb-6">
          <div className="border-t border-gray-300 flex-grow"></div>
          <div className="mx-4 text-gray-500 text-sm font-medium">OR</div>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>
        
        <button
          type="button"
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center mb-4"
        >
          
          <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center ">
            Create an account <UserPlus size={16} className="ml-1" />
          </Link>
        </button>
      </form>
      
    </div>
  );
};

export default Login;