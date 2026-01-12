import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // --- TANSTACK QUERY MUTATION ---
  const authMutation = useMutation({
    mutationFn: async (userData) => {
      // Dynamically pick the endpoint based on isLogin state
      const endpoint = isLogin ? 'api/admin/loginuser' : 'api/admin/registeruser';
      const response = await api.post(endpoint, userData);
      return response.data;
    },
    onSuccess: (data) => {
      // 1. Tell React Query to check the auth status again
      queryClient.invalidateQueries(['checkauth']);
      
      // 2. Role-based navigation
      const roles = data.user?.role || [];
      if (roles.includes('admin')) {
        navigate('/admindashboard');
      } else {
        navigate('/userdashboard');
      }
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Something went wrong");
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Trigger the mutation with form data
    authMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[1000px] flex rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* Left Side (Blue Branding) */}
        <div className="hidden lg:flex w-1/2 bg-blue-600 p-12 flex-col justify-between text-white">
          <div>
            <h1 className="text-4xl font-bold mb-4">Survey Portal</h1>
            <p className="text-blue-100 text-lg">
              {isLogin 
                ? "Welcome back! Access your dashboard and manage your surveys." 
                : "Join us today and start gathering impactful data across the region."}
            </p>
          </div>
          <div className="bg-blue-500/30 p-6 rounded-2xl backdrop-blur-sm border border-blue-400/30">
            <p className="italic text-sm">"Data is a precious thing and will last longer than the systems themselves."</p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Show Username field ONLY during Signup */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="username"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                    placeholder="Enter username"
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  placeholder="name@company.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={authMutation.isPending}
              className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all ${
                authMutation.isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {authMutation.isPending ? "Processing..." : isLogin ? "Login Now" : "Register Now"}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"} 
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-blue-600 hover:underline"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;