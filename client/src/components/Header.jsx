import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, User, Menu, X, ChevronDown, FileCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path ? "text-blue-200 font-medium" : "";
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gradient-to-r from-blue-900 to-indigo-800 shadow-lg py-2"
          : "bg-gradient-to-r from-blue-800 to-indigo-700 py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center space-x-2"
          onClick={closeMenu}
        >
          <FileCheck size={28} className="text-white" />
          <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
            KYC Document Checklist
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8 items-center">
            <li>
              <Link
                to="/"
                className={`text-white hover:text-blue-200 transition ${isActive(
                  "/"
                )}`}
              >
                Home
              </Link>
            </li>

            {isAuthenticated && user ? (
              <>
                <li>
                  <Link
                    to={`/company-details/${user.userId}`}
                    className={`text-white hover:text-blue-200 transition ${isActive(
                      `/company-details/${user.userId}`
                    )}`}
                  >
                    Documents
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="bg-white text-indigo-700 px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition flex items-center"
                  >
                    <LogOut size={16} className="mr-1" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className={`text-white hover:text-blue-200 transition ${isActive(
                      "/login"
                    )}`}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="bg-white text-indigo-700 px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition flex items-center"
                  >
                    <User size={16} className="mr-1" /> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-800 pb-4 px-4 absolute top-full left-0 right-0 shadow-lg">
          <ul className="space-y-4">
            <li>
              <Link
                to="/"
                className={`block text-white hover:text-blue-200 py-2 ${isActive(
                  "/"
                )}`}
                onClick={closeMenu}
              >
                Home
              </Link>
            </li>

            {isAuthenticated && user ? (
              <>
                <li>
                  <Link
                    to={`/company-details/${user.userId}`}
                    className={`block text-white hover:text-blue-200 py-2 ${isActive(
                      `/company-details/${user.userId}`
                    )}`}
                    onClick={closeMenu}
                  >
                    Documents
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center text-white hover:text-blue-200 py-2"
                  >
                    <LogOut size={18} className="mr-2" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className={`block text-white hover:text-blue-200 py-2 ${isActive(
                      "/login"
                    )}`}
                    onClick={closeMenu}
                  >
                    <User size={18} className="inline mr-2" /> Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className={`block text-white hover:text-blue-200 py-2 ${isActive(
                      "/signup"
                    )}`}
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
