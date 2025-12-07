import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { buildApiUrl, MECHANICAL_SEAL_CATEGORY_NAME } from '../config/api';

export default function Footer() {
  const navigate = useNavigate();
  const [topCategories, setTopCategories] = useState([]);

  // Fetch top 4 categories
  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        const response = await axios.get(buildApiUrl('/api/categories'));
        // Get first 4 categories
        setTopCategories(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching categories for footer:', error);
        // ✅ No toast error - silently fallback to default categories
        setTopCategories([
          { id: 1, name: MECHANICAL_SEAL_CATEGORY_NAME },
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
    <footer className="px-4 py-8 text-white bg-slate-800 md:px-16">
      {/* Top Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col gap-3 items-start">
            <img 
              src="/footer.jpg" 
              alt="Al Sayyed Electro Mech Engineering Logo" 
              className="h-16 md:h-20 w-auto max-w-[213px] md:max-w-[300px] object-contain rounded-lg" 
            />
          </div>
          <p className="text-sm leading-snug text-gray-300">
          Supplier of high-quality motor/l water pump Parts for Domestic, Commercial and industrial applications.
          </p>
        </div>

        {/* Quick Links */}
        <div className="w-500">
          <h3 className="mb-3 font-semibold text-white">Quick Links</h3>
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
                  className="text-gray-200 transition-all hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 font-semibold text-white">Categories</h3>
          <ul className="space-y-2">
            {topCategories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className="text-left text-gray-200 transition-all hover:text-white"
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center">
          <h3 className="mb-3 font-semibold text-white">Contact Us</h3>
          <div 
            className="relative transition-transform duration-300 cursor-pointer group hover:scale-105"
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
              className="object-cover w-24 h-24 rounded-lg border-2 shadow-lg transition-all duration-300 md:w-32 md:h-32 border-red-600/20 group-hover:border-red-600/40"
            />
            {/* Image overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t to-transparent rounded-lg transition-all duration-300 from-black/20 group-hover:from-black/10"></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full opacity-80 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-red-600 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-80"></div>
          </div>
          <p className="mt-2 text-xs text-center text-gray-300">Scan to contact us on WhatsApp</p>
        </div>
          
        </div>
      

      {/* Divider */}
      <div className="my-6 border-t border-slate-700"></div>

      {/* Bottom Bar */}
      <div className="flex flex-col justify-between items-center space-y-2 md:flex-row md:space-y-0">
        <p className="text-xs text-gray-400">
          © 2023 Al Sayyeds Enterprise. All rights reserved.
        </p>
        <div className="flex space-x-4 text-xs">
          <a href="#" className="text-gray-400 transition-all hover:text-white">
            Privacy Policy
          </a>
          <span className="text-gray-500">|</span>
          <a href="#" className="text-gray-400 transition-all hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}