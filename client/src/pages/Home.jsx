import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, FilePlus, User, ShieldCheck, BarChart2, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* Hero Section with Gradient Background */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 text-white py-20 px-4 rounded-lg shadow-xl mb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                KYC Document Verification <span className="text-blue-300">Simplified</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Our AI-powered platform streamlines the KYC process with automated document verification and intelligent checklist management.
              </p>
              
              {isAuthenticated ? (
                <Link
                  to="/company-details-form"
                  className="inline-flex items-center bg-white text-indigo-800 px-8 py-4 rounded-md font-semibold hover:bg-blue-100 transition shadow-lg"
                >
                  <FilePlus size={20} className="mr-2" /> Start Verification Process
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center bg-white text-indigo-800 px-6 py-3 rounded-md font-semibold hover:bg-blue-100 transition shadow-lg"
                  >
                    <User size={20} className="mr-2" /> Login
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:bg-opacity-10 transition shadow-lg"
                  >
                    Register Account
                  </Link>
                </div>
              )}
            </div>
            
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="KYC Document Verification" 
                className="rounded-lg shadow-2xl" 
              />
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;