import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, ShoppingCart, MessageSquare, Menu, X } from "lucide-react";
import logo from '../logo.jpg';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuthStatus();
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuthStatus);
    
    // Listen for custom auth events (for same-tab updates)
    window.addEventListener('authStateChanged', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authStateChanged', checkAuthStatus);
    };
  }, []);

  // Also check auth status when location changes (navigation)
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location.pathname]);

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
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setShowProfileDropdown(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'));
    
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
          <div className="flex items-center bg-white rounded-full px-3 py-1 w-48 xl:w-72">
            <Search className="text-black w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 flex-1 bg-transparent text-black outline-none text-sm"
            />
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

              {/* Query Button */}
              <button
                onClick={() => navigate('/query')}
                className="p-2 rounded-full hover:bg-red-600 transition"
                title="Queries"
              >
                <MessageSquare className="w-5 h-5" />
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
              <button
                onClick={() => navigate('/query')}
                className="p-2 rounded-full hover:bg-red-600 transition"
                title="Queries"
              >
                <MessageSquare className="w-5 h-5" />
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
          <div className="flex items-center bg-white rounded-full px-3 py-2">
            <Search className="text-black w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 flex-1 bg-transparent text-black outline-none text-sm"
              autoFocus
            />
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
        <div className="lg:hidden bg-gray-900 border-t border-gray-700">
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
