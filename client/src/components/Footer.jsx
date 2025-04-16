import React from 'react';
import { Mail, Phone, MapPin, Github as GitHub, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-4">KYC Document Checklist</h3>
            <p className="text-gray-300 mb-6 pr-4">
              Streamlining KYC processes with AI-powered document verification and checklist automation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-blue-600 hover:text-white transition duration-300">
                <GitHub size={20} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-blue-400 hover:text-white transition duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:bg-blue-700 hover:text-white transition duration-300">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Services</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Terms & Conditions</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="mr-3 text-blue-400 flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-300">
                  1234 Business Avenue, Suite 500<br />Tech District, CA 94107
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 text-blue-400" size={18} />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-white transition">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 text-blue-400" size={18} />
                <a href="mailto:info@kycchecklist.com" className="text-gray-300 hover:text-white transition">info@kycchecklist.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} KYC Document Checklist. All Rights Reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 text-sm hover:text-white transition">Privacy Policy</a>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition">Terms of Service</a>
              <a href="#" className="text-gray-400 text-sm hover:text-white transition">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;