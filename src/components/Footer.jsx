import React, { useState } from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white px-4 md:px-16 py-8">
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            <div className="bg-white text-slate-900 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
              AS
            </div>
            <span className="font-semibold text-xl">Al Sayyeds</span>
          </div>
          {/* Tagline */}
          <p className="text-gray-300 text-sm leading-snug">
            Supplier of high-quality mechanical and electrical water pump components for industrial applications.
          </p>
          {/* Social Icons */}
          <div className="flex space-x-3 mt-2">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Twitter, label: "Twitter" },
              { Icon: Linkedin, label: "LinkedIn" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-all"
                aria-label={label}
              >
                <Icon className="w-5 h-5 text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2">
            {["Home", "About Us", "Products", "Contact"].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-gray-200 hover:text-white transition-all"
                >
                  {link}
                </a>
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

        {/* Contact */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white mb-3">Contact Us</h3>
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 mt-0.5 text-gray-300" />
            <span className="text-gray-300 text-sm">
              642-A2, Wapda Town, Gujranwala, PAK
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-300" />
            <a
              href="mailto:alsayyeds@hotmail.com"
              className="text-gray-300 text-sm hover:text-white transition-all"
            >
              alsayyeds@hotmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-300" />
            <a
              href="tel:+921234567890"
              className="text-gray-300 text-sm hover:text-white transition-all"
            >
              +92 123 456 7890
            </a>
          </div>
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
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-all"
          >
            Privacy Policy
          </a>
          <span className="text-gray-500">|</span>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-all"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
