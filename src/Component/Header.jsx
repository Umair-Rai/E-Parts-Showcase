// src/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, User, ChevronDown } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState("EN");

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Category", path: "/category" },
    { label: "Products", path: "/products" },
    { label: "About Us", path: "/about" },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between px-4 md:px-8 py-4 bg-black text-white relative z-20">
      {/* Logo + Name */}
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8 bg-white" />
        <span className="font-semibold text-lg">Al Sayyeds Enterprise</span>
      </div>

      {/* Desktop Navigation + Controls container */}
      <div className="hidden md:flex items-center">
        {/* Nav closer to right */}
        <nav className="flex gap-4 items-center mr-24">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="border-2 border-white bg-black text-lg text-red-700 font-bold px-3 py-1 rounded hover:bg-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex items-center">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className={`hover:text-gray-300 transition-transform duration-300 ${
                searchOpen ? "translate-x-0" : ""
              }`}
            >
              <Search />
            </button>
            {searchOpen && (
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 w-48 px-2 py-1 text-black rounded transition-opacity duration-300"
                autoFocus
              />
            )}
          </div>

          {/* User */}
          <button className="hover:text-gray-300">
            <User />
          </button>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 hover:text-gray-300"
            >
              {language}
              <ChevronDown className="w-4 h-4" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-24 bg-white text-black rounded shadow-lg">
                <button
                  onClick={() => {
                    setLanguage("EN");
                    setLangOpen(false);
                  }}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-200"
                >
                  EN
                </button>
                <button
                  onClick={() => {
                    setLanguage("AR");
                    setLangOpen(false);
                  }}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-200"
                >
                  AR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden"
        aria-label="Toggle Menu"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 flex flex-col items-center gap-4 py-4 md:hidden">
          {["Home", "Categories", "About Us", "Contact"].map((label) => (
            <a
              key={label}
              href="#"
              className="border border-white bg-black text-red-700 px-3 py-1 rounded w-11/12 text-center"
            >
              {label}
            </a>
          ))}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="hover:text-gray-300"
            >
              <Search />
            </button>
            {searchOpen && (
              <input
                type="text"
                placeholder="Search..."
                className="w-48 px-2 py-1 text-black rounded"
              />
            )}
          </div>
          <button className="hover:text-gray-300">
            <User />
          </button>
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 hover:text-gray-300"
            >
              {language}
              <ChevronDown className="w-4 h-4" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-24 bg-white text-black rounded shadow-lg">
                <button
                  onClick={() => {
                    setLanguage("EN");
                    setLangOpen(false);
                  }}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-200"
                >
                  EN
                </button>
                <button
                  onClick={() => {
                    setLanguage("AR");
                    setLangOpen(false);
                  }}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-200"
                >
                  AR
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
