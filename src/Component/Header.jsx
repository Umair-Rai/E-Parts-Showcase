import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Category", path: "/category" },
    { label: "Products", path: "/product" },
    { label: "About Us", path: "/about" },
    { label: "Cart/Query", path: "/cart" },
  ];

  return (
    <header className="bg-black text-white">
      {/* First Row */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="w-[227px]"> {/* fixed width same as company name */}
          <img src="/logo.jpg" alt="Logo" className="h-12 w-[227px]" />
        </div>

        {/* Right Side: Search + Sign In */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex items-center bg-white rounded-full px-3 py-1 w-72">
            <Search className="text-black" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 flex-1 bg-transparent text-black outline-none"
            />
          </div>

          {/* Sign In / Register */}
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1 text-lg font-semibold rounded-full border-2 border-transparent hover:border-white hover:bg-red-600 transition"
          >
            Sign In / Register
          </button>
        </div>
      </div>

      {/* Second Row */}
      <div className="flex items-center justify-between px-6 py-2">
        {/* Company Name (same width as logo above) */}
        <span className="text-xs font-bold text-red-800 px-2 py-1 border-4 rounded-full transition bg-white border-red-800">Al Sayyed Electro Mech Engineering</span>

        {/* Navigation */}
        <nav className="flex gap-4">
          {navItems.map((item) => {
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`px-4 py-1 text-lg font-semibold border-2 rounded-full transition ${
                    "text-white border-transparent hover:bg-red-600 hover:border-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
