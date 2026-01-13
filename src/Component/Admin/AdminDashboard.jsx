import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, ClipboardList, LogOut, Menu, X, 
  UserCircle, ChevronRight, Loader2, RefreshCcw, BarChart3, AlertCircle
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../Context/ContextDataprovider';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/api/admin/stats');
      return response?.data; 
    },
    retry: 1,
    placeholderData: { totalSurveys: 0 }
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post('api/admin/logout'),
    onSuccess: () => {
      queryClient.clear();
      // Using the specific URL you provided
navigate('/login') 
    }
  });

  const menuItems = [
    { name: 'Dashboard', path: '/admindashboard', icon: <LayoutDashboard size={20} /> },
  ];

  // Sidebar component extracted for re-use
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold text-white tracking-tight">AdminPanel</span>
        </div>
        {/* Close button - Only visible on mobile */}
        <button 
          className="lg:hidden text-slate-400 hover:text-white transition-colors" 
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <BarChart3 size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Quick Overview</span>
          </div>
          <p className="text-xs text-slate-400">Total Surveys</p>
          <p className="text-xl font-bold text-white">{isLoading ? '...' : (stats?.totalSurveys ?? 0)}</p>
        </div>

        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </div>
            {location.pathname === item.path && <ChevronRight size={16} />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <UserCircle className="text-slate-500 shrink-0" size={32} />
          <div className="overflow-hidden text-xs">
            <p className="font-bold text-white truncate">{user?.username || 'Admin'}</p>
            <p className="text-slate-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all text-sm font-semibold disabled:opacity-50"
        >
          {logoutMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
          {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      
      {/* 1. MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR - Sliding Drawer Logic */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-slate-900
        lg:translate-x-0 lg:static lg:inset-0 shrink-0 border-r border-slate-200 shadow-sm
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-bold text-slate-800 text-base lg:text-lg tracking-tight truncate">
              System Control
            </h2>
          </div>
          
          <button 
            onClick={() => refetch()} 
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            title="Refresh Stats"
          >
            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* ALERT BOX */}
            {isError && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span>Note: Some dashboard stats couldn't sync, but the system is functional.</span>
              </div>
            )}
            
            {/* NESTED CONTENT */}
            <div className="w-full">
               <Outlet context={{ stats }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;