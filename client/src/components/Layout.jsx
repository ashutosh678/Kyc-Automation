import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll-to-top button
      setShowScrollTop(window.scrollY > 300);
      
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
          style={{ width: `${scrollProgress}%`, transition: 'width 0.2s ease' }}
        />
      </div>
      
      {/* Main Content with padding for fixed header */}
      <main className="flex-grow pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className={`fixed right-6 bottom-6 bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700 transition-all duration-300 z-40 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
      
      <Footer />
    </div>
  );
};

export default Layout;