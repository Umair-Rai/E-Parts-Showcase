import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../logo.jpg';

export default function Footer() {
  const navigate = useNavigate();
  const [topCategories, setTopCategories] = useState([]);

  // Fetch top 4 categories
  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        const response = await axios.get('https://eme6.com/api/categories');
        // Get first 4 categories
        setTopCategories(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching categories for footer:', error);
        // ✅ No toast error - silently fallback to default categories
        setTopCategories([
          { id: 1, name: "Mechanical Seals" },
          { id: 2, name: "Aluminium Pulleys" },
          { id: 3, name: "Water Pump Parts" },
          { id: 4, name: "Generator AVRs" }
        ]);
      }
    };

    fetchTopCategories();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (categoryName) => {
    // Navigate to category page
    navigate('/category');
    
    // Small delay to ensure page loads, then trigger search
    setTimeout(() => {
      // Dispatch custom event with category name
      window.dispatchEvent(new CustomEvent('footerCategorySearch', { 
        detail: { categoryName } 
      }));
    }, 100);
    
    scrollToTop();
  };

  return (
    <footer className="bg-slate-800 text-white px-4 md:px-16 py-8">
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-black rounded-full w-12 h-12 flex items-center justify-center">
              <img 
                src={logo} 
                alt="Al Sayyeds Logo" 
                className="h-10 w-10 object-contain" 
              />
            </div>
            <span className="font-semibold text-xl">Al Sayyeds</span>
          </div>
          <p className="text-gray-300 text-sm leading-snug">
            Supplier of high-quality mechanical and electrical water pump components for industrial applications.
          </p>
        </div>

        {/* Quick Links */}
        <div className="w-500">
          <h3 className="font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2">
            {[
              { label: "Home", path: "/" },
              { label: "Category", path: "/category" },
              { label: "Products", path: "/products" },
              { label: "About Us", path: "/about" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  onClick={scrollToTop}
                  className="text-gray-200 hover:text-white transition-all"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-white mb-3">Categories</h3>
          <ul className="space-y-2">
            {topCategories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className="text-gray-200 hover:text-white transition-all text-left"
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center">
          <h3 className="font-semibold text-white mb-3">Contact Us</h3>
          <div 
            className="relative cursor-pointer group transition-transform duration-300 hover:scale-105"
            onClick={() => {
              const phoneNumber = "+966535276218";
              const message = "Hello! I'm interested in your electro-mechanical services.";
              const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
            title="Click to contact us on WhatsApp"
          >
            <img
              src="/home/qr.png"
              alt="WhatsApp QR Code - Click to contact us"
              className="rounded-lg shadow-lg w-24 h-24 md:w-32 md:h-32 object-cover border-2 border-red-600/20 group-hover:border-red-600/40 transition-all duration-300"
            />
            {/* Image overlay effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-300"></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-red-600 rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>
          <p className="text-gray-300 text-xs mt-2 text-center">Scan to contact us on WhatsApp</p>
        </div>
          
        </div>
      

      {/* Divider */}
      <div className="border-t border-slate-700 my-6"></div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <p className="text-gray-400 text-xs">
          © 2023 Al Sayyeds Enterprise. All rights reserved.
        </p>
        <div className="flex space-x-4 text-xs">
          <a href="#" className="text-gray-400 hover:text-white transition-all">
            Privacy Policy
          </a>
          <span className="text-gray-500">|</span>
          <a href="#" className="text-gray-400 hover:text-white transition-all">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}