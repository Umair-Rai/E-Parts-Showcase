import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Linkedin,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-800 text-white px-4 md:px-16 py-8">
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-white text-slate-900 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
              AS
            </div>
            <span className="font-semibold text-xl">Al Sayyeds</span>
          </div>
          <p className="text-gray-300 text-sm leading-snug">
            Supplier of high-quality mechanical and electrical water pump components for industrial applications.
          </p>
          <div className="flex space-x-3 mt-2">
            {[Facebook, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-all"
                aria-label={Icon.name}
              >
                <Icon className="w-5 h-5 text-white" />
              </a>
            ))}
          </div>
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
            {[
              "Mechanical Seals",
              "Aluminium Pulleys",
              "Water Pump Parts",
              "Generator AVRs",
            ].map((cat) => (
              <li key={cat}>
                <a
                  href="#"
                  className="text-gray-200 hover:text-white transition-all"
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
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