import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompanyDetails from './pages/CompanyDetails';
import CompanyDetailsForm from './pages/CompanyDetailsForm';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  
  if (auth.loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-indigo-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// App Component with Router
const AppWithRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

// Routes Component
const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/company-details/:id" 
          element={
            <ProtectedRoute>
              <CompanyDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company-details-form" 
          element={
            <ProtectedRoute>
              <CompanyDetailsForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company-details-form/:id" 
          element={
            <ProtectedRoute>
              <CompanyDetailsForm />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default AppWithRouter;