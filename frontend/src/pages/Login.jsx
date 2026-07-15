// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import jj from "../assets/register.     jpg";
import { login } from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const dataToSubmit = {
        email: formData.email,
        password: formData.password,
      };

      const response = await login(dataToSubmit);

      if (response?.data?.success) {
        toast.success(response?.data?.message || 'Login successful!');
        
        
        const userData = response?.data?.user;
        
       
        if (formData.rememberMe) {
          localStorage.setItem('token', response?.data?.token);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('token', response?.data?.token);
          sessionStorage.setItem('user', JSON.stringify(userData));
        }

        setFormData({
          email: '',
          password: '',
          rememberMe: false,
        });

        
        setTimeout(() => {
          if (userData?.role === 'trainer') {
            navigate('/trainerdash'); 
          } else {
            navigate('/dashboard');
          }
        }, 1000);

      } else {
        toast.error(response?.data?.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid credentials");
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200')] bg-cover bg-center opacity-20"></div>
      
      <div className="relative w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to continue your fitness journey</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <span 
                onClick={handleForgotPassword}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium cursor-pointer"
              >
                Forgot Password?
              </span>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-200"
            >
              Log In
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <span 
                onClick={() => navigate('/')}
                className="text-orange-600 hover:text-orange-700 font-medium cursor-pointer"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>

        <div className="hidden md:block relative h-full">
          <img 
            src={jj} 
            alt="Fitness workout" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;