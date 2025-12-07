import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { buildApiUrl } from '../config/api';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Base navigation items
  const baseNavItems = [
    { label: "Home", path: "/" },
    { label: "Category", path: "/category" },
    { label: "Products", path: "/product" },
    { label: "About Us", path: "/about" },
  ];

  // Conditional navigation items based on authentication
  const navItems = isAuthenticated 
    ? [...baseNavItems, { label: "Cart/Query", path: "/cart" }]
    : baseNavItems;

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Search functionality
  const fetchSearchSuggestions = async (query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await axios.get(buildApiUrl('/api/products'));
      const allProducts = response.data;
      
      // Filter products based on search query
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      setSearchSuggestions(filteredProducts);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSearchSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSearchSuggestions(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setSearchOpen(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product?search=${encodeURIComponent(product.name)}`);
    setSearchQuery("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSearchOpen(false);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <header className="relative text-white bg-black">
      {/* First Row */}
      <div className="flex justify-between items-center px-4 py-3 sm:px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img 
            src="/logo.png"
            alt="Logo" 
            className="h-8 sm:h-10 md:h-12 w-auto max-w-[150px] sm:max-w-[180px] md:max-w-[227px]" 
          />
        </div>

        {/* Desktop Search and Auth - Hidden on mobile */}
        <div className="hidden gap-4 items-center lg:flex">
          {/* Search */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full px-4 py-0.5 w-56 xl:w-80 focus-within:outline-none focus-within:ring-0">
              <button
                type="submit"
                className="w-4 h-4 text-black transition-colors cursor-pointer outline-none hover:text-gray-600"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onBlur={handleSearchBlur}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                className="flex-1 ml-2 text-sm text-black bg-transparent border-0 outline-none focus:outline-none focus:ring-0"
              />
              {searchLoading && (
                <div className="ml-2 w-4 h-4 rounded-full border-b-2 border-gray-600 animate-spin"></div>
              )}
            </form>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="overflow-y-auto absolute right-0 left-0 top-full z-50 mt-1 max-h-60 bg-white rounded-lg border border-gray-200 shadow-lg">
                {searchSuggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">Product ID: {product.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Authentication-based UI */}
          {isAuthenticated ? (
            <div className="flex gap-2 items-center">
              {/* Cart Button */}
              <button
                onClick={() => navigate('/cart')}
                className="p-2 rounded-full transition hover:bg-red-600"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>


              {/* Profile Icon with Dropdown */}
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="p-2 rounded-full transition hover:bg-red-600"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Register */
            <div className="flex gap-2 items-center">
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 text-sm font-semibold rounded-full border-2 border-transparent transition hover:border-white hover:bg-red-600"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-3 py-1 text-sm font-semibold rounded-full border-2 border-transparent transition hover:border-white hover:bg-red-600"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button and Search Toggle */}
        <div className="flex gap-2 items-center lg:hidden">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-full transition hover:bg-red-600"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile Auth Icons - Show only when authenticated */}
          {isAuthenticated && (
            <>
              <button
                onClick={() => navigate('/cart')}
                className="p-2 rounded-full transition hover:bg-red-600"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Hamburger Menu */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-full transition hover:bg-red-600"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="px-4 pb-3 lg:hidden">
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center px-4 py-1 bg-white rounded-full focus-within:outline-none focus-within:ring-0">
              <button
                type="submit"
                className="w-4 h-4 text-black transition-colors cursor-pointer outline-none hover:text-gray-600"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onBlur={handleSearchBlur}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                className="flex-1 ml-2 text-sm text-black bg-transparent border-0 outline-none focus:outline-none focus:ring-0"
                autoFocus
              />
              {searchLoading && (
                <div className="ml-2 w-4 h-4 rounded-full border-b-2 border-gray-600 animate-spin"></div>
              )}
            </form>
            
            {/* Mobile Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="overflow-y-auto absolute right-0 left-0 top-full z-50 mt-1 max-h-60 bg-white rounded-lg border border-gray-200 shadow-lg">
                {searchSuggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">Product ID: {product.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Second Row - Desktop Navigation */}
      <div className="hidden justify-end items-center px-6 py-2 lg:flex">
        {/* Navigation */}
        <nav className="flex gap-2 xl:gap-4">
          {navItems.map((item) => {
            const isAuthPage = item.path === '/login' || item.path === '/signup';
            const shouldDisable = isAuthenticated && isAuthPage;
            
            return (
              <Link
                key={item.label}
                to={shouldDisable ? '#' : item.path}
                className={`px-3 xl:px-4 py-1 text-sm xl:text-lg font-semibold border-2 rounded-full transition ${
                  shouldDisable 
                    ? "text-gray-500 border-gray-500 cursor-not-allowed"
                    : "text-white border-transparent hover:bg-red-600 hover:border-white"
                }`}
                onClick={(e) => {
                  if (shouldDisable) {
                    e.preventDefault();
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="relative z-50 bg-gray-900 border-t border-gray-700 lg:hidden">
          {/* Navigation Links */}
          <nav className="py-2">
            {navItems.map((item) => {
              const isAuthPage = item.path === '/login' || item.path === '/signup';
              const shouldDisable = isAuthenticated && isAuthPage;
              
              return (
                <Link
                  key={item.label}
                  to={shouldDisable ? '#' : item.path}
                  className={`block px-4 py-3 text-base font-medium transition ${
                    shouldDisable 
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-white hover:bg-red-600 hover:text-white"
                  }`}
                  onClick={(e) => {
                    if (shouldDisable) {
                      e.preventDefault();
                    } else {
                      closeMobileMenu();
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth Section */}
          {!isAuthenticated && (
            <div className="px-4 py-3 border-t border-gray-700">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    navigate("/login");
                    closeMobileMenu();
                  }}
                  className="px-4 py-2 w-full text-sm font-semibold text-red-600 rounded-full border-2 border-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    closeMobileMenu();
                  }}
                  className="px-4 py-2 w-full text-sm font-semibold text-white bg-red-600 rounded-full transition hover:bg-red-700"
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {/* Mobile Profile Section */}
          {isAuthenticated && (
            <div className="px-4 py-3 border-t border-gray-700">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleProfileClick();
                    closeMobileMenu();
                  }}
                  className="px-4 py-2 w-full text-left text-white rounded transition hover:bg-red-600"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="px-4 py-2 w-full text-left text-white rounded transition hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
