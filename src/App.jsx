import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home'; 
import LoginPage from './Component/Login';
import AdminDashboard from './Component/Admin/AdminDashboard';
import AdminSurveyList from './Component/Admin/AdminSurveyList';
import AdminHome from './Component/Admin/AdminHome'; // Import this
import MySurveys from './Component/MySurvey';
import { useAuth } from './Component/Context/ContextDataprovider';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = user?.role?.includes('admin');
  const isUser = user?.role?.includes('user');

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/mysurveys" element={<MySurveys/>} />
        
        <Route 
          path="/userdashboard" 
          element={isUser ? <Home /> : <Navigate to="/login" replace />} 
        />

        {/* --- ADMIN ROUTES --- */}
        <Route 
          path="/admindashboard" 
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />}
        >
          {/* This is the default page when going to /admindashboard */}
          
          <Route index  element={<AdminSurveyList />} />
        </Route>

        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : (
            isAdmin ? <Navigate to="/admindashboard" replace /> : <Navigate to="/userdashboard" replace />
          )} 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;