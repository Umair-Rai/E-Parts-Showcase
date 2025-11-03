import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import logo from '../logo.jpg';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
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
      const response = await axios.get(`https://eme6.com/api/products`);
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
    <header className="bg-black text-white relative">
      {/* First Row */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-8 sm:h-10 md:h-12 w-auto max-w-[150px] sm:max-w-[180px] md:max-w-[227px]" 
          />
        </div>

        {/* Desktop Search and Auth - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full px-4 py-0.5 w-56 xl:w-80 focus-within:outline-none focus-within:ring-0">
              <button
                type="submit"
                className="text-black w-4 h-4 hover:text-gray-600 transition-colors cursor-pointer outline-none"
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
                className="ml-2 flex-1 bg-transparent text-black outline-none focus:outline-none focus:ring-0 border-0 text-sm"
              />
              {searchLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 ml-2"></div>
              )}
            </form>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                {searchSuggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
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
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={() => navigate('/cart')}
                className="p-2 rounded-full hover:bg-red-600 transition"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>


              {/* Profile Icon with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="p-2 rounded-full hover:bg-red-600 transition"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Sign In / Register */
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 text-sm font-semibold rounded-full border-2 border-transparent hover:border-white hover:bg-red-600 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-3 py-1 text-sm font-semibold rounded-full border-2 border-transparent hover:border-white hover:bg-red-600 transition"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button and Search Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-full hover:bg-red-600 transition"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile Auth Icons - Show only when authenticated */}
          {isAuthenticated && (
            <>
              <button
                onClick={() => navigate('/cart')}
                className="p-2 rounded-full hover:bg-red-600 transition"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Hamburger Menu */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-full hover:bg-red-600 transition"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="lg:hidden px-4 pb-3">
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full px-4 py-1 focus-within:outline-none focus-within:ring-0">
              <button
                type="submit"
                className="text-black w-4 h-4 hover:text-gray-600 transition-colors cursor-pointer outline-none"
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
                className="ml-2 flex-1 bg-transparent text-black outline-none focus:outline-none focus:ring-0 border-0 text-sm"
                autoFocus
              />
              {searchLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 ml-2"></div>
              )}
            </form>
            
            {/* Mobile Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                {searchSuggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
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
      <div className="hidden lg:flex items-center justify-between px-6 py-2">
        {/* Company Name - Responsive text */}
        <span className="text-xs xl:text-sm font-bold text-red-800 px-2 py-1 border-2 xl:border-4 rounded-full transition bg-white border-red-800 truncate max-w-xs xl:max-w-none">
          <span className="hidden xl:inline">Al Sayyed Electro Mech Engineering</span>
          <span className="xl:hidden">AS Electro Mech</span>
        </span>

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
        <div className="lg:hidden bg-gray-900 border-t border-gray-700 relative z-50">
          {/* Company Name - Mobile */}
          <div className="px-4 py-3 border-b border-gray-700">
            <span className="text-xs font-bold text-red-400">
              Al Sayyed Electro Mech Engineering
            </span>
          </div>

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
            <div className="border-t border-gray-700 px-4 py-3">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    navigate("/login");
                    closeMobileMenu();
                  }}
                  className="w-full px-4 py-2 text-sm font-semibold rounded-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    closeMobileMenu();
                  }}
                  className="w-full px-4 py-2 text-sm font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {/* Mobile Profile Section */}
          {isAuthenticated && (
            <div className="border-t border-gray-700 px-4 py-3">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleProfileClick();
                    closeMobileMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-red-600 transition rounded"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-red-600 transition rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showProfileDropdown || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowProfileDropdown(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
